// change-password.dto.ts
import { IsNotEmpty, IsString, Matches, MinLength, IsOptional, IsNumber } from 'class-validator';

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Senha deve conter pelo menos 8 caracteres, incluindo letras e números'
  })
  @Matches(/^(?!.*123456).*$/, {
    message: 'Nova senha não pode ser "123456"'
  })
  newPassword: string;

  @IsOptional()
  @IsNumber()
  targetUserId?: number; // Para admin alterar senha de outros usuários

  @IsOptional()
  isFirstAccess?: boolean; // Flag para identificar primeiro acesso
}