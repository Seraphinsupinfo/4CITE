// src/controller/user.controller.ts
    import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
    import { UserService } from '../business/user.service';
    import { creationUserObject } from '../data_acces_layer/create-user.dto';

    @Controller('users')
    export class UserController {
      constructor(private readonly userService: UserService) {}

      @Post()
      async createUser(@Body() createUserWithConfirmationDto: creationUserObject) {
        const { password, confirmPassword } = createUserWithConfirmationDto;
        if (password !== confirmPassword) {
          throw new BadRequestException('Passwords do not match');
        }
        return this.userService.createUser(createUserWithConfirmationDto);
      }
    }