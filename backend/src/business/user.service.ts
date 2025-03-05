import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { creationUserObject, User } from '../data_acces_layer/create-user.dto';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(creationUserObject: creationUserObject): Promise<Partial<User>> {
    const { email, pseudo, password } = creationUserObject;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, pseudo, password: hashedPassword });
    const savedUser = await this.userRepository.save(user);
    return omit(savedUser, ['password']);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}