import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { Hotel } from '../data_acces_layer/create-hotel.dto';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async createHotel(hotel: Hotel) {
    return this.hotelRepository.save(hotel);
  }

  async getHotelById(id: number) {
    return this.hotelRepository.findOne({ where: { id } });
  }

  async getAllHotels(sortBy: string, limit: number) {
    const validSortFields = ['creationDate', 'name', 'location'];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException('Invalid sort field');
    }

    return this.hotelRepository.find({
      order: { [sortBy]: 'ASC' },
      take: limit,
    });
  }
}