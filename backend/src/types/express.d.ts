import { Request } from 'src/types/express';

declare module 'src/types/express' {
  export interface Request {
    user?: {
      id: number;
      pseudo: string;
      role: string;
    };
  }
}