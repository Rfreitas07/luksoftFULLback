import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './update-profile.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(userData: Partial<User>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    updateAvatar(email: string, avatarPath: string): Promise<User>;
    updateProfile(userId: number, updateData: UpdateProfileDto, requestUserId: number, requestUserRole: string): Promise<User>;
    getProfile(userId: number, requestUserId: number, requestUserRole: string): Promise<User>;
}
