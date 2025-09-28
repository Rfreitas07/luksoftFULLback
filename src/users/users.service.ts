/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './update-profile.dto';
import { SaveTimesheetDto } from './timesheet.dto';
import { UpdateWeekStatusDto } from './week-status.dto';
import { GetWeekTimesheetDto } from './timesheet.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // MÉTODO NOVO
  async updateAvatar(email: string, avatarPath: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.avatar = avatarPath;
    
    return await this.usersRepository.save(user);
  }

  // MÉTODO NOVO
  async updateProfile(
    userId: number, 
    updateData: UpdateProfileDto, 
    requestUserId: number, 
    requestUserRole: string
  ): Promise<User> {
    if (userId !== requestUserId && requestUserRole !== 'admin') {
      throw new ForbiddenException('Você não tem permissão para editar este perfil');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    Object.assign(user, updateData);
    
    return await this.usersRepository.save(user);
  }

  // MÉTODO NOVO
  async getProfile(userId: number, requestUserId: number, requestUserRole: string): Promise<User> {
    if (userId !== requestUserId && requestUserRole !== 'admin') {
      throw new ForbiddenException('Você não tem permissão para ver este perfil');
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
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // MÉTODOS PARA AUTENTICAÇÃO AVANÇADA
  async savePasswordResetToken(userId: number, hashedToken: string, expiresAt: Date): Promise<void> {
    await this.usersRepository.update(userId, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt
    });
  }

  // Método para encontrar usuário por token de reset - CORRIGIDO
  async findByPasswordResetToken(token: string): Promise<User | null> {
    const users = await this.usersRepository.find({
      where: { 
        passwordResetToken: Not(IsNull()) // CORRIGIDO: usar Not(IsNull())
      },
      select: ['id', 'passwordResetToken', 'passwordResetExpires']
    });

    // Verificar qual token corresponde (comparando hash)
    for (const user of users) {
      if (user.passwordResetToken && await bcrypt.compare(token, user.passwordResetToken)) {
        return await this.usersRepository.findOne({ where: { id: user.id } });
      }
    }

    return null;
  }

  // Método para atualizar senha e limpar token de reset - CORRIGIDO
  async updatePasswordAndClearToken(userId: number, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(userId, {
      password: hashedPassword,
      passwordResetToken: undefined, // CORRIGIDO: usar undefined
      passwordResetExpires: undefined, // CORRIGIDO: usar undefined
      lastPasswordChange: new Date(),
      isFirstAccess: false
    });
  }

  // Método para atualizar senha após mudança normal
  async updatePasswordAfterChange(userId: number, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(userId, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
      isFirstAccess: false
    });
  }

  private validateDate(dateString: string): void {
    const inputDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // início de amanhã
    
    inputDate.setHours(0, 0, 0, 0); // normalizar input
      
    if (inputDate >= tomorrow) {
      throw new BadRequestException('Não é possível lançar horas para datas futuras (a partir de amanhã)');
    }
  }

  private formatMinutes(minutes: number): string {
    if (minutes === 0) return '0min';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}min`;
    }
  }

  async saveTimesheet(userId: number, data: SaveTimesheetDto): Promise<any> {
    this.validateDate(data.date);

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const currentData = user.timesheetData || {};
    const dayData = currentData[data.date] || {};
    
    // Verificar limite diário
    let dailyTotal = 0;
    Object.keys(dayData).forEach(project => {
      if (project !== data.projectName) {
        dailyTotal += dayData[project] || 0;
      }
    });

    if (dailyTotal + data.minutes > 1440) {
      throw new BadRequestException(`Limite diário excedido. Já possui ${this.formatMinutes(dailyTotal)} lançado hoje`);
    }

    // Atualizar dados
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

  async getWeekTimesheet(userId: number): Promise<any> {
    return this.getWeekTimesheetWithOffset(userId, 0);
  }

  // Método para obter timesheet com offset de semana
  async getWeekTimesheetWithOffset(userId: number, weekOffset: number = 0): Promise<any> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'timesheetData', 'weekStatus']
    });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const today = new Date();
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff + (weekOffset * 7)); // Aplica o offset
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const timesheetData = user.timesheetData || {};
    const weekStatus = user.weekStatus || {};
    const currentWeekStatus = weekStatus[weekStartStr] || 'draft';
    
    const weekData: any[] = [];

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

  // Método para atualizar status da semana
  async updateWeekStatus(userId: number, data: UpdateWeekStatusDto, requestUserRole: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Apenas admins podem bloquear/desbloquear semanas
    if (data.status === 'locked' && requestUserRole !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem bloquear semanas');
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
}