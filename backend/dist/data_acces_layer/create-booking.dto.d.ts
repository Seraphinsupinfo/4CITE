import { Hotel } from './create-hotel.dto';
import { User } from './create-user.dto';
export declare class Booking {
    id: number;
    startDate: Date;
    endDate: Date;
    user: User;
    hotel: Hotel;
}
