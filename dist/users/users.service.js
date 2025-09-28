"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(userData) {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async findById(id) {
        return this.usersRepository.findOne({ where: { id } });
    }
    async updateAvatar(email, avatarPath) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        user.avatar = avatarPath;
        return await this.usersRepository.save(user);
    }
    async updateProfile(userId, updateData, requestUserId, requestUserRole) {
        if (userId !== requestUserId && requestUserRole !== 'admin') {
            throw new common_1.ForbiddenException('Você não tem permissão para editar este perfil');
        }
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        Object.assign(user, updateData);
        return await this.usersRepository.save(user);
    }
    async getProfile(userId, requestUserId, requestUserRole) {
        if (userId !== requestUserId && requestUserRole !== 'admin') {
            throw new common_1.ForbiddenException('Você não tem permissão para ver este perfil');
        }
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: [
                'id', 'email', 'name', 'avatar', 'birthDate', 'cpf',
                'phone', 'whatsapp', 'street', 'city', 'state',
                'zipCode', 'department', 'position', 'role', 'createdAt'
            ]
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return user;
    }
    async savePasswordResetToken(userId, hashedToken, expiresAt) {
        await this.usersRepository.update(userId, {
            passwordResetToken: hashedToken,
            passwordResetExpires: expiresAt
        });
    }
    async findByPasswordResetToken(token) {
        const users = await this.usersRepository.find({
            where: {
                passwordResetToken: (0, typeorm_2.Not)((0, typeorm_2.IsNull)())
            },
            select: ['id', 'passwordResetToken', 'passwordResetExpires']
        });
        for (const user of users) {
            if (user.passwordResetToken && await bcrypt.compare(token, user.passwordResetToken)) {
                return await this.usersRepository.findOne({ where: { id: user.id } });
            }
        }
        return null;
    }
    async updatePasswordAndClearToken(userId, hashedPassword) {
        await this.usersRepository.update(userId, {
            password: hashedPassword,
            passwordResetToken: undefined,
            passwordResetExpires: undefined,
            lastPasswordChange: new Date(),
            isFirstAccess: false
        });
    }
    async updatePasswordAfterChange(userId, hashedPassword) {
        await this.usersRepository.update(userId, {
            password: hashedPassword,
            lastPasswordChange: new Date(),
            isFirstAccess: false
        });
    }
    validateDate(dateString) {
        const inputDate = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);
        if (inputDate >= tomorrow) {
            throw new common_1.BadRequestException('Não é possível lançar horas para datas futuras (a partir de amanhã)');
        }
    }
    formatMinutes(minutes) {
        if (minutes === 0)
            return '0min';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0 && remainingMinutes > 0) {
            return `${hours}h ${remainingMinutes}min`;
        }
        else if (hours > 0) {
            return `${hours}h`;
        }
        else {
            return `${remainingMinutes}min`;
        }
    }
    async saveTimesheet(userId, data) {
        this.validateDate(data.date);
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const currentData = user.timesheetData || {};
        const dayData = currentData[data.date] || {};
        let dailyTotal = 0;
        Object.keys(dayData).forEach(project => {
            if (project !== data.projectName) {
                dailyTotal += dayData[project] || 0;
            }
        });
        if (dailyTotal + data.minutes > 1440) {
            throw new common_1.BadRequestException(`Limite diário excedido. Já possui ${this.formatMinutes(dailyTotal)} lançado hoje`);
        }
        if (!currentData[data.date]) {
            currentData[data.date] = {};
        }
        currentData[data.date][data.projectName] = data.minutes;
        await this.usersRepository.update({ id: userId }, {
            timesheetData: currentData,
        });
        return {
            date: data.date,
            projectName: data.projectName,
            minutes: data.minutes,
            formattedTime: this.formatMinutes(data.minutes),
            success: true
        };
    }
    async getWeekTimesheet(userId) {
        return this.getWeekTimesheetWithOffset(userId, 0);
    }
    async getWeekTimesheetWithOffset(userId, weekOffset = 0) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'timesheetData', 'weekStatus']
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const today = new Date();
        const weekStart = new Date(today);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff + (weekOffset * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        const timesheetData = user.timesheetData || {};
        const weekStatus = user.weekStatus || {};
        const currentWeekStatus = weekStatus[weekStartStr] || 'draft';
        const weekData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = timesheetData[dateStr] || {};
            weekData.push({
                date: dateStr,
                projects: dayData
            });
        }
        return {
            weekStart: weekStartStr,
            weekEnd: weekEndStr,
            weekStatus: currentWeekStatus,
            data: weekData
        };
    }
    async updateWeekStatus(userId, data, requestUserRole) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (data.status === 'locked' && requestUserRole !== 'admin') {
            throw new common_1.ForbiddenException('Apenas administradores podem bloquear semanas');
        }
        const weekStatus = user.weekStatus || {};
        weekStatus[data.weekStart] = data.status;
        await this.usersRepository.update({ id: userId }, {
            weekStatus: weekStatus,
        });
        return {
            weekStart: data.weekStart,
            status: data.status,
            success: true
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map