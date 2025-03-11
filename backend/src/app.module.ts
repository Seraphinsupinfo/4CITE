import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Hotel } from './data_acces_layer/create-hotel.dto';
import { User } from './data_acces_layer/create-user.dto';
import { Booking } from './data_acces_layer/create-booking.dto';
import { UserController } from './controller/user.controller';
import { UserService } from './business/user.service';
import { AuthModule } from './auth/auth.module';
import { HotelController } from './controller/hotel.controller';
import { HotelService } from './business/hotel.service';
import { BookingController } from './controller/booking.controller';
import { BookingService } from './business/booking.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isTestEnvironment = process.env.NODE_ENV === 'test';

        return {
          type: 'postgres',
          host: isTestEnvironment
            ? configService.get('TEST_DB_HOST')
            : configService.get('DB_HOST'),
          port: isTestEnvironment
            ? parseInt(<string>configService.get('TEST_DB_PORT'))
            : parseInt(<string>configService.get('DB_PORT')),
          username: isTestEnvironment
            ? configService.get('TEST_DB_USERNAME')
            : configService.get('DB_USERNAME'),
          password: isTestEnvironment
            ? configService.get('TEST_DB_PASSWORD')
            : configService.get('DB_PASSWORD'),
          database: isTestEnvironment
            ? configService.get('TEST_DB_DATABASE')
            : configService.get('DB_DATABASE'),
          entities: [User],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Hotel, User, Booking]),
    AuthModule,
  ],
  controllers: [UserController, HotelController, BookingController],
  providers: [UserService, HotelService, BookingService],
})
export class AppModule {}