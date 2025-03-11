import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { optionalRequire } from '@nestjs/core/helpers/optional-require';

export enum Role {
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

export class CreationUserObject {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'user123', description: 'The pseudo of the user' })
  @IsString({ message: 'Pseudo must be a string' })
  pseudo: string;

  @ApiProperty({ example: 'Password123!', description: 'The password of the user' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password too weak',
  })
  password: string;

  @ApiProperty({ example: 'Password123!', description: 'The confirmation of the password' })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}

export class UpdateUserObject {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiProperty({ example: 'user123', description: 'The pseudo of the user' })
  @IsString({ message: 'Pseudo must be a string' })
  pseudo?: string;

  @ApiProperty({ example: 'Password123!', description: 'The current password of the user' })
  @IsString({ message: 'Current password must be a string' })
  actualPassword: string;

  @ApiProperty({ example: 'Password123!', description: 'The new password of the user' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password too weak',
  })
  @IsOptional()
  newPassword: string | undefined;

  @ApiProperty({ example: 'Password123!', description: 'The confirmation of the new password' })
  @IsString({ message: 'Confirm new password must be a string' })
  @IsOptional()
  confirmNewPassword: string | undefined;
}