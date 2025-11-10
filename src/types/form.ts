export type CreditCard = {
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardLimit: number;
  bankName: string;
  cardType: string;
  cardHolderName: string;
  cardHolderMobile: string;
  cardDueDate: string;
  billGenerationDate: string;
};

export type BankAccount = {
  accountNumber: string;
  accountHolderName: string;
  mobile: string;
  bankName: string;
  ifscCode: string;
  branch: string;
};

export type AadhaarImage = {
  url: string;
  side: 'front' | 'back';
};

export type FormData = {
  name: string;
  mobile: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  aadhaar: string;
  pan: string;
  aadhaarImages: AadhaarImage[]; // Changed to array
  panImageUrl?: string;
  billPaymentRate: number;
  payoutRate: number;
  preferredPaymentMethod: string;
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
};