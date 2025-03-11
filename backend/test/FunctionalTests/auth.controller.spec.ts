import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../src/business/user.service';
import { Role, User } from '../../src/data_acces_layer/create-user.dto';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import * as bcrypt from 'bcryptjs';
import { JwtModule, JwtService } from '@nestjs/jwt';

dotenv.config();

describe('UserController', () => {
  let repository: Repository<User>;
  let app: INestApplication;
  let jwtService: JwtService;

  const user = new User();

  beforeAll(async () => {
    jest.setTimeout(30000);
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
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [UserService],
    }).compile();

    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  }, 30000);

  beforeEach(async () => {
    await repository.delete({});

    user.email = 'test@exemple.com';
    user.pseudo = 'test';
    user.password = bcrypt.hashSync('password', 12);
    user.role = Role.USER;

    await repository.save(user);
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

  it('should get a token with user informations', async () => {
    await logErrorResponse(
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: 'password' })
        .expect((res) => {
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('access_token');

          const decodedToken = jwtService.decode(res.body.access_token);

          expect(decodedToken).toHaveProperty('id', user.id);
          expect(decodedToken).toHaveProperty('pseudo', user.pseudo);
          expect(decodedToken).toHaveProperty('role', user.role);
        })
    );
  });
});