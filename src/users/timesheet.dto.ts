import { IsString, IsNotEmpty, IsDateString, IsInt, Min, Max, IsOptional } from 'class-validator';
export class SaveTimesheetDto {
  @IsDateString()
  @IsNotEmpty()
  date: string; // formato: "2025-09-26"

  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsInt()
  @Min(0)
  @Max(1440) // máximo 24h por dia (1440 minutos)
  minutes: number;
}
export class GetWeekTimesheetDto {
  @IsOptional()
  @IsInt()
  @Min(-52) // até 1 ano atrás
  @Max(4)   // até 1 mês à frente
  weekOffset?: number = 0; // 0 = semana atual, -1 = anterior, +1 = próxima
}