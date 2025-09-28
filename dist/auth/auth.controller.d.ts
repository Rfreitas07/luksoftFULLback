import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): any;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        resetToken: string;
        resetUrl: string;
        expiresAt: Date;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    validateResetToken(body: {
        token: string;
    }): Promise<{
        message: string;
        email: string;
        valid: boolean;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        message: string;
        isFirstAccess: boolean;
    }>;
}
