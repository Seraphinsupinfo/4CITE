declare enum Role {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export declare class User {
    id: number;
    email: string;
    pseudo: string;
    password: string;
    role: Role;
}
export declare class creationUserObject {
    email: string;
    pseudo: string;
    password: string;
    confirmPassword: string;
}
export {};
