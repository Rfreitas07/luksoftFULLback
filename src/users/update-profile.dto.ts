import { IsOptional, IsString, IsEmail, IsDateString, Matches, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos' })
  cpf?: string;

  @IsOptional()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, { 
    message: 'Telefone deve estar no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx' 
  })
  phone?: string;

  @IsOptional()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, { 
    message: 'WhatsApp deve estar no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx' 
  })
  whatsapp?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres (ex: SP)' })
  state?: string;

  @IsOptional()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve estar no formato xxxxx-xxx' })
  zipCode?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;
}