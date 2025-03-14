import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreationUserObject, UpdateUserObject, User } from '../data_acces_layer/create-user.dto';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userToCreate: CreationUserObject): Promise<Partial<User>> {
    const { email, pseudo, password, confirmPassword } = userToCreate;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (password != confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, pseudo, password: hashedPassword });
    const savedUser = await this.userRepository.save(user);
    return omit(savedUser, ['password']);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getUserById(id: number): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return omit(user, ['password']);
  }

  async updateUser(id: number, updatedUser: UpdateUserObject): Promise<Partial<User> | null> {
    const { email, pseudo, actualPassword, newPassword, confirmNewPassword } = updatedUser;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (user?.email != email) {
      const alreadyExistingEmail = await this.userRepository.findOne({ where: { email: email } });
      if (alreadyExistingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    const isPasswordValid = await bcrypt.compare(actualPassword, user?.password || '');
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    if (newPassword != null) {
      if (newPassword !== confirmNewPassword) {
        throw new BadRequestException('Passwords do not match');
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.update(id, { email, pseudo, password: hashedNewPassword });
    } else {
      await this.userRepository.update(id, { email, pseudo });
    }

    const updatedUserData = await this.userRepository.findOne({ where: { id } });
    return updatedUserData ? omit(updatedUserData, ['password']) : null;
  }

  async deleteUser(id: number): Promise<void> {
    if (!(await this.userRepository.findOne({ where: { id } }))) {
      throw new BadRequestException('User does not exist');
    }
    await this.userRepository.delete(id);
  }
}