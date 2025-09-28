/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Post,
  Put,
  Param,
  UseGuards, 
  Request,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadAvatarDto } from './upload-avatar.dto';
import { UpdateProfileDto } from './update-profile.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SaveTimesheetDto } from './timesheet.dto';
import { UpdateWeekStatusDto } from './week-status.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Endpoint básico para buscar perfil atual (já existe)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Novo endpoint para buscar perfil por ID com validação de permissão
  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getProfileById(
    @Param('id', ParseIntPipe) userId: number,
    @Request() req
  ) {
    return this.usersService.getProfile(
      userId, 
      req.user.userId, 
      req.user.role
    );
  }

  // Novo endpoint para atualizar perfil
  @UseGuards(JwtAuthGuard)
  @Put('profile/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req
  ) {
    return this.usersService.updateProfile(
      userId,
      updateProfileDto,
      req.user.userId,
      req.user.role
    );
  }

  // Upload de avatar (método já existente, mantido)
  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, callback) => {
        const timestamp = Date.now();
        const fileExtension = extname(file.originalname);
        const filename = `temp_${timestamp}${fileExtension}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new BadRequestException('Apenas arquivos JPG, JPEG e PNG são permitidos'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  }))
  async uploadAvatar(
    @UploadedFile() file: any,
    @Body() uploadAvatarDto: UploadAvatarDto,
  ) {
    console.log('Upload recebido:', { file: !!file, email: uploadAvatarDto.email });
    
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (!uploadAvatarDto.email) {
      throw new BadRequestException('Email é obrigatório');
    }

    // Renomear arquivo com email
    const fs = require('fs');
    const path = require('path');
    const sanitizedEmail = uploadAvatarDto.email.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExtension = extname(file.originalname);
    const newFilename = `${sanitizedEmail}${fileExtension}`;
    const oldPath = file.path;
    const newPath = path.join('./uploads/avatars', newFilename);
    
    fs.renameSync(oldPath, newPath);

    const avatarPath = `/uploads/avatars/${newFilename}`;
    
    const updatedUser = await this.usersService.updateAvatar(
      uploadAvatarDto.email, 
      avatarPath
    );

    return {
      message: 'Avatar atualizado com sucesso',
      avatarPath: avatarPath,
      user: updatedUser,
    };
  }

  // Endpoints de Timesheet
  @UseGuards(JwtAuthGuard)
  @Put('timesheet')
  async saveTimesheet(
    @Request() req,
    @Body() saveTimesheetDto: SaveTimesheetDto,
  ) {
    const userId = Number(req.user.userId);
    return this.usersService.saveTimesheet(userId, saveTimesheetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('timesheet')
  async getWeekTimesheet(
    @Request() req,
    @Query('weekOffset') weekOffset?: string
  ) {
    const userId = Number(req.user.userId);
    const offset = weekOffset ? Number(weekOffset) : 0;
    
    console.log('DEBUG: weekOffset recebido:', weekOffset);
    console.log('DEBUG: offset convertido:', offset);
    
    return this.usersService.getWeekTimesheetWithOffset(userId, offset);
  }

  // Novo endpoint para atualizar status da semana
  @UseGuards(JwtAuthGuard)
  @Post('timesheet/week-status')
  async updateWeekStatus(
    @Request() req,
    @Body() updateWeekStatusDto: UpdateWeekStatusDto,
  ) {
    const userId = Number(req.user.userId);
    
    return this.usersService.updateWeekStatus(
      userId, 
      updateWeekStatusDto, 
      req.user.role
    );
  }

  @Get('test-timesheet')
  async testTimesheet() {
    return { message: 'Timesheet endpoint funcionando', timestamp: new Date() };
  }
}