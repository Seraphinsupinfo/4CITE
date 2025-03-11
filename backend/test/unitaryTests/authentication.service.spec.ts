import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CreationUserObject, User, UpdateUserObject } from '../../src/data_acces_layer/create-user.dto';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { AuthService } from '../../src/business/auth.service';
import { UserService } from '../../src/business/user.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

dotenv.config();

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let repository: Repository<User>;

  const user = new CreationUserObject();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST as string,
          port: parseInt(process.env.TEST_DB_PORT as string, 10),
          username: process.env.TEST_DB_USERNAME as string,
          password: process.env.TEST_DB_PASSWORD as string,
          database: process.env.TEST_DB_DATABASE as string,
          entities: [User],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AuthService, UserService, JwtService],
    }).compile();

    userService = module.get<UserService>(UserService);
    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(async () => {
    await repository.delete({});

    user.email = 'test@exemple.com';
    user.pseudo = 'test';
    user.password = 'password';
    user.confirmPassword = 'password';
  });

  it('should validate an user exists and have the correct password', async () => {
    await userService.createUser(user);

    const isValid = await service.validateUser(user.email, user.password);

    expect(isValid).not.toBeNull();
  });

  it('should not validate an user exists and have the incorrect password', async () => {
    await userService.createUser(user);

    await expect(service.validateUser(user.email, 'wrongPassword')).rejects.toThrow(UnauthorizedException);
  });
});