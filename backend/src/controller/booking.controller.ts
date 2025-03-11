import { Controller, Post, Body, BadRequestException, Get, UseGuards, Param, ForbiddenException, Req, Put, Delete, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingService } from '../business/booking.service';
import { AccesAutorisationGuard, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Booking, CreateBookingDto } from '../data_acces_layer/create-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
@ApiBearerAuth('JWT-auth')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'The booking has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createBooking(@Body() booking: CreateBookingDto, @Req() req: Request) {
    if (booking.userId !== (req.user as { id: number }).id) {
      throw new BadRequestException('You are not allowed to create a booking for another user');
    }
    return this.bookingService.createBooking(booking);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'The booking has been successfully retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getBooking(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { id: number; pseudo: string; role: string };
    if (AccesAutorisationGuard.isUserAdmin(user)) {
      return this.bookingService.getBookingById(id);
    } else {
      throw new ForbiddenException('You are not allowed to access this resource');
    }
  }

  @Get()
  @ApiQuery({ name: 'user_email', required: true, description: 'The email of the user' })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get bookings by user email' })
  @ApiResponse({ status: 200, description: 'The bookings have been successfully retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getBookingsByUserEmail(@Req() req: Request) {
    const userEmail = req.query.user_email as string;
    const user = req.user as { id: number; pseudo: string; role: string };
    if (AccesAutorisationGuard.isUserAdmin(user)) {
      return this.bookingService.getBookingsByUserEmail(userEmail);
    } else {
      throw new ForbiddenException('You are not allowed to access this resource');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update booking by ID' })
  @ApiResponse({ status: 200, description: 'The booking has been successfully updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updateBooking(@Param('id') id: number, @Body() updatedBooking: Booking, @Req() req: Request) {
    const user = req.user as { id: number };
    if (updatedBooking.userId !== user.id) {
      throw new BadRequestException('You are not allowed to update a booking for another user');
    }
    return this.bookingService.updateBooking(id, updatedBooking, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete booking by ID' })
  @ApiResponse({ status: 200, description: 'The booking has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async deleteBooking(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { id: number };
    await this.bookingService.deleteBooking(id, user.id);
    return { message: 'Booking has been successfully deleted' };
  }
}
