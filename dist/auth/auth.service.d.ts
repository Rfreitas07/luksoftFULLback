import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string;
            isFirstAccess: boolean;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        resetToken: string;
        resetUrl: string;
        expiresAt: Date;
    }>;
    validateResetToken(token: string): Promise<{
        message: string;
        email: string;
        valid: boolean;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(data: ChangePasswordDto, requestUserId: number, requestUserRole: string): Promise<{
        message: string;
        isFirstAccess: boolean;
    }>;
}
