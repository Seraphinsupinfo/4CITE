import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../src/business/user.service';
import { CreationUserObject, Role, UpdateUserObject, User } from '../../src/data_acces_layer/create-user.dto';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import * as bcrypt from 'bcryptjs';
import { logErrorResponse } from './logErrorResponse';

dotenv.config();

describe('UserController', () => {
  let repository: Repository<User>;
  let app: INestApplication;
  let jwtService: JwtService;

  const user = new CreationUserObject();
  const updatedUser = new UpdateUserObject();
  const adminUser = new User();

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

      repository = module.get<Repository<User>>(getRepositoryToken(User));
      jwtService = module.get<JwtService>(JwtService);
    }, 30000);

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

  it('should create a user', async () => {
    await logErrorResponse(
      request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect((res) => {
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('email', 'test@exemple.com');
          expect(res.body).toHaveProperty('pseudo', 'test');
          expect(res.body).toHaveProperty('id');
        })
    );
  });

  it('should get user by id', async () => {
    user.password = bcrypt.hashSync('password', 10);
    const createdUser = await repository.save(user);

    const infos =  { id: createdUser.id, pseudo: createdUser.pseudo, role: createdUser.role };
    const token = jwtService.sign(infos);

    await request(app.getHttpServer())
      .get(`/users/${createdUser.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', createdUser.id);
        expect(res.body).toHaveProperty('email', user.email);
        expect(res.body).toHaveProperty('pseudo', user.pseudo);
        expect(res.body).toHaveProperty('role', createdUser.role);
      });
  });

  it('should get user by id with admin', async () => {
    user.password = bcrypt.hashSync('password', 10);
    const createdUser = await repository.save(user);
    const createdAdminUser = await repository.save(adminUser);

    const infos =  { id: createdAdminUser.id, pseudo: createdAdminUser.pseudo, role: createdAdminUser.role };
    const token = jwtService.sign(infos);

    await logErrorResponse(
      request(app.getHttpServer())
        .get(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('id', createdUser.id);
          expect(res.body).toHaveProperty('email', createdUser.email);
          expect(res.body).toHaveProperty('pseudo', createdUser.pseudo);
          expect(res.body).toHaveProperty('role', createdUser.role);
        })
    );
  });

  it('should update a user', async () => {
    user.password = bcrypt.hashSync('password', 10);
    const createdUser = await repository.save(user);

    const infos = { id: createdUser.id, pseudo: createdUser.pseudo, role: createdUser.role };
    const token = jwtService.sign(infos);

    await logErrorResponse(
      request(app.getHttpServer())
        .put(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUser)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('email', updatedUser.email);
          expect(res.body).toHaveProperty('pseudo', updatedUser.pseudo);
          expect(res.body).toHaveProperty('id', createdUser.id);
        })
    );
  });

  it('should update a user with admin', async () => {
    user.password = bcrypt.hashSync('password', 10);
    const createdUser = await repository.save(user);
    const createdAdminUser = await repository.save(adminUser);

    const infos =  { id: createdAdminUser.id, pseudo: createdAdminUser.pseudo, role: createdAdminUser.role };
    const token = jwtService.sign(infos);

    await logErrorResponse(
      request(app.getHttpServer())
        .put(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUser)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('email', updatedUser.email);
          expect(res.body).toHaveProperty('pseudo', updatedUser.pseudo);
          expect(res.body).toHaveProperty('id', createdUser.id);
        })
    );
  });

  it('should delete a user', async () => {
    user.password = bcrypt.hashSync('password', 10);
    const createdUser = await repository.save(user);

    const infos = { id: createdUser.id, pseudo: createdUser.pseudo, role: createdUser.role };
    const token = jwtService.sign(infos);

    await logErrorResponse(
      request(app.getHttpServer())
        .delete(`/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('message', 'User has been successfully deleted');
        })
    )
  });
});