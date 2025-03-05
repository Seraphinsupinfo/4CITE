import { Repository } from 'typeorm';
import { creationUserObject, User } from '../data_acces_layer/create-user.dto';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    createUser(creationUserObject: creationUserObject): Promise<Partial<User>>;
    findByEmail(email: string): Promise<User | null>;
}
