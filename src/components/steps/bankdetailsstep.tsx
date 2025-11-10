import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Building2, User, Phone, CreditCard } from 'lucide-react';
import {BankAccount, FormData } from '@/types/form';

interface BankDetailsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const BankDetailsStep = ({ data, onChange, errors }: BankDetailsStepProps) => {
  const accounts = data.bankAccounts || [];

  const addAccount = () => {
    const newAccount: BankAccount = {
      accountNumber: '',
      accountHolderName: '',
      mobile: '',
      bankName: '',
      ifscCode: '',
      branch: '',
    };
    onChange('bankAccounts', [...accounts, newAccount]);
  };

  const removeAccount = (index: number) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    onChange('bankAccounts', updatedAccounts);
  };

  const updateAccount = (index: number, field: keyof BankAccount, value: any) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    onChange('bankAccounts', updatedAccounts);
  };

  const getAccountDisplayName = (account: BankAccount, index: number) => {
    if (account.bankName && account.bankName !== '') {
      return account.bankName;
    }
    return `Account ${index + 1}`;
  };

  const formatIFSC = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 11);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Bank Account Details</h2>
        <p className="text-muted-foreground">
          Add your bank account information (minimum 1 account required)
        </p>
      </div>

      <div className="space-y-4">
        {accounts.map((account, index) => (
          <div key={index} className="p-4 border-2 border-border rounded-lg bg-card relative">
            {accounts.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAccount(index)}
                className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{getAccountDisplayName(account, index)}</h3>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor={`bankName-${index}`} className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={account.bankName}
                  onValueChange={(value) => updateAccount(index, 'bankName', value)}
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
                    <SelectItem value="Punjab National Bank">Punjab National Bank</SelectItem>
                    <SelectItem value="Bank of Baroda">Bank of Baroda</SelectItem>
                    <SelectItem value="Canara Bank">Canara Bank</SelectItem>
                    <SelectItem value="Union Bank of India">Union Bank of India</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {account.bankName === 'Other' && (
                <div>
                  <Label htmlFor={`customBankName-${index}`}>
                    Enter Bank Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`customBankName-${index}`}
                    value={account.bankName || ''}
                    onChange={(e) => updateAccount(index, 'bankName', e.target.value)}
                    placeholder="Enter your bank name"
                    className="mt-1.5"
                  />
                </div>
              )}

              <div>
                <Label htmlFor={`accountHolderName-${index}`} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account Holder Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`accountHolderName-${index}`}
                  value={account.accountHolderName || ''}
                  onChange={(e) => updateAccount(index, 'accountHolderName', e.target.value)}
                  placeholder="Name as per bank records"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor={`mobile-${index}`} className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`mobile-${index}`}
                  value={account.mobile || ''}
                  onChange={(e) => updateAccount(index, 'mobile', e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor={`accountNumber-${index}`} className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`accountNumber-${index}`}
                  value={account.accountNumber}
                  onChange={(e) => updateAccount(index, 'accountNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`ifscCode-${index}`}>
                    IFSC Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`ifscCode-${index}`}
                    value={account.ifscCode}
                    onChange={(e) => updateAccount(index, 'ifscCode', formatIFSC(e.target.value))}
                    placeholder="e.g., HDFC0001234"
                    maxLength={11}
                    className="mt-1.5 uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">11 characters</p>
                </div>

                <div>
                  <Label htmlFor={`branch-${index}`}>
                    Branch <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`branch-${index}`}
                    value={account.branch}
                    onChange={(e) => updateAccount(index, 'branch', e.target.value)}
                    placeholder="Branch name/location"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {accounts.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addAccount}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Account
          </Button>
        )}

        {errors.bankAccounts && (
          <p className="text-sm text-destructive">{errors.bankAccounts}</p>
        )}
      </div>

      <div className="p-4 bg-accent rounded-lg">
        <p className="text-sm text-accent-foreground">
          <strong>Security Note:</strong> Your bank account information is securely stored and encrypted. 
          We never share your bank details with any third party.
        </p>
      </div>
    </div>
  );
};