"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creationUserObject = exports.User = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["ADMIN"] = "admin";
    Role["SUPER_ADMIN"] = "super_admin";
})(Role || (Role = {}));
let User = class User {
    id;
    email;
    pseudo;
    password;
    role;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "pseudo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
class creationUserObject {
    email;
    pseudo;
    password;
    confirmPassword;
}
exports.creationUserObject = creationUserObject;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'The email of the user' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email address' }),
    __metadata("design:type", String)
], creationUserObject.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123', description: 'The pseudo of the user' }),
    (0, class_validator_1.IsString)({ message: 'Pseudo must be a string' }),
    __metadata("design:type", String)
], creationUserObject.prototype, "pseudo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!', description: 'The password of the user' }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password too weak',
    }),
    __metadata("design:type", String)
], creationUserObject.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!', description: 'The confirmation of the password' }),
    (0, class_validator_1.IsString)({ message: 'Confirm password must be a string' }),
    __metadata("design:type", String)
], creationUserObject.prototype, "confirmPassword", void 0);
//# sourceMappingURL=create-user.dto.js.map