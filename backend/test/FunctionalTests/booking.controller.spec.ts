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
import { Booking } from '../../src/data_acces_layer/create-booking.dto';
import { BookingService } from '../../src/business/booking.service';

dotenv.config();

describe('BookingController', () => {
  let userRepository: Repository<User>;
  let hotelRepository: Repository<Hotel>;
  let bookingRepository: Repository<Booking>;
  let app: INestApplication;
  let jwtService: JwtService;

  const user = new User();
  const adminUser = new User();

  let userToken: string;
  let adminToken: string;

  const hotel = new Hotel();

  const booking = new Booking();

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
          entities: [User, Hotel, Booking],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([User, Hotel, Booking]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [UserService, HotelService, BookingService],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hotelRepository = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    jwtService = module.get<JwtService>(JwtService);
  }, 30000);

  beforeEach(async () => {
    await userRepository.delete({});

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

    await userRepository.save(user);
    await userRepository.save(adminUser);
    await hotelRepository.save(hotel);

    const userInfos = { id: user.id, pseudo: user.pseudo, role: user.role };
    userToken = jwtService.sign(userInfos);

    const adminInfos = { id: adminUser.id, pseudo: adminUser.pseudo, role: adminUser.role };
    adminToken = jwtService.sign(adminInfos);

    booking.userId = user.id;
    booking.hotelId = hotel.id;

    booking.startDate = new Date();
    booking.startDate.setMonth(booking.startDate.getMonth() + 1);

    booking.endDate = new Date(booking.startDate);
    booking.endDate.setDate(booking.endDate.getDate() + 2);
  });

  it ('should create a booking', async () => {
    await logErrorResponse(
      request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', 'Bearer ' + userToken)
        .send(booking)
        .expect(201)
    )
  });

  it ('should not create a booking for another user even if admin account is trying', async () => {
    await logErrorResponse(
      request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(booking)
        .expect(400)
    )
  });

  it ('should get a booking by ID with an admin user', async () => {
    await bookingRepository.save(booking);

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/bookings/' + booking.id)
        .set('Authorization', 'Bearer ' + adminToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(booking.id);
          expect(res.body.userId).toBe(booking.userId);
          expect(res.body.hotelId).toBe(booking.hotelId);
          expect(new Date(res.body.startDate).toISOString().split('T')[0]).toBe(booking.startDate.toISOString().split('T')[0]);
          expect(new Date(res.body.endDate).toISOString().split('T')[0]).toBe(booking.endDate.toISOString().split('T')[0]);
        })
    )
  });

  it ('should not get a booking by ID with a user', async () => {
    await bookingRepository.save(booking);

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/bookings/' + booking.id)
        .set('Authorization', 'Bearer ' + userToken)
        .expect(403)
    )
  });

  it ('should get bookings by user email with an admin user', async () => {
    await bookingRepository.save(booking);

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/bookings?user_email=' + user.email)
        .set('Authorization', 'Bearer ' + adminToken)
        .expect(200)
        .expect((res) => {
          expect(res.body[0].id).toBe(booking.id);
          expect(res.body[0].userId).toBe(booking.userId);
          expect(res.body[0].hotelId).toBe(booking.hotelId);
          expect(new Date(res.body[0].startDate).toISOString().split('T')[0]).toBe(booking.startDate.toISOString().split('T')[0]);
          expect(new Date(res.body[0].endDate).toISOString().split('T')[0]).toBe(booking.endDate.toISOString().split('T')[0]);
        })
    )
  });

  it ('should not get bookings by user email with a user', async () => {
    await bookingRepository.save(booking);

    await logErrorResponse(
      request(app.getHttpServer())
        .get('/bookings?user_email=' + user.email)
        .set('Authorization', 'Bearer ' + userToken)
        .expect(403)
    )
  });

  it ('should update a booking with the user who created it', async () => {
    await bookingRepository.save(booking);

    booking.startDate.setDate(booking.startDate.getDate() + 1);
    booking.endDate.setDate(booking.endDate.getDate() + 1);

    await logErrorResponse(
      request(app.getHttpServer())
        .put('/bookings/' + booking.id)
        .set('Authorization', 'Bearer ' + userToken)
        .send(booking)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(booking.id);
          expect(res.body.userId).toBe(booking.userId);
          expect(res.body.hotelId).toBe(booking.hotelId);
          expect(new Date(res.body.startDate).toISOString().split('T')[0]).toBe(booking.startDate.toISOString().split('T')[0]);
          expect(new Date(res.body.endDate).toISOString().split('T')[0]).toBe(booking.endDate.toISOString().split('T')[0]);
        })
    )
  });

  it ('should not update a booking with another user even with an admin account', async () => {
    await bookingRepository.save(booking);

    booking.startDate.setDate(booking.startDate.getDate() + 1);
    booking.endDate.setDate(booking.endDate.getDate() + 1);

    await logErrorResponse(
      request(app.getHttpServer())
        .put('/bookings/' + booking.id)
        .set('Authorization', 'Bearer ' + adminToken)
        .send(booking)
        .expect(400)
    )
  });

  it ('should delete a booking with the user who created it', async () => {
    await bookingRepository.save(booking);

    await logErrorResponse(
      request(app.getHttpServer())
        .delete('/bookings/' + booking.id)
        .set('Authorization', 'Bearer ' + userToken)
        .expect(200)
    )
  });

  it ('should not delete a booking with another user even with an admin account', async () => {
    await bookingRepository.save(booking);

    await logErrorResponse(
      request(app.getHttpServer())
        .delete('/bookings/' + booking.id)
        .set('Authorization', 'Bearer ' + adminToken)
        .expect(400)
    )
  });
});