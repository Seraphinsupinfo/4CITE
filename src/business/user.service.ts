import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { creationUserObject, User } from '../data_acces_layer/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(creationUserObject: creationUserObject): Promise<User> {
    const { email, pseudo, password } = creationUserObject;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.userRepository.create({ email, pseudo, password });
    return this.userRepository.save(user);
  }
}