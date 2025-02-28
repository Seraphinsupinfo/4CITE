import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

  @Entity()
  export class Hotel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'simple-array' })
    images: string[];
  }