// Validation utilities for form fields

export const validateAadhaar = (aadhaar: string): boolean => {
  const cleaned = aadhaar.replace(/\s|-/g, '');
  return /^\d{12}$/.test(cleaned);
};

export const formatAadhaar = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/(\d{1,4})/g) || [];
  return groups.join('-').substring(0, 14); // XXXX-XXXX-XXXX
};

export const validatePAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
};

export const formatPAN = (value: string): string => {
  return value.toUpperCase().substring(0, 10);
};

export const validateMobile = (mobile: string): boolean => {
  const cleaned = mobile.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

export const formatMobile = (value: string): string => {
  return value.replace(/\D/g, '').substring(0, 10);
};

// Luhn algorithm for credit card validation
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s|-/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/(\d{1,4})/g) || [];
  return groups.join('-').substring(0, 19); // XXXX-XXXX-XXXX-XXXX
};

export const getCardType = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  if (/^6/.test(cleaned)) return 'Rupay';
  
  return 'Unknown';
};

export const validateCVV = (cvv: string, cardType: string): boolean => {
  const length = cardType === 'Amex' ? 4 : 3;
  return new RegExp(`^\\d{${length}}$`).test(cvv);
};

export const validateExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
  
  if (!month || !year || month < 1 || month > 12) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 10) return false; // Not more than 10 years in future
  
  return true;
};

export const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};
