export class CreateBookingDto {
  readonly userId: number;
  readonly hotelId: number;
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
}
