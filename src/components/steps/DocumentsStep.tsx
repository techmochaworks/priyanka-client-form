import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/types/form';
import { formatAadhaar, formatPAN } from '@/lib/validation';
import { CreditCard, FileText, Upload, Camera, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface DocumentsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const DocumentsStep = ({ data, onChange, errors }: DocumentsStepProps) => {
  const aadhaarFileRef = useRef<HTMLInputElement>(null);
  const panFileRef = useRef<HTMLInputElement>(null);
  const aadhaarCameraRef = useRef<HTMLInputElement>(null);
  const panCameraRef = useRef<HTMLInputElement>(null);

  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);

  const handleAadhaarChange = (value: string) => {
    const formatted = formatAadhaar(value);
    onChange('aadhaar', formatted);
  };

  const handlePANChange = (value: string) => {
    const formatted = formatPAN(value);
    onChange('pan', formatted);
  };

  const handleFileUpload = async (
    field: 'aadhaarImageUrl' | 'panImageUrl',
    file: File | null,
    setUploading: (value: boolean) => void
  ) => {
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      onChange(field, imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (field: 'aadhaarImageUrl' | 'panImageUrl') => {
    onChange(field, '');
    toast.success('Image removed');
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
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Aadhaar Card 
              </Label>

              {data.aadhaarImageUrl ? (
                <div className="mt-2 relative">
                  <img
                    src={data.aadhaarImageUrl}
                    alt="Aadhaar preview"
                    className="w-full h-48 object-cover rounded-md border border-border"
                  />
                  <button
                  title='d'
                    type="button"
                    onClick={() => removeImage('aadhaarImageUrl')}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                  title='s'
                    ref={aadhaarFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('aadhaarImageUrl', e.target.files?.[0] || null, setUploadingAadhaar)}
                    className="hidden"
                  />
                  <input
                  title='s'
                    ref={aadhaarCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload('aadhaarImageUrl', e.target.files?.[0] || null, setUploadingAadhaar)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => aadhaarFileRef.current?.click()}
                    disabled={uploadingAadhaar}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingAadhaar ? 'Uploading...' : 'Choose File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => aadhaarCameraRef.current?.click()}
                    disabled={uploadingAadhaar}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    {uploadingAadhaar ? 'Uploading...' : 'Take Photo'}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Max size: 5MB, Format: JPG, PNG</p>
            </div>
          </div>
        </div>

        {/* PAN Section */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="space-y-4">
            

            <div>
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload PAN Card 
              </Label>

              {data.panImageUrl ? (
                <div className="mt-2 relative">
                  <img
                    src={data.panImageUrl}
                    alt="PAN preview"
                    className="w-full h-48 object-cover rounded-md border border-border"
                  />
                  <button
                  title='s'
                    type="button"
                    onClick={() => removeImage('panImageUrl')}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                  title='s'
                    ref={panFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('panImageUrl', e.target.files?.[0] || null, setUploadingPan)}
                    className="hidden"
                  />
                  <input
                  title='s'
                    ref={panCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload('panImageUrl', e.target.files?.[0] || null, setUploadingPan)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => panFileRef.current?.click()}
                    disabled={uploadingPan}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingPan ? 'Uploading...' : 'Choose File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => panCameraRef.current?.click()}
                    disabled={uploadingPan}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    {uploadingPan ? 'Uploading...' : 'Take Photo'}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Max size: 5MB, Format: JPG, PNG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};