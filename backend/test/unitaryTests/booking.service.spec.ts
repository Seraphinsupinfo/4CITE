import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { BookingService } from '../../src/business/booking.service';
import { UserService } from '../../src/business/user.service';
import { HotelService } from '../../src/business/hotel.service';
import { Booking } from '../../src/data_acces_layer/create-booking.dto';
import { User } from '../../src/data_acces_layer/create-user.dto';
import { Hotel } from '../../src/data_acces_layer/create-hotel.dto';
import * as bcrypt from 'bcrypt';

dotenv.config();

describe('BookingService', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;
  let hotelRepository: Repository<Hotel>;
  let user: User;
  let hotel: Hotel;

  let startDate = new Date();
  let endDate = new Date(startDate);

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
          entities: [User, Booking, Hotel],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([User, Booking, Hotel]),
      ],
      providers: [BookingService, UserService, HotelService],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hotelRepository = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
  });

  beforeEach(async () => {
    await bookingRepository.delete({});
    await userRepository.delete({});
    await hotelRepository.delete({});

    user = userRepository.create({
      email: 'test@example.com',
      pseudo: 'testuser',
      password: await bcrypt.hash('Password123!', 10),
    });
    await userRepository.save(user);

    hotel = hotelRepository.create({
      name: 'Test Hotel',
      location: 'Test Location',
      description: 'Test Description',
      images: ['https://example.com/image1.jpg'],
      creationDate: new Date(),
    });
    await hotelRepository.save(hotel);

    startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() + 1);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 9);
  });

  it('should be defined', () => {
    expect(bookingService).toBeDefined();
  });

  it('should create a booking', async () => {
    const booking = await bookingService.createBooking({
      startDate,
      endDate,
      userId: user.id,
      hotelId: hotel.id,
    });

    const createdBooking = await bookingRepository.findOne({ where: { startDate: booking.startDate, endDate: booking.endDate, userId: booking.userId, hotelId: booking.hotelId} });

    expect(createdBooking).toBeDefined();
    expect(new Date(createdBooking!.startDate).toISOString().split('T')[0]).toEqual(booking.startDate!.toISOString().split('T')[0]);
    expect(new Date(createdBooking!.endDate).toISOString().split('T')[0]).toEqual(booking.endDate!.toISOString().split('T')[0]);
    expect(createdBooking?.userId).toEqual(booking.userId);
    expect(createdBooking?.hotelId).toEqual(booking.hotelId);
  });

  it('should not create a booking with an end date before a start date', async () => {
    endDate.setDate(endDate.getDate() - 9);

    await expect(bookingService.createBooking({
      startDate,
      endDate,
      userId: user.id,
      hotelId: hotel.id,
    })).rejects.toThrow('Start date must be before end date');
  });

  it('should not create a booking with a start date in the past', async () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    endDate.setDate(endDate.getDate() + 9);

    await expect(bookingService.createBooking({
      startDate,
      endDate,
      userId: user.id,
      hotelId: hotel.id,
    })).rejects.toThrow('Start date must be in the future');
  });

  it('should not create a booking that already exists', async () => {
    await bookingService.createBooking({
      startDate,
      endDate,
      userId: user.id,
      hotelId: hotel.id,
    });

    await expect(bookingService.createBooking({
      startDate,
      endDate,
      userId: user.id,
      hotelId: hotel.id,
    })).rejects.toThrow('Booking already exists');
  });

  it('should get a booking by ID', async () => {
    const booking = await bookingService.createBooking({
      startDate,
      endDate,
      userId: user.id,
      hotelId: hotel.id,
    });

    const retrievedBooking = await bookingService.getBookingById(booking.id!);

    expect(retrievedBooking).toBeDefined();
    expect(new Date(retrievedBooking!.startDate).toISOString().split('T')[0]).toEqual(booking.startDate!.toISOString().split('T')[0]);
    expect(new Date(retrievedBooking!.endDate).toISOString().split('T')[0]).toEqual(booking.endDate!.toISOString().split('T')[0]);
    expect(retrievedBooking?.userId).toEqual(booking.userId);
    expect(retrievedBooking?.hotelId).toEqual(booking.hotelId);
  });

  it ('should not get a booking by ID that does not exist', async () => {
    await expect(bookingService.getBookingById(-1)).rejects.toThrow('Booking not found');
  });

  it ('should update a booking', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id, });
    await bookingRepository.save(createdBooking);

    const updatedStartDate = new Date();
    updatedStartDate.setFullYear(updatedStartDate.getFullYear() + 2);
    const updatedEndDate = new Date(updatedStartDate);
    updatedEndDate.setDate(updatedStartDate.getDate() + 9);

    await bookingService.updateBooking(createdBooking.id!, {startDate: updatedStartDate, endDate: updatedEndDate, userId: user.id, hotelId: hotel.id}, user.id);
    const retrievedBooking = await bookingRepository.findOne({ where: { id: createdBooking.id } });

    expect(retrievedBooking).toBeDefined();
    expect(new Date(retrievedBooking!.startDate).toISOString().split('T')[0]).toEqual(updatedStartDate.toISOString().split('T')[0]);
    expect(new Date(retrievedBooking!.endDate).toISOString().split('T')[0]).toEqual(updatedEndDate.toISOString().split('T')[0]);
    expect(retrievedBooking?.userId).toEqual(user.id);
    expect(retrievedBooking?.hotelId).toEqual(hotel.id);
  });

  it ('should not update a booking that does not exist', async () => {
    await expect(bookingService.updateBooking(-1, {startDate, endDate, userId: user.id, hotelId: hotel.id}, user.id)).rejects.toThrow('Booking not found');
  });

  it ('should not update a booking for another user', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id, });
    await bookingRepository.save(createdBooking);

    const user2 = userRepository.create({
      email: 'test2@example.com',
      pseudo: 'testuser2',
      password: await bcrypt.hash('Password123!', 10),
    });
    await userRepository.save(user2);

    await expect(bookingService.updateBooking(createdBooking.id!, {startDate, endDate, userId: user.id, hotelId: hotel.id}, user2.id)).rejects.toThrow('You are not allowed to update this booking');
  });

  it ('should not update a booking with an end date before a start date', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id, });
    await bookingRepository.save(createdBooking);

    endDate.setDate(endDate.getDate() - 9);

    await expect(bookingService.updateBooking(createdBooking.id!, {startDate, endDate, userId: user.id, hotelId: hotel.id}, user.id)).rejects.toThrow('Start date must be before end date');
  });

  it('should not update a booking with a start date in the past', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id });
    await bookingRepository.save(createdBooking);

    const pastStartDate = new Date();
    pastStartDate.setFullYear(pastStartDate.getFullYear() - 1);
    const futureEndDate = new Date(pastStartDate);
    futureEndDate.setDate(pastStartDate.getDate() + 9);

    await expect(bookingService.updateBooking(createdBooking.id!, { startDate: pastStartDate, endDate: futureEndDate, userId: user.id, hotelId: hotel.id }, user.id)).rejects.toThrow('Start date must be in the future');
  });

  it ('should not update a booking that already exists', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id });
    await bookingRepository.save(createdBooking);

    const updatedStartDate = new Date();
    updatedStartDate.setFullYear(updatedStartDate.getFullYear() + 2);
    const updatedEndDate = new Date(updatedStartDate);
    updatedEndDate.setDate(updatedStartDate.getDate() + 9);

    const createdBooking2 = bookingRepository.create({ startDate: updatedStartDate, endDate: updatedEndDate, userId: user.id, hotelId: hotel.id });
    await bookingRepository.save(createdBooking2);

    await expect(bookingService.updateBooking(createdBooking2.id!, { startDate, endDate, userId: user.id, hotelId: hotel.id }, user.id)).rejects.toThrow('Booking already exists');
  });

  it ('should delete a booking', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id });
    await bookingRepository.save(createdBooking);

    await bookingService.deleteBooking(createdBooking.id!, user.id);

    const retrievedBooking = await bookingRepository.findOne({ where: { id: createdBooking.id } });

    expect(retrievedBooking).toBeNull();
  });

  it ('should not delete a booking that does not exist', async () => {
    await expect(bookingService.deleteBooking(-1, user.id)).rejects.toThrow('Booking not found');
  });

  it ('should not delete a booking for another user', async () => {
    const createdBooking = bookingRepository.create({ startDate, endDate, userId: user.id, hotelId: hotel.id });
    await bookingRepository.save(createdBooking);

    const user2 = userRepository.create({
      email: 'test2@example.com',
      pseudo: 'testuser2',
      password: await bcrypt.hash('Password123!', 10),
    });
    await userRepository.save(user2);

    await expect(bookingService.deleteBooking(createdBooking.id!, user2.id)).rejects.toThrow('You are not allowed to delete this booking');
  });
});