// Extension du type Request pour inclure la propriété user ajoutée par le middleware d'authentification
declare namespace Express {
  export interface Request {
    user?: {
      id: number | string;
      email: string;
      role?: string;
      name?: string;
    };
  }
}
