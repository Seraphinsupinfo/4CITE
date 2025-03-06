import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Hotel } from './data_acces_layer/create-hotel.dto';
import { User } from './data_acces_layer/create-user.dto';
import { Booking } from './data_acces_layer/create-booking.dto';
import { UserController } from './controller/user.controller';
import { UserService } from './business/user.service';
import { AuthModule } from './auth/auth.module';
import { HotelController } from './controller/hotel.controller';
import { HotelService } from './business/hotel.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_DATABASE as string,
      entities: [Hotel, User, Booking],
      synchronize: false,
      logging: true,
    }),
    TypeOrmModule.forFeature([Hotel, User, Booking]),
    AuthModule,
  ],
  controllers: [UserController, HotelController],
  providers: [UserService, HotelService],
})
export class AppModule {}