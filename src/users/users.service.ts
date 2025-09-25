import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './update-profile.dto';

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
}