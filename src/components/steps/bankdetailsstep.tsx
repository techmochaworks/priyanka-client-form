import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BankAccount, FormData } from '@/types/form';
import { Plus, Trash2, Building2 } from 'lucide-react';

interface BankDetailsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const BankDetailsStep = ({ data, onChange, errors }: BankDetailsStepProps) => {
  const accounts = data.bankAccounts || [];

  const addAccount = () => {
    onChange('bankAccounts', [...accounts, { 
        accountNumber: '', bankName: '', ifscCode: '', accountHolderName: '', branch: '', mobile: '' 
    }]);
  };

  const removeAccount = (index: number) => {
    onChange('bankAccounts', accounts.filter((_, i) => i !== index));
  };

  const updateAccount = (index: number, field: keyof BankAccount, val: string) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: val };
    onChange('bankAccounts', updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <p className="text-muted-foreground text-sm">
         You can skip this step if you don't have these details handy.
      </p>

      {accounts.map((acc, index) => (
        <div key={index} className="bg-card border rounded-xl p-5 shadow-sm relative group">
          <Button
            variant="ghost" size="icon"
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
            onClick={() => removeAccount(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="grid gap-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{acc.bankName || 'New Account'}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs">Bank Name</Label>
                    <Input 
                        placeholder="e.g. HDFC" 
                        value={acc.bankName} 
                        onChange={e => updateAccount(index, 'bankName', e.target.value)} 
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Account Number</Label>
                    <Input 
                        placeholder="XXXX XXXX XXXX" 
                        value={acc.accountNumber} 
                        onChange={e => updateAccount(index, 'accountNumber', e.target.value)} 
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">IFSC Code</Label>
                    <Input 
                        placeholder="HDFC000..." 
                        className="uppercase"
                        value={acc.ifscCode} 
                        onChange={e => updateAccount(index, 'ifscCode', e.target.value)} 
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Holder Name</Label>
                    <Input 
                        placeholder="Name on passbook" 
                        value={acc.accountHolderName} 
                        onChange={e => updateAccount(index, 'accountHolderName', e.target.value)} 
                    />
                </div>
             </div>
          </div>
        </div>
      ))}

      {accounts.length === 0 && (
         <div className="text-center py-8 border-2 border-dashed rounded-xl">
            <p className="text-sm text-muted-foreground mb-4">No bank accounts added</p>
            <Button onClick={addAccount} variant="secondary">
                <Plus className="w-4 h-4 mr-2" /> Add Bank Account
            </Button>
         </div>
      )}

      {accounts.length > 0 && (
        <Button onClick={addAccount} variant="outline" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add Another
        </Button>
      )}

      {errors.bankAccounts && <p className="text-destructive text-sm">{errors.bankAccounts}</p>}
    </div>
  );
};