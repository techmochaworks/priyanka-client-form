import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard as CreditCardType, FormData } from '@/types/form';
import { formatCardNumber, formatExpiry, getCardType } from '@/lib/validation';
import { CreditCard, Plus, Trash2, Eye, EyeOff, Building2 } from 'lucide-react';
import { useState } from 'react';

interface CreditCardsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const CreditCardsStep = ({ data, onChange, errors }: CreditCardsStepProps) => {
  const [showCVV, setShowCVV] = useState<Record<number, boolean>>({});
  
  const cards = data.creditCards || [];

  const addCard = () => {
    const newCard: CreditCardType = {
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      cardLimit: 0,
      bankName: '',
      cardType: 'Unknown',
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
    
    // Auto-detect card type when card number changes
    if (field === 'cardNumber') {
      const formatted = formatCardNumber(value);
      updatedCards[index].cardNumber = formatted;
      updatedCards[index].cardType = getCardType(formatted);
    }
    
    onChange('creditCards', updatedCards);
  };

  const toggleShowCVV = (index: number) => {
    setShowCVV(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Credit Card Details</h2>
        <p className="text-muted-foreground">
          Add your credit card information (minimum 1 card required)
        </p>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div key={index} className="p-4 border-2 border-border rounded-lg bg-card relative">
            {cards.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCard(index)}
                className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Card {index + 1}</h3>
              {card.cardType !== 'Unknown' && (
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  {card.cardType}
                </span>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor={`cardNumber-${index}`}>
                  Card Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`cardNumber-${index}`}
                  value={card.cardNumber}
                  onChange={(e) => updateCard(index, 'cardNumber', e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`cvv-${index}`}>
                    CVV <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id={`cvv-${index}`}
                      type={showCVV[index] ? 'text' : 'password'}
                      value={card.cvv}
                      onChange={(e) => updateCard(index, 'cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="XXX"
                      maxLength={4}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowCVV(index)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCVV[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`expiry-${index}`}>
                    Expiry Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`expiry-${index}`}
                    value={card.expiryDate}
                    onChange={(e) => updateCard(index, 'expiryDate', formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`cardLimit-${index}`}>
                  Card Limit (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`cardLimit-${index}`}
                  type="number"
                  value={card.cardLimit || ''}
                  onChange={(e) => updateCard(index, 'cardLimit', parseFloat(e.target.value) || 0)}
                  placeholder="Enter card limit"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor={`bankName-${index}`} className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={card.bankName}
                  onValueChange={(value) => updateCard(index, 'bankName', value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                    <SelectItem value="ICICI Bank">ICICI Bank</SelectItem>
                    <SelectItem value="SBI">State Bank of India</SelectItem>
                    <SelectItem value="Axis Bank">Axis Bank</SelectItem>
                    <SelectItem value="Kotak Mahindra Bank">Kotak Mahindra Bank</SelectItem>
                    <SelectItem value="IDFC First Bank">IDFC First Bank</SelectItem>
                    <SelectItem value="Yes Bank">Yes Bank</SelectItem>
                    <SelectItem value="IndusInd Bank">IndusInd Bank</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        {cards.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={addCard}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Card
          </Button>
        )}

        {errors.creditCards && (
          <p className="text-sm text-destructive">{errors.creditCards}</p>
        )}
      </div>

      <div className="p-4 bg-accent rounded-lg">
        <p className="text-sm text-accent-foreground">
          <strong>Security Note:</strong> Your card information is securely stored and encrypted. 
          We never share your card details with any third party.
        </p>
      </div>
    </div>
  );
};
