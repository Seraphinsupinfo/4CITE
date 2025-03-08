import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const hotel = await this.hotelRepository.findOne({ where: { id } });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
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

  async updateHotel(id: number, hotel: Hotel) {
    const existingHotel = await this.hotelRepository.findOne({ where: { id } });
    if (!existingHotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    await this.hotelRepository.update(id, omit(hotel, ['id']));
    return this.hotelRepository.findOne({ where: { id } });
  }

  async deleteHotel(id: number) {
    const hotel = await this.hotelRepository.findOne({ where: { id } });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    await this.hotelRepository.delete(id);
  }
}