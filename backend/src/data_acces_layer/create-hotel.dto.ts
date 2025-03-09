import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

  @Entity()
  export class Hotel {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'A fabulous hotel', description: 'The name of the hotel' })
    @IsString({ message: 'Name must be a string' })
    @Column({ type: 'varchar' })
    name: string;

    @ApiProperty({ example: 'Paris', description: 'The location of the hotel' })
    @IsString({ message: 'Location must be a string' })
    @Column({ type: 'varchar' })
    location: string;

    @ApiProperty({ example: 'A fabulous hotel in Paris', description: 'The description of the hotel' })
    @IsString({ message: 'Description must be a string' })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
    @Column({ type: 'simple-array' })
    images: string[];

    @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
    creationDate: Date;
  }