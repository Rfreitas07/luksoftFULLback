"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const upload_avatar_dto_1 = require("./upload-avatar.dto");
const update_profile_dto_1 = require("./update-profile.dto");
const multer_1 = require("multer");
const path_1 = require("path");
const timesheet_dto_1 = require("./timesheet.dto");
const week_status_dto_1 = require("./week-status.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        return this.usersService.findById(req.user.userId);
    }
    async getProfileById(userId, req) {
        return this.usersService.getProfile(userId, req.user.userId, req.user.role);
    }
    async updateProfile(userId, updateProfileDto, req) {
        return this.usersService.updateProfile(userId, updateProfileDto, req.user.userId, req.user.role);
    }
    async uploadAvatar(file, uploadAvatarDto) {
        console.log('Upload recebido:', { file: !!file, email: uploadAvatarDto.email });
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo foi enviado');
        }
        if (!uploadAvatarDto.email) {
            throw new common_1.BadRequestException('Email é obrigatório');
        }
        const fs = require('fs');
        const path = require('path');
        const sanitizedEmail = uploadAvatarDto.email.replace(/[^a-zA-Z0-9]/g, '_');
        const fileExtension = (0, path_1.extname)(file.originalname);
        const newFilename = `${sanitizedEmail}${fileExtension}`;
        const oldPath = file.path;
        const newPath = path.join('./uploads/avatars', newFilename);
        fs.renameSync(oldPath, newPath);
        const avatarPath = `/uploads/avatars/${newFilename}`;
        const updatedUser = await this.usersService.updateAvatar(uploadAvatarDto.email, avatarPath);
        return {
            message: 'Avatar atualizado com sucesso',
            avatarPath: avatarPath,
            user: updatedUser,
        };
    }
    async saveTimesheet(req, saveTimesheetDto) {
        const userId = Number(req.user.userId);
        return this.usersService.saveTimesheet(userId, saveTimesheetDto);
    }
    async getWeekTimesheet(req, weekOffset) {
        const userId = Number(req.user.userId);
        const offset = weekOffset ? Number(weekOffset) : 0;
        console.log('DEBUG: weekOffset recebido:', weekOffset);
        console.log('DEBUG: offset convertido:', offset);
        return this.usersService.getWeekTimesheetWithOffset(userId, offset);
    }
    async updateWeekStatus(req, updateWeekStatusDto) {
        const userId = Number(req.user.userId);
        return this.usersService.updateWeekStatus(userId, updateWeekStatusDto, req.user.role);
    }
    async testTimesheet() {
        return { message: 'Timesheet endpoint funcionando', timestamp: new Date() };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfileById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('profile/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_profile_dto_1.UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('upload-avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/avatars',
            filename: (req, file, callback) => {
                const timestamp = Date.now();
                const fileExtension = (0, path_1.extname)(file.originalname);
                const filename = `temp_${timestamp}${fileExtension}`;
                callback(null, filename);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return callback(new common_1.BadRequestException('Apenas arquivos JPG, JPEG e PNG são permitidos'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_avatar_dto_1.UploadAvatarDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('timesheet'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, timesheet_dto_1.SaveTimesheetDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "saveTimesheet", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('timesheet'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('weekOffset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWeekTimesheet", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('timesheet/week-status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, week_status_dto_1.UpdateWeekStatusDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateWeekStatus", null);
__decorate([
    (0, common_1.Get)('test-timesheet'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "testTimesheet", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map