import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/types/form';
import { formatMobile, validateMobile } from '@/lib/validation';
import { User, Phone, Mail, Calendar, MapPin } from 'lucide-react';

interface PersonalInfoStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const PersonalInfoStep = ({ data, onChange, errors }: PersonalInfoStepProps) => {
  const handleMobileChange = (value: string) => {
    const formatted = formatMobile(value);
    onChange('mobile', formatted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-muted-foreground">
          Please provide your basic details to get started
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Enter your full name"
            className="mt-1.5"
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="mobile" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mobile"
            type="tel"
            value={data.mobile || ''}
            onChange={(e) => handleMobileChange(e.target.value)}
            placeholder="10-digit mobile number"
            maxLength={10}
            className="mt-1.5"
          />
          {errors.mobile && <p className="text-sm text-destructive mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="your.email@example.com (optional)"
            className="mt-1.5"
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth || ''}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </Label>
          <Textarea
            id="address"
            value={data.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Enter your complete address (optional)"
            rows={3}
            className="mt-1.5 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
