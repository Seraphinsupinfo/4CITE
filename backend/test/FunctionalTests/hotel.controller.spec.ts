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
import { Hotel } from '../../src/data_acces_layer/create-hotel.dto';
import { HotelService } from '../../src/business/hotel.service';
import { logErrorResponse } from './logErrorResponse';

dotenv.config();

describe('UserController', () => {
  let userRepository: Repository<User>;
  let hotelRepository: Repository<Hotel>;
  let app: INestApplication;
  let jwtService: JwtService;

  const user = new User();
  const adminUser = new User();

  const hotel = new Hotel();
  const updateHotel = new Hotel();

  let userToken: string;
  let adminToken: string;

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
          entities: [User, Hotel],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([User, Hotel]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [UserService, HotelService],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hotelRepository = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
    jwtService = module.get<JwtService>(JwtService);
  }, 30000);

  beforeEach(async () => {
    await userRepository.delete({});
    await hotelRepository.delete({});

    user.email = 'test@exemple.com';
    user.pseudo = 'test';
    user.password = bcrypt.hashSync('password', 12);
    user.role = Role.USER;

    adminUser.email = 'admin@admin.com';
    adminUser.pseudo = 'admin';
    adminUser.password = bcrypt.hashSync('admin', 10);
    adminUser.role = Role.ADMIN;

    hotel.name = 'Hotel test';
    hotel.location = 'Paris';
    hotel.description = 'Test description';
    hotel.images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

    updateHotel.name = 'Hotel test2';
    updateHotel.location = 'Versailles';
    updateHotel.description = 'Test description2';
    updateHotel.images = ['https://example.com/image3.jpg', 'https://example.com/image4.jpg'];

    const userInfos = { id: user.id, pseudo: user.pseudo, role: user.role };
    userToken = jwtService.sign(userInfos);

    const adminInfos = { id: adminUser.id, pseudo: adminUser.pseudo, role: adminUser.role };
    adminToken = jwtService.sign(adminInfos);

    await userRepository.save(user);
    await userRepository.save(adminUser);
  });

  it('should create a hotel with an admin user', () => {
    logErrorResponse(
      request(app.getHttpServer())
      .post('/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(hotel)
      .expect((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('name', 'Hotel test');
        expect(res.body).toHaveProperty('location', 'Paris');
        expect(res.body).toHaveProperty('description', 'Test description');
      })
    )
  });

  it('should not create a hotel with a basic user', () => {
    logErrorResponse(
      request(app.getHttpServer())
        .post('/hotels')
        .set('Authorization', `Bearer ${userToken}`)
        .send(hotel)
        .expect((res) => {
          expect(res.status).toBe(403);
          expect(res.body).toHaveProperty('error', 'Forbidden');
        })
    )
  });

  it ('should not create a user with an not identified user', () => {
    logErrorResponse(
      request(app.getHttpServer())
        .post('/hotels')
        .send(hotel)
        .expect((res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('message', 'Unauthorized');
        })
    )
  });

  it ('should get all hotels for an unidentified user, an admin and a normal user', async () => {
    for (let i = 0; i < 10; i++) {
      const newHotel = new Hotel();
      newHotel.name = `Hotel ${i}`;
      newHotel.location = 'Paris';
      newHotel.description = 'Test description';
      newHotel.images = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
      await hotelRepository.save(newHotel);
    }

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/hotels')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(10);
        })
    )

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/hotels')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(10);
        })
    )

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/hotels')
        .set('Authorization', `Bearer ${userToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(10);
        })
    )
  });

  it ('should get a hotel by id for an unidentified user, an admin and a normal user', async () => {
    await hotelRepository.save(hotel);

    const hotelId = hotel.id;

    await logErrorResponse(
      request(app.getHttpServer())
        .get(`/hotels/${hotelId}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('name', 'Hotel test');
          expect(res.body).toHaveProperty('location', 'Paris');
          expect(res.body).toHaveProperty('description', 'Test description');
        })
    )

    await logErrorResponse(
      request(app.getHttpServer())
        .get(`/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('name', 'Hotel test');
          expect(res.body).toHaveProperty('location', 'Paris');
          expect(res.body).toHaveProperty('description', 'Test description');
        })
    )

    await logErrorResponse(
      request(app.getHttpServer())
        .get(`/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('name', 'Hotel test');
          expect(res.body).toHaveProperty('location', 'Paris');
          expect(res.body).toHaveProperty('description', 'Test description');
        })
    )
  });

  it ('should update a hotel by id for an admin user', async () => {const newHotel = new Hotel();
    const createdHotel = await hotelRepository.save(hotel);

    await logErrorResponse(
      request(app.getHttpServer())
        .put(`/hotels/${createdHotel.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateHotel)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('name', updateHotel.name);
          expect(res.body).toHaveProperty('location', updateHotel.location);
          expect(res.body).toHaveProperty('description', updateHotel.description);
        })
    )
  });

  it ('should not update a hotel by id for a basic user', async () => {
    const createdHotel = await hotelRepository.save(hotel);

    await logErrorResponse(
      request(app.getHttpServer())
        .put(`/hotels/${createdHotel.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateHotel)
        .expect((res) => {
          expect(res.status).toBe(403);
          expect(res.body).toHaveProperty('error', 'Forbidden');
        })
    )
  });

  it ('should not update a hotel by id for an unidentified user', async () => {
    const createdHotel = await hotelRepository.save(hotel);

    await logErrorResponse(
      request(app.getHttpServer())
        .put(`/hotels/${createdHotel.id}`)
        .send(updateHotel)
        .expect((res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('message', 'Unauthorized');
        })
    )
  });

  it ('should delete a hotel by id for an admin user', async () => {
    const createdHotel = await hotelRepository.save(hotel);

    await logErrorResponse(
      request(app.getHttpServer())
        .delete(`/hotels/${createdHotel.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('message', 'Hotel has been successfully deleted');
        })
    )
  });

  it ('should not delete a hotel by id for a basic user', async () => {
    const createdHotel = await hotelRepository.save(hotel);

    await logErrorResponse(
      request(app.getHttpServer())
        .delete(`/hotels/${createdHotel.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect((res) => {
          expect(res.status).toBe(403);
          expect(res.body).toHaveProperty('error', 'Forbidden');
        })
    )
  });

  it ('should not delete a hotel by id for an unidentified user', async () => {
    const createdHotel = await hotelRepository.save(hotel);

    await logErrorResponse(
      request(app.getHttpServer())
        .delete(`/hotels/${createdHotel.id}`)
        .expect((res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('message', 'Unauthorized');
        })
    )
  });
});