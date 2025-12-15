import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CreditCard } from 'lucide-react';

// Types
interface CreditCardType {
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
}

interface FormData {
  creditCards?: CreditCardType[];
}

interface CreditCardsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

// Utility functions
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  return formatted;
};

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

const getCardType = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'Visa';
  if (cleaned.startsWith('5')) return 'Mastercard';
  if (cleaned.startsWith('3')) return 'Amex';
  return 'Credit';
};

// --- MODIFIED: CVV moved to the front, Back of card removed ---
const CardPreview = ({ 
  card, 
  index,
  updateCard,
  setFocusedField
}: { 
  card: CreditCardType; 
  index: number;
  updateCard: (index: number, field: keyof CreditCardType, value: any) => void;
  setFocusedField: (field: string | null) => void;
}) => (
  <div className="w-full h-52 sm:h-56 relative">
    <div className="w-full h-full rounded-xl shadow-2xl p-5 sm:p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
      
      {/* Decorative Circles/Background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Chip */}
      <div className="w-10 h-8 sm:w-12 sm:h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded mb-3 sm:mb-4 shadow-sm"></div>
      
      {/* Editable Bank Name */}
      <input
        type="text"
        value={card.bankName || ''}
        onChange={(e) => updateCard(index, 'bankName', e.target.value)}
        placeholder="BANK NAME"
        className="absolute top-6 right-6 text-right text-xs sm:text-sm opacity-80 bg-transparent border-none outline-none w-1/2 text-white placeholder-white/50 focus:opacity-100 uppercase font-bold tracking-wider"
      />
      
      {/* Editable Card Number */}
      <div className="mt-2 mb-4 sm:mb-6">
         <input
          type="text"
          value={card.cardNumber || ''}
          onChange={(e) => updateCard(index, 'cardNumber', e.target.value)}
          onFocus={() => setFocusedField(`number-${index}`)}
          onBlur={() => setFocusedField(null)}
          placeholder="#### #### #### ####"
          maxLength={19}
          className="text-lg sm:text-xl font-mono tracking-widest bg-transparent border-none outline-none w-full text-white placeholder-white/30 focus:ring-1 focus:ring-white/30 rounded px-1"
        />
      </div>
      
      <div className="flex justify-between items-end gap-2">
        {/* Card Holder */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs opacity-70 mb-1 uppercase tracking-wider">Card Holder</div>
          <input
            type="text"
            value={card.cardHolderName || ''}
            onChange={(e) => updateCard(index, 'cardHolderName', e.target.value.toUpperCase())}
            placeholder="YOUR NAME"
            className="text-xs sm:text-sm font-medium bg-transparent border-none outline-none w-full text-white placeholder-white/30 focus:ring-1 focus:ring-white/30 rounded px-1 uppercase truncate"
          />
        </div>

        {/* Expires */}
        <div className="w-16">
          <div className="text-[10px] sm:text-xs opacity-70 mb-1 uppercase tracking-wider">Expires</div>
          <input
            type="text"
            value={card.expiryDate || ''}
            onChange={(e) => updateCard(index, 'expiryDate', formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="text-xs sm:text-sm font-medium bg-transparent border-none outline-none w-full text-white placeholder-white/30 focus:ring-1 focus:ring-white/30 rounded px-1"
          />
        </div>

        {/* CVV - Now on Front */}
        <div className="w-12">
          <div className="text-[10px] sm:text-xs opacity-70 mb-1 uppercase tracking-wider">CVV</div>
          <input
            type="text"
            value={card.cvv || ''}
            onChange={(e) => updateCard(index, 'cvv', e.target.value.replace(/\D/g, ''))}
            onFocus={() => setFocusedField(`cvv-${index}`)}
            onBlur={() => setFocusedField(null)}
            placeholder="123"
            maxLength={4}
            className="text-xs sm:text-sm font-medium bg-transparent border-none outline-none w-full text-white placeholder-white/30 focus:ring-1 focus:ring-white/30 rounded px-1"
          />
        </div>
      </div>
    </div>
  </div>
);

export function CreditCardsStep({ data, onChange, errors }: CreditCardsStepProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const cards = data.creditCards || [];

  const addCard = () => {
    const newCard: CreditCardType = {
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      cardLimit: 0,
      bankName: '',
      cardType: 'Credit',
      cardHolderName: '',
      cardHolderMobile: '',
      cardDueDate: '',
      billGenerationDate: '',
    };
    onChange('creditCards', [...cards, newCard]);
  };

  const removeCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index);
    onChange('creditCards', updatedCards);
  };

  const updateCard = (index: number, field: keyof CreditCardType, value: any) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    
    if (field === 'cardNumber') {
      const formatted = formatCardNumber(value);
      updatedCards[index].cardNumber = formatted;
      updatedCards[index].cardType = getCardType(formatted);
    }
    
    onChange('creditCards', updatedCards);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            Add Credit Card
          </h2>
          <p className="text-sm text-gray-600 mt-1">Enter your card details</p>
        </div>

        <div className="space-y-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-2 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Card {index + 1}</h3>
                  {cards.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCard(index)}
                      className="h-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* The Interactive Visual Card */}
                <div className="mb-6">
                  <CardPreview 
                    card={card} 
                    index={index}
                    updateCard={updateCard}
                    setFocusedField={setFocusedField}
                  />
                </div>

                {/* Additional Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Mobile Number</Label>
                    <Input
                      type="tel"
                      value={card.cardHolderMobile || ''}
                      onChange={(e) => updateCard(index, 'cardHolderMobile', e.target.value.replace(/\D/g, ''))}
                      placeholder="10 digit mobile"
                      maxLength={10}
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Card Limit (₹)</Label>
                    <Input
                      type="number"
                      value={card.cardLimit || ''}
                      onChange={(e) => updateCard(index, 'cardLimit', e.target.value)}
                      placeholder="Credit limit"
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Bill Date</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={card.billGenerationDate || ''}
                        onChange={(e) => updateCard(index, 'billGenerationDate', e.target.value)}
                        placeholder="Day"
                        className="h-11"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Due Date</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={card.cardDueDate || ''}
                        onChange={(e) => updateCard(index, 'cardDueDate', e.target.value)}
                        placeholder="Day"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {cards.length < 5 && (
            <Button
              type="button"
              onClick={addCard}
              className="w-full h-12 text-base"
              variant="outline"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Card
            </Button>
          )}

          {errors.creditCards && (
            <div className="text-red-500 text-sm px-4">
              {errors.creditCards}
            </div>
          )}
        </div>
      </div>
  );
}