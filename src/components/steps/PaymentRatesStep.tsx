import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '@/types/form';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

interface PaymentRatesStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const PaymentRatesStep = ({ data, onChange, errors }: PaymentRatesStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment Rates</h2>
        <p className="text-muted-foreground">
          Specify your payment and payout rates
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="billPaymentRate" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Bill Payment Rate <span className="text-destructive">*</span>
          </Label>
          <Input
            id="billPaymentRate"
            type="number"
            step="0.01"
            value={data.billPaymentRate || ''}
            onChange={(e) => onChange('billPaymentRate', parseFloat(e.target.value))}
            placeholder="Enter rate (e.g., 2.5 for 2.5%)"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">Enter as percentage or fixed amount</p>
          {errors.billPaymentRate && (
            <p className="text-sm text-destructive mt-1">{errors.billPaymentRate}</p>
          )}
        </div>

        <div>
          <Label htmlFor="payoutRate" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Payout Rate <span className="text-destructive">*</span>
          </Label>
          <Input
            id="payoutRate"
            type="number"
            step="0.01"
            value={data.payoutRate || ''}
            onChange={(e) => onChange('payoutRate', parseFloat(e.target.value))}
            placeholder="Enter payout rate"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">The rate at which you'll receive payouts</p>
          {errors.payoutRate && <p className="text-sm text-destructive mt-1">{errors.payoutRate}</p>}
        </div>

        <div>
          <Label htmlFor="preferredPaymentMethod" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Preferred Payment Method <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.preferredPaymentMethod || ''}
            onValueChange={(value) => onChange('preferredPaymentMethod', value)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferredPaymentMethod && (
            <p className="text-sm text-destructive mt-1">{errors.preferredPaymentMethod}</p>
          )}
        </div>
      </div>

      <div className="p-4 bg-accent rounded-lg">
        <p className="text-sm text-accent-foreground">
          <strong>Note:</strong> These rates will be used to calculate your payments and payouts. 
          Please ensure they are accurate.
        </p>
      </div>
    </div>
  );
};
