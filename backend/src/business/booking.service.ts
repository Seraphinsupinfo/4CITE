import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { Booking } from '../data_acces_layer/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async createBooking(bookingToCreate: Booking): Promise<Partial<Booking>> {
    const { startDate, endDate, userId, hotelId } = bookingToCreate;

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    console.log('startDate', startDate, 'new Date()', new Date());
    if (new Date(startDate) < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    const existingBooking = await this.bookingRepository.findOne({ where: { startDate, endDate, userId, hotelId } });
    if (existingBooking) {
      throw new BadRequestException('Booking already exists');
    }

    const booking = this.bookingRepository.create({ startDate, endDate, userId, hotelId });
    const savedBooking = await this.bookingRepository.save(booking);
    return omit(savedBooking, ['password']);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: ['hotel'],
    });
  }

  async getBookingsByUserEmail(userEmail: string): Promise<Booking[]> {
    return this.bookingRepository.createQueryBuilder('booking')
      .innerJoin('booking.user', 'user')
      .where('user.email = :email', { email: userEmail })
      .getMany();
  }

  async getBookingById(id: number): Promise<Booking | null> {
    const booking = this.bookingRepository.findOne({where: { id }});
    if (booking == null) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateBooking(id: number, updatedBooking: Booking, callingUserId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== callingUserId) {
      throw new BadRequestException('You are not allowed to update this booking');
    }

    const { startDate, endDate, userId, hotelId } = updatedBooking;

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (new Date(startDate) < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    const existingBooking = await this.bookingRepository.findOne({ where: { startDate, endDate, userId, hotelId } });
    if (existingBooking && existingBooking.id !== id) {
      throw new BadRequestException('Booking already exists');
    }

    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.userId = userId;
    booking.hotelId = hotelId;

    return this.bookingRepository.save(booking);
  }

  async deleteBooking(id: number, callingUserId: number): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== callingUserId) {
      throw new BadRequestException('You are not allowed to delete this booking');
    }

    await this.bookingRepository.delete(id);
  }
}