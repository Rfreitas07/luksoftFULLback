import { IsString, IsNotEmpty, IsDateString, IsIn } from 'class-validator';

export class UpdateWeekStatusDto {
  @IsDateString()
  @IsNotEmpty()
  weekStart: string; // formato: "2025-09-16"

  @IsString()
  @IsIn(['draft', 'submitted', 'locked'])
  status: 'draft' | 'submitted' | 'locked';
}