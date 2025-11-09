import { FormData } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit } from 'lucide-react';

interface ReviewStepProps {
  data: Partial<FormData>;
  onEdit: (step: number) => void;
  confirmed: boolean;
  onConfirmChange: (value: boolean) => void;
}


export const ReviewStep = ({ data, onEdit, confirmed, onConfirmChange }: ReviewStepProps) => {
  console.log(data)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Review & Submit</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      {/* Personal Information */}
      <div className="p-4 border border-border rounded-lg bg-card">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name:</dt>
            <dd className="font-medium">{data.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Mobile:</dt>
            <dd className="font-medium">{data.mobile}</dd>
          </div>
          {data.email && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd className="font-medium">{data.email}</dd>
            </div>
          )}
          {data.dateOfBirth && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date of Birth:</dt>
              <dd className="font-medium">{data.dateOfBirth}</dd>
            </div>
          )}
          {data.address && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Address:</dt>
              <dd className="font-medium text-right max-w-[200px]">{data.address}</dd>
            </div>
          )}
        </dl>
      </div>

       <div className="p-4 border border-border rounded-lg bg-card">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">Identity Documents</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <dl className="space-y-2 text-sm">
          
          <div className="flex justify-between items-center">
  <dt className="text-muted-foreground">Aadhaar Image:</dt>
  <div className="flex items-center gap-2">
    <dd className="font-medium">{data.aadhaarImageUrl ? '✓ Uploaded' : 'Not uploaded'}</dd>
    {data.aadhaarImageUrl && (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.open(data.aadhaarImageUrl, '_blank')}
      >
        View
      </Button>
    )}
  </div>
</div>

          <div className="flex justify-between items-center">
  <dt className="text-muted-foreground">Pan Image:</dt>
  <div className="flex items-center gap-2">
    <dd className="font-medium">{data.panImageUrl ? '✓ Uploaded' : 'Not uploaded'}</dd>
    {data.panImageUrl && (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.open(data.panImageUrl, '_blank')}
      >
        View
      </Button>
    )}
  </div>
</div>
        </dl>
      </div>



      <div className="p-4 border border-border rounded-lg bg-card">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">Credit Cards</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="space-y-3">
          {data.creditCards?.map((card, index) => (
            <div key={index} className="p-3 bg-accent rounded-md">
              <p className="font-medium mb-1">{card.bankName} </p>
              <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
              <p className="text-sm text-muted-foreground">Limit: ₹{card.cardLimit.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation */}
      <div className="flex items-start space-x-2 p-4 bg-accent rounded-lg">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={onConfirmChange}
        />
        <label
          htmlFor="confirm"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I confirm that all the information provided above is accurate and complete to the best of my knowledge.
        </label>
      </div>
    </div>
  );
};
