import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hotel } from './create-hotel.dto';
import { User } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt } from 'class-validator';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2021-01-01', description: 'The start date of the booking' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ example: '2021-01-02', description: 'The end date of the booking' })
  @Column({ type: 'date' })
  endDate: Date;

  @ApiProperty({ example: 1, description: 'The user ID of the booking' })
  @IsInt()
  @Column()
  userId: number;

  @ApiProperty({ example: 1, description: 'The hotel ID of the booking' })
  @IsInt()
  @Column()
  hotelId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Hotel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;
}

export class CreateBookingDto {
  @ApiProperty({ example: '2021-01-01', description: 'The start date of the booking' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2021-01-02', description: 'The end date of the booking' })
  @IsDate()
  endDate: Date;

  @ApiProperty({ example: 1, description: 'The user ID of the booking' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1, description: 'The hotel ID of the booking' })
  @IsInt()
  hotelId: number;
}