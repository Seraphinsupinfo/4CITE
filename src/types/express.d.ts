import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: number;
      pseudo: string;
      role: string;
    };
  }
}