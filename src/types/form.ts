export type CreditCard = {
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardLimit: number;
  bankName: string;
  cardType: string;
};

export type FormData = {
  name: string;
  mobile: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  aadhaar: string;
  pan: string;
  aadhaarImage?: File;
  panImage?: File;
  billPaymentRate: number;
  payoutRate: number;
  preferredPaymentMethod: string;
  creditCards: CreditCard[];
};
