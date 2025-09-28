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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, name: user.name },
        };
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const isFirstAccess = user.isFirstAccess || loginDto.password === '123456';
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isFirstAccess
            },
        };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.usersService.savePasswordResetToken(user.id, hashedToken, expiresAt);
        const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
        return {
            message: 'Token gerado com sucesso',
            resetToken,
            resetUrl,
            expiresAt
        };
    }
    async validateResetToken(token) {
        const user = await this.usersService.findByPasswordResetToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Token inválido');
        }
        if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new common_1.BadRequestException('Token expirado');
        }
        return {
            message: 'Token válido',
            email: user.email,
            valid: true
        };
    }
    async resetPassword(token, newPassword) {
        const user = await this.usersService.findByPasswordResetToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Token inválido ou expirado');
        }
        if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new common_1.BadRequestException('Token expirado');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePasswordAndClearToken(user.id, hashedPassword);
        return {
            message: 'Senha alterada com sucesso'
        };
    }
    async changePassword(data, requestUserId, requestUserRole) {
        const targetUserId = data.targetUserId || requestUserId;
        const user = await this.usersService.findById(targetUserId);
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (targetUserId !== requestUserId && requestUserRole !== 'admin') {
            throw new common_1.UnauthorizedException('Você não tem permissão para alterar a senha deste usuário');
        }
        if (data.isFirstAccess || user.isFirstAccess) {
            if (data.currentPassword && !(await bcrypt.compare(data.currentPassword, user.password))) {
                throw new common_1.BadRequestException('Senha atual incorreta');
            }
        }
        else {
            if (targetUserId === requestUserId && !data.currentPassword) {
                throw new common_1.BadRequestException('Senha atual é obrigatória');
            }
            if (data.currentPassword && !(await bcrypt.compare(data.currentPassword, user.password))) {
                throw new common_1.BadRequestException('Senha atual incorreta');
            }
        }
        if (data.newPassword === '123456') {
            throw new common_1.BadRequestException('Nova senha não pode ser "123456"');
        }
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await this.usersService.updatePasswordAfterChange(targetUserId, hashedPassword);
        return {
            message: 'Senha alterada com sucesso',
            isFirstAccess: false
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map