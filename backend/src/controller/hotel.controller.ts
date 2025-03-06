import { Controller, Post, Body, BadRequestException, Get, UseGuards, Param, ForbiddenException, Req, Put, Delete, Query, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccesAutorisationGuard, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Hotel } from '../data_acces_layer/create-hotel.dto';
import { HotelService } from '../business/hotel.service';

@ApiTags('hotel')
@Controller('hotel')
@ApiBearerAuth('JWT-auth')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiResponse({ status: 201, description: 'The hotel has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createHotel(@Body() hotel: Hotel, @Req() req: Request) {
    const user = req.user as { id: number; pseudo: string; role: string };
    if (AccesAutorisationGuard.isUserAdmin(user)) {
      return this.hotelService.createHotel(hotel);
    } else {
      throw new ForbiddenException('You are not allowed to access this resource');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hotel by ID' })
  @ApiResponse({ status: 200, description: 'The hotel has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Bad Request.' })
  async getHotel(@Param('id') id: number) {
    return this.hotelService.getHotelById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotels with sorting and limit' })
  @ApiResponse({ status: 200, description: 'The hotels have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by', example: 'creationDate' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return', example: 10 })
  async getAllHotels(@Query('sortBy') sortBy: string = 'creationDate', @Query('limit') limit: number = 10) {
    return this.hotelService.getAllHotels(sortBy, limit);
  }
}