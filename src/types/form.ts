export interface CreditCard {
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardLimit: number;
  bankName: string;
  cardType: string;
}

export interface FormData {
  // Step 1: Personal Information
  name: string;
  mobile: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;

  // Step 2: Identity Documents
  aadhaar: string;
  pan: string;
  aadhaarImage?: File;
  panImage?: File;

  // Step 3: Payment Rates
  billPaymentRate: number;
  payoutRate: number;
  preferredPaymentMethod: string;

  // Step 4: Credit Cards
  creditCards: CreditCard[];
}

export interface ClientDocument extends Omit<FormData, 'aadhaarImage' | 'panImage'> {
  distributorId: string;
  aadhaarImageUrl?: string;
  panImageUrl?: string;
  submittedAt: Date;
  source: 'client_form';
}
