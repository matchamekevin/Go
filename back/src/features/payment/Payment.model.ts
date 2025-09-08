export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentReceipt {
  id: number;
  external_id: string;
  user_id: number;
  amount: number;
  currency: string;
  status: string;
  meta: any;
  created_at: Date;
}