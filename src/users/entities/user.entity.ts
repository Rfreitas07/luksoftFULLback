import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
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
}