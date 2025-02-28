import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  pseudo: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
}

export class creationUserObject {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString({ message: 'Pseudo must be a string' })
  pseudo: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}