import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
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

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // DETECTAR PRIMEIRO ACESSO (senha padrão "123456")
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

  // RECUPERAÇÃO DE SENHA - GERA TOKEN
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Expiração em 24 horas
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Salvar token hasheado no banco
    await this.usersService.savePasswordResetToken(user.id, hashedToken, expiresAt);

    // RETORNAR TOKEN PARA FRONTEND (apenas desenvolvimento)
    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
    
    return {
      message: 'Token gerado com sucesso',
      resetToken, // Token em texto plano para desenvolvimento
      resetUrl,
      expiresAt
    };
  }

  // VALIDAR TOKEN SEM ALTERAR SENHA (NOVO MÉTODO)
  async validateResetToken(token: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Token inválido');
    }

    // Verificar se token não expirou
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    return {
      message: 'Token válido',
      email: user.email,
      valid: true
    };
  }

  // RESET DE SENHA COM TOKEN
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Verificar se token não expirou
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token
    await this.usersService.updatePasswordAndClearToken(user.id, hashedPassword);

    return {
      message: 'Senha alterada com sucesso'
    };
  }

  // MUDANÇA DE SENHA UNIFICADA
  async changePassword(data: ChangePasswordDto, requestUserId: number, requestUserRole: string) {
    const targetUserId = data.targetUserId || requestUserId;
    const user = await this.usersService.findById(targetUserId);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar permissões
    if (targetUserId !== requestUserId && requestUserRole !== 'admin') {
      throw new UnauthorizedException('Você não tem permissão para alterar a senha deste usuário');
    }

    // LÓGICA PARA PRIMEIRO ACESSO
    if (data.isFirstAccess || user.isFirstAccess) {
      // Para primeiro acesso, verificar se senha atual é "123456"
      if (data.currentPassword && !(await bcrypt.compare(data.currentPassword, user.password))) {
        throw new BadRequestException('Senha atual incorreta');
      }
    } else {
      // Para mudança normal, sempre exigir senha atual (exceto admin alterando outros)
      if (targetUserId === requestUserId && !data.currentPassword) {
        throw new BadRequestException('Senha atual é obrigatória');
      }
      
      if (data.currentPassword && !(await bcrypt.compare(data.currentPassword, user.password))) {
        throw new BadRequestException('Senha atual incorreta');
      }
    }

    // Verificar se nova senha não é "123456"
    if (data.newPassword === '123456') {
      throw new BadRequestException('Nova senha não pode ser "123456"');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Atualizar senha e marcar que não é mais primeiro acesso
    await this.usersService.updatePasswordAfterChange(targetUserId, hashedPassword);

    return {
      message: 'Senha alterada com sucesso',
      isFirstAccess: false
    };
  }
}