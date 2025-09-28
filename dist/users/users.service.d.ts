import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './update-profile.dto';
import { SaveTimesheetDto } from './timesheet.dto';
import { UpdateWeekStatusDto } from './week-status.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(userData: Partial<User>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    updateAvatar(email: string, avatarPath: string): Promise<User>;
    updateProfile(userId: number, updateData: UpdateProfileDto, requestUserId: number, requestUserRole: string): Promise<User>;
    getProfile(userId: number, requestUserId: number, requestUserRole: string): Promise<User>;
    savePasswordResetToken(userId: number, hashedToken: string, expiresAt: Date): Promise<void>;
    findByPasswordResetToken(token: string): Promise<User | null>;
    updatePasswordAndClearToken(userId: number, hashedPassword: string): Promise<void>;
    updatePasswordAfterChange(userId: number, hashedPassword: string): Promise<void>;
    private validateDate;
    private formatMinutes;
    saveTimesheet(userId: number, data: SaveTimesheetDto): Promise<any>;
    getWeekTimesheet(userId: number): Promise<any>;
    getWeekTimesheetWithOffset(userId: number, weekOffset?: number): Promise<any>;
    updateWeekStatus(userId: number, data: UpdateWeekStatusDto, requestUserRole: string): Promise<any>;
}
