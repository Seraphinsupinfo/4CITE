import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../business/user.service';
import { creationUserObject } from '../data_acces_layer/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createUser(@Body() createUserWithConfirmationDto: creationUserObject) {
    const { password, confirmPassword } = createUserWithConfirmationDto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    return this.userService.createUser(createUserWithConfirmationDto);
  }
}