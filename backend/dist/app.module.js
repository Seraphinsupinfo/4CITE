"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./controller/app.controller");
const app_service_1 = require("./business/app.service");
const create_hotel_dto_1 = require("./data_acces_layer/create-hotel.dto");
const create_user_dto_1 = require("./data_acces_layer/create-user.dto");
const create_booking_dto_1 = require("./data_acces_layer/create-booking.dto");
const user_controller_1 = require("./controller/user.controller");
const user_service_1 = require("./business/user.service");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT, 10),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [create_hotel_dto_1.Hotel, create_user_dto_1.User, create_booking_dto_1.Booking],
                synchronize: false,
                logging: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([create_hotel_dto_1.Hotel, create_user_dto_1.User, create_booking_dto_1.Booking]),
            auth_module_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController, user_controller_1.UserController],
        providers: [app_service_1.AppService, user_service_1.UserService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map