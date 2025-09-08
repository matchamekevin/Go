export interface User {
  id: number;
  email: string;
  name?: string;
  password: string;
  phone?: string;
  is_verified: boolean;
  role?: string; // Ajouté pour compatibilité admin
}
