import { UserService } from '../business/user.service';
import { creationUserObject } from '../data_acces_layer/create-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(createUserWithConfirmationDto: creationUserObject): Promise<Partial<import("../data_acces_layer/create-user.dto").User>>;
}
