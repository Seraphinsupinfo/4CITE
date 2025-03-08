import { Controller, Post, Body, BadRequestException, Get, UseGuards, Param, ForbiddenException, Req, Put, Delete, } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { UserService } from '../business/user.service';
  import { creationUserObject, updateUserObject } from '../data_acces_layer/create-user.dto';
  import { AccesAutorisationGuard, JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { Request } from 'express';
import { BookingService } from '../business/booking.service';

  @ApiTags('users')
  @Controller('users')
  @ApiBearerAuth('JWT-auth')
  export class UserController {
    constructor(private readonly userService: UserService, private readonly bookingService: BookingService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async createUser(@Body() user: creationUserObject) {
      const { password, confirmPassword } = user;
      if (password !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }
      return this.userService.createUser(user);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'The user has been successfully retrieved.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getUser(@Param('id') id: number, @Req() req: Request) {
      const user = req.user as { id: number; pseudo: string; role: string };
      if (AccesAutorisationGuard.isUserAdmin(user) || AccesAutorisationGuard.isUserOwner(user, id)) {
        return this.userService.getUserById(id);
      } else {
        throw new ForbiddenException('You are not allowed to access this resource');
      }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async updateUser(@Param('id') id: number, @Body() updatedUser: updateUserObject, @Req() req: Request) {
      const user = req.user as { id: number; pseudo: string; role: string };
      if (AccesAutorisationGuard.isUserAdmin(user) || AccesAutorisationGuard.isUserOwner(user, id)) {
        return this.userService.updateUser(id, updatedUser);
      } else {
        throw new ForbiddenException('You are not allowed to access this resource');
      }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async deleteUser(@Param('id') id: number, @Req() req: Request) {
      const user = req.user as { id: number; pseudo: string; role: string };
      if (AccesAutorisationGuard.isUserOwner(user, id)) {
        await this.userService.deleteUser(id);
        return { message: 'User has been successfully deleted' };
      } else {
        throw new ForbiddenException('You are not allowed to access this resource');
      }
    }

    @Get(':id/bookings')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all bookings of a user' })
    @ApiResponse({ status: 200, description: 'The bookings have been successfully retrieved.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getUserBookings(@Param('id') id: number, @Req() req: Request) {
      const user = req.user as { id: number; pseudo: string; role: string };
      if (AccesAutorisationGuard.isUserOwner(user, id)) {
        return this.bookingService.getUserBookings(id);
      } else {
        throw new ForbiddenException('You are not allowed to access this resource');
      }
    }
  }