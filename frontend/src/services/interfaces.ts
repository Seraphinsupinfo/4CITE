export interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  images: string[];
  creationDate: string;
}

export interface IReservation {
  id: number;
  startDate: Date;
  endDate: Date;
  userId: number;
  hotelId: number;
  isModified?: boolean;
}
