import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../src/business/user.service';
import { CreationUserObject, User, UpdateUserObject } from '../../src/data_acces_layer/create-user.dto';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotFoundException } from '@nestjs/common';

dotenv.config();

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const user = new CreationUserObject();

  const updatedUser = new UpdateUserObject();

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
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(async () => {
    await repository.delete({});

    user.email = 'test@exemple.com';
    user.pseudo = 'test';
    user.password = 'password';
    user.confirmPassword = 'password';

    updatedUser.email = 'test2@exemple.com';
    updatedUser.pseudo = 'test2';
    updatedUser.actualPassword = 'password';
    updatedUser.newPassword = 'password2';
    updatedUser.confirmNewPassword = 'password2';
  });

  it('should create a user', async () => {
    await service.createUser(user);

    const createdUser = await repository.findOne({ where: { email: user.email } });
    const isPasswordValid = await bcrypt.compare(user.password, createdUser?.password || '');

    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toBe(user.email);
    expect(createdUser?.pseudo).toBe(user.pseudo);
    expect(isPasswordValid).toBe(true);
  });

  it('should not create a user with an already existing email', async () => {
    const actualUserWithThisEmail = repository.create(user);
    await repository.save(actualUserWithThisEmail);

    await expect(service.createUser(user)).rejects.toThrow('Email already exists');
  })

  it('should not create a user with a password and a confirm password that do not match', async () => {
    user.confirmPassword = 'password2';
    await expect(service.createUser(user)).rejects.toThrow('Passwords do not match');
  });

  it('should find a user by email', async () => {
    const actualUser = repository.create(user);
    await repository.save(actualUser);

    const foundUser = await service.findByEmail(user.email);

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(user.email);
    expect(foundUser?.pseudo).toBe(user.pseudo);
  });

  it('should not find a non existing user by email', async () => {
    const foundUser = await service.findByEmail('test@test.test');

    expect(foundUser).toBeNull();
  });

  it('should find a user by id', async () => {
    const userToFind = repository.create(user);
    await repository.save(userToFind);

    const foundUser = await service.getUserById(userToFind.id);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(user.email);
    expect(foundUser?.pseudo).toBe(user.pseudo);
    expect(foundUser?.password).toBeUndefined();
  });

  it('should not find a non existing user by id', async () => {
    await expect(service.getUserById(-1)).rejects.toThrow(NotFoundException);
  });

  it('should update a user', async () => {
    user.password = await bcrypt.hash(user.password, 10);
    user.confirmPassword = user.password;
    const userToUpdate = repository.create(user);
    await repository.save(userToUpdate);

    await service.updateUser(userToUpdate.id, updatedUser);

    const foundUser = await repository.findOne({ where: { id: userToUpdate.id } });
    const isPasswordValid = await bcrypt.compare(updatedUser.newPassword!, foundUser?.password || '');

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(updatedUser.email);
    expect(foundUser?.pseudo).toBe(updatedUser.pseudo);
    expect(isPasswordValid).toBe(true);
  });

  it('should not update a non existing user', async () => {
    await expect(service.updateUser(-1, updatedUser)).rejects.toThrow('User does not exist');
  });

  it('should not update a user with an already existing email', async () => {
    const userToUpdate = repository.create(user);
    await repository.save(userToUpdate);

    const secondUser = new CreationUserObject();
    secondUser.email = 'test2@exemple.com';
    secondUser.pseudo = 'test';
    secondUser.password = 'password';

    await repository.save(repository.create(secondUser));

    const updatedUser = new UpdateUserObject();
    updatedUser.email = secondUser.email;

    await expect(service.updateUser(userToUpdate.id, updatedUser)).rejects.toThrow('Email already exists');
  });

  it('should not update a user with an invalid password', async () => {
    user.password = await bcrypt.hash(user.password, 10);
    user.confirmPassword = user.password;
    const userToUpdate = repository.create(user);
    await repository.save(userToUpdate);

    updatedUser.actualPassword = 'password2';

    await expect(service.updateUser(userToUpdate.id, updatedUser)).rejects.toThrow('Invalid password');
  });

  it('should not update a user with a new password and a confirm password that do not match', async () => {
    user.password = await bcrypt.hash(user.password, 10);
    user.confirmPassword = user.password;
    const userToUpdate = repository.create(user);
    await repository.save(userToUpdate);

    updatedUser.actualPassword = 'password';
    updatedUser.confirmNewPassword = 'password3';

    await expect(service.updateUser(userToUpdate.id, updatedUser)).rejects.toThrow('Passwords do not match');
  });

  it('should delete a user', async () => {
    const userToDelete = repository.create(user);
    await repository.save(userToDelete);

    await service.deleteUser(userToDelete.id);

    const foundUser = await repository.findOne({ where: { id: userToDelete.id } });

    expect(foundUser).toBeNull();
  });

  it('should not delete a non existing user', async () => {
    await expect(service.deleteUser(-1)).rejects.toThrow('User does not exist');
  });
});