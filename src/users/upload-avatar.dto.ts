import { IsString } from 'class-validator';

export class UploadAvatarDto {
  @IsString()
  email: string;
}
