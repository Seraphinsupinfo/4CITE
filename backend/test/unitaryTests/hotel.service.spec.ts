import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { HotelService } from '../../src/business/hotel.service';
import { Hotel } from '../../src/data_acces_layer/create-hotel.dto';

dotenv.config();

describe('HotelService', () => {
  let service: HotelService;
  let repository: Repository<Hotel>;

  const hotel = new Hotel();

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
          entities: [Hotel],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Hotel]),
      ],
      providers: [HotelService],
    }).compile();

    service = module.get<HotelService>(HotelService);
    repository = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
  });

  beforeEach(async () => {
    await repository.delete({});

    hotel.name = 'test';
    hotel.location = 'test';
    hotel.description = 'test';
    hotel.images = ['test'];
    hotel.creationDate = new Date();
  });

  it('should create a hotel', async () => {
    await service.createHotel(hotel);

    const createdHotel = await repository.findOne({ where: { name: hotel.name } });
    expect(createdHotel).toBeDefined();
    expect(createdHotel).toStrictEqual(hotel);
  });

  it('should get a hotel by id', async () => {
    const createdHotel = repository.create(hotel);
    await repository.save(createdHotel);

    const hotelById = await service.getHotelById(createdHotel.id);
    expect(hotelById).toBeDefined();
    expect(hotelById).toStrictEqual(createdHotel);
  });

  it('should not get a non existing hotel by id', async () => {
    await expect(service.getHotelById(-1)).rejects.toThrow(`Hotel with ID -1 not found`);
  });

  it('should get all hotels sorted and limited', async () => {
    const hotelsList = Array.from({ length: 12 }, (_, i) => {
      const char = String.fromCharCode(97 + i);
      return {
        name: char,
        location: char,
        description: char,
        images: [`${char}.jpg`],
        creationDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      };
    });
    for (const hotel of hotelsList) {
      await repository.save(repository.create(hotel));
    }

    const hotels = await service.getAllHotels('name', 'DESC', 6);

    expect(hotels).toBeDefined();
    expect(hotels).toHaveLength(6);
    expect(hotels[0].name).toBe('l');
    expect(hotels[5].name).toBe('g');
  });

  it('should not get all hotels with an invalid sort field', async () => {
    await expect(service.getAllHotels('invalid', 'ASC', 1)).rejects.toThrow('Invalid sort field');
  });

  it('should update a hotel', async () => {
    const createdHotel = repository.create(hotel);
    await repository.save(createdHotel);

    const updatedHotel = new Hotel();
    updatedHotel.name = 'test2';
    updatedHotel.location = 'test2';
    updatedHotel.description = 'test2';
    updatedHotel.images = ['test2'];
    updatedHotel.creationDate = new Date('2025-03-09');

    await service.updateHotel(createdHotel.id, updatedHotel);

    const foundHotel = await repository.findOne({ where: { id: createdHotel.id } });
    expect(foundHotel).toBeDefined();
    expect(foundHotel).toMatchObject({
      name: updatedHotel.name,
      location: updatedHotel.location,
      description: updatedHotel.description,
      images: updatedHotel.images,
      creationDate: '2025-03-09',
    });
  });

  it('should not update a non existing hotel', async () => {
    await expect(service.updateHotel(-1, hotel)).rejects.toThrow(`Hotel with ID -1 not found`);
  });

  it('should delete a hotel', async () => {
    const createdHotel = repository.create(hotel);
    await repository.save(createdHotel);

    await service.deleteHotel(createdHotel.id);

    const foundHotel = await repository.findOne({ where: { id: createdHotel.id } });
    expect(foundHotel).toBeNull();
  });

  it('should not delete a non existing hotel', async () => {
    await expect(service.deleteHotel(-1)).rejects.toThrow(`Hotel with ID -1 not found`);
  });
});