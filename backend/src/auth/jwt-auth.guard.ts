import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class AccesAutorisationGuard {
  constructor(private reflector: Reflector) {}

  static isUserOwner(user: { id: number; role: string }, id: number): boolean {
    return user.id == id;
  }

  static isUserAdmin(user: { id: number; role: string }): boolean {
    return user.role == 'admin';
  }
}