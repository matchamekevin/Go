import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: number | string;
    email: string;
    role?: string;
    name?: string;
  };
}
