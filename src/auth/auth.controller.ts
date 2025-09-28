import { Controller, Post, Body, UseGuards, Get, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // NOVOS ENDPOINTS PARA RECUPERAÇÃO DE SENHA

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }
@Post('validate-reset-token')
validateResetToken(@Body() body: { token: string }) {
  return this.authService.validateResetToken(body.token);
}
  // ENDPOINT UNIFICADO PARA MUDANÇA DE SENHA
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req
  ) {
    return this.authService.changePassword(
      changePasswordDto,
      req.user.userId,
      req.user.role
    );
  }
}