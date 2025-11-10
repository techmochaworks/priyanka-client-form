import { Label } from '@/components/ui/label';
import { FormData, AadhaarImage } from '@/types/form';
import { Upload, Camera, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface DocumentsStepProps {
  data: Partial<FormData>;
  onChange: (field: keyof FormData, value: any) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export const DocumentsStep = ({ data, onChange, errors }: DocumentsStepProps) => {
  const aadhaarFrontFileRef = useRef<HTMLInputElement>(null);
  const aadhaarBackFileRef = useRef<HTMLInputElement>(null);
  const panFileRef = useRef<HTMLInputElement>(null);
  const aadhaarFrontCameraRef = useRef<HTMLInputElement>(null);
  const aadhaarBackCameraRef = useRef<HTMLInputElement>(null);
  const panCameraRef = useRef<HTMLInputElement>(null);

  const [uploadingAadhaarFront, setUploadingAadhaarFront] = useState(false);
  const [uploadingAadhaarBack, setUploadingAadhaarBack] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);

  const handleFileUpload = async (
    side: 'front' | 'back' | 'pan',
    file: File | null,
    setUploading: (value: boolean) => void
  ) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      
      if (side === 'pan') {
        onChange('panImageUrl', imageUrl);
      } else {
        const currentAadhaarImages = data.aadhaarImages || [];
        const existingIndex = currentAadhaarImages.findIndex(img => img.side === side);
        
        let updatedImages: AadhaarImage[];
        if (existingIndex !== -1) {
          updatedImages = [...currentAadhaarImages];
          updatedImages[existingIndex] = { url: imageUrl, side };
        } else {
          updatedImages = [...currentAadhaarImages, { url: imageUrl, side }];
        }
        
        onChange('aadhaarImages', updatedImages);
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (side: 'front' | 'back' | 'pan') => {
    if (side === 'pan') {
      onChange('panImageUrl', '');
    } else {
      const currentAadhaarImages = data.aadhaarImages || [];
      const updatedImages = currentAadhaarImages.filter(img => img.side !== side);
      onChange('aadhaarImages', updatedImages);
    }
    toast.success('Image removed');
  };

  const getAadhaarImageUrl = (side: 'front' | 'back'): string | undefined => {
    return data.aadhaarImages?.find(img => img.side === side)?.url;
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
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="space-y-6">
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4" />
                Upload Aadhaar Card - Front Side
              </Label>

              {getAadhaarImageUrl('front') ? (
                <div className="relative">
                  <img
                    src={getAadhaarImageUrl('front')}
                    alt="Aadhaar front preview"
                    className="w-full h-48 object-cover rounded-md border border-border"
                  />
                  <button
                    title="Remove front image"
                    type="button"
                    onClick={() => removeImage('front')}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    title="Upload Aadhaar front"
                    ref={aadhaarFrontFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('front', e.target.files?.[0] || null, setUploadingAadhaarFront)}
                    className="hidden"
                  />
                  <input
                    title="Capture Aadhaar front"
                    ref={aadhaarFrontCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload('front', e.target.files?.[0] || null, setUploadingAadhaarFront)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => aadhaarFrontFileRef.current?.click()}
                    disabled={uploadingAadhaarFront}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingAadhaarFront ? 'Uploading...' : 'Choose File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => aadhaarFrontCameraRef.current?.click()}
                    disabled={uploadingAadhaarFront}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    {uploadingAadhaarFront ? 'Uploading...' : 'Take Photo'}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Max size: 5MB, Format: JPG, PNG</p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4" />
                Upload Aadhaar Card - Back Side
              </Label>

              {getAadhaarImageUrl('back') ? (
                <div className="relative">
                  <img
                    src={getAadhaarImageUrl('back')}
                    alt="Aadhaar back preview"
                    className="w-full h-48 object-cover rounded-md border border-border"
                  />
                  <button
                    title="Remove back image"
                    type="button"
                    onClick={() => removeImage('back')}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    title="Upload Aadhaar back"
                    ref={aadhaarBackFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('back', e.target.files?.[0] || null, setUploadingAadhaarBack)}
                    className="hidden"
                  />
                  <input
                    title="Capture Aadhaar back"
                    ref={aadhaarBackCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload('back', e.target.files?.[0] || null, setUploadingAadhaarBack)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => aadhaarBackFileRef.current?.click()}
                    disabled={uploadingAadhaarBack}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingAadhaarBack ? 'Uploading...' : 'Choose File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => aadhaarBackCameraRef.current?.click()}
                    disabled={uploadingAadhaarBack}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    {uploadingAadhaarBack ? 'Uploading...' : 'Take Photo'}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Max size: 5MB, Format: JPG, PNG</p>
            </div>

            {errors.aadhaarImages && (
              <p className="text-sm text-destructive">{errors.aadhaarImages}</p>
            )}
          </div>
        </div>

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
                    title="Remove PAN image"
                    type="button"
                    onClick={() => removeImage('pan')}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                    title="Upload PAN"
                    ref={panFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('pan', e.target.files?.[0] || null, setUploadingPan)}
                    className="hidden"
                  />
                  <input
                    title="Capture PAN"
                    ref={panCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload('pan', e.target.files?.[0] || null, setUploadingPan)}
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
              {errors.panImageUrl && (
                <p className="text-sm text-destructive mt-1">{errors.panImageUrl}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};