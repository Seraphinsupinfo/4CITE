import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../src/business/user.service';
import { CreationUserObject, Role, UpdateUserObject, User } from '../../src/data_acces_layer/create-user.dto';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import bcrypt from 'bcryptjs/umd/types';

dotenv.config();

describe('UserService', () => {
  let repository: Repository<User>;
  let app: INestApplication;

  const user = new CreationUserObject();
  const updatedUser = new UpdateUserObject();
  const adminUser = new User();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

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
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [UserService],
    }).compile();

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

    adminUser.email = 'admin@admin.com';
    adminUser.pseudo = 'admin';
    adminUser.password = bcrypt.hashSync('admin', 10);
    adminUser.role = Role.ADMIN;

    await repository.save(adminUser);
  });

  const logErrorResponse = async (req) => {
    try {
      return await req;
    } catch (error) {
      console.log('Test failed with error:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Body:', error.response.body);
      } else {
        console.log(error);
      }
      throw error;
    }
  };

  it('should create a user', async () => {
    await logErrorResponse(
      request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect((res) => {
          console.log('Response body:', res.body);
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('email', 'test@exemple.com');
          expect(res.body).toHaveProperty('pseudo', 'test');
          expect(res.body).toHaveProperty('id');
        })
    );
  });

  it('should get user by id', async () => {
    await logErrorResponse(
      request(app.getHttpServer())
        .get('/users')
        .send(user)
        .expect(201)
    );


  });
});