import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ length: 11, nullable: true })
  cpf?: string;

  @Column({ length: 15, nullable: true })
  phone?: string;

  @Column({ length: 15, nullable: true })
  whatsapp?: string;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ length: 8, nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  // Campos de timesheet existentes (mantidos)
  @Column({ type: 'jsonb', nullable: true })
  timesheetData?: any;

  @Column({ default: 0 })
  currentWeekHours?: number;

  @Column({ default: 480 })
  dailyTargetMinutes?: number;

  @Column({ type: 'date', nullable: true })
  currentWeekStart?: Date;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  weekStatus?: Record<string, string>;

  // NOVOS CAMPOS PARA AUTENTICAÇÃO AVANÇADA
  @Column({ default: true })
  isFirstAccess: boolean;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChange?: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}