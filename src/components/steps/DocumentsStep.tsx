import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/types/form';
import { formatAadhaar, formatPAN } from '@/lib/validation';
import { CreditCard, FileText, Upload } from 'lucide-react';
import { useRef } from 'react';

interface DocumentsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const DocumentsStep = ({ data, onChange, errors }: DocumentsStepProps) => {
  const aadhaarFileRef = useRef<HTMLInputElement>(null);
  const panFileRef = useRef<HTMLInputElement>(null);

  const handleAadhaarChange = (value: string) => {
    const formatted = formatAadhaar(value);
    onChange('aadhaar', formatted);
  };

  const handlePANChange = (value: string) => {
    const formatted = formatPAN(value);
    onChange('pan', formatted);
  };

  const handleFileChange = (field: 'aadhaarImage' | 'panImage', file: File | null) => {
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
    }
    onChange(field, file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Identity Documents</h2>
        <p className="text-muted-foreground">
          Please provide your Aadhaar and PAN details for verification
        </p>
      </div>

      <div className="space-y-6">
        {/* Aadhaar Section */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="space-y-4">
            <div>
              <Label htmlFor="aadhaar" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Aadhaar Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="aadhaar"
                value={data.aadhaar || ''}
                onChange={(e) => handleAadhaarChange(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">12-digit Aadhaar number</p>
              {errors.aadhaar && <p className="text-sm text-destructive mt-1">{errors.aadhaar}</p>}
            </div>

            <div>
              <Label htmlFor="aadhaarImage" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Aadhaar Card (Optional)
              </Label>
              <input
                ref={aadhaarFileRef}
                id="aadhaarImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('aadhaarImage', e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => aadhaarFileRef.current?.click()}
                className="mt-1.5 w-full px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {data.aadhaarImage ? data.aadhaarImage.name : 'Choose file'}
              </button>
              <p className="text-xs text-muted-foreground mt-1">Max size: 2MB, Format: JPG, PNG</p>
            </div>
          </div>
        </div>

        {/* PAN Section */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pan" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PAN Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pan"
                value={data.pan || ''}
                onChange={(e) => handlePANChange(e.target.value)}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Format: 5 letters + 4 digits + 1 letter</p>
              {errors.pan && <p className="text-sm text-destructive mt-1">{errors.pan}</p>}
            </div>

            <div>
              <Label htmlFor="panImage" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload PAN Card (Optional)
              </Label>
              <input
                ref={panFileRef}
                id="panImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('panImage', e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => panFileRef.current?.click()}
                className="mt-1.5 w-full px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {data.panImage ? data.panImage.name : 'Choose file'}
              </button>
              <p className="text-xs text-muted-foreground mt-1">Max size: 2MB, Format: JPG, PNG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
