import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FormData } from '@/types/form';
import { ProgressBar } from '@/components/ProgressBar';
import { FormNavigation } from '@/components/FormNavigation';
import { PersonalInfoStep } from '@/components/steps/PersonalInfoStep';
import { DocumentsStep } from '@/components/steps/DocumentsStep';
import { CreditCardsStep } from '@/components/steps/CreditCardsStep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import {
  validateMobile,
  
} from '@/lib/validation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;
const STORAGE_KEY = 'client_form_data';

export default function FormPage() {
  const { distributorId } = useParams<{ distributorId: string }>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    creditCards: [{ cardNumber: '', cvv: '', expiryDate: '', cardLimit: 0, bankName: '', cardType: 'Unknown' }],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [distributorName, setDistributorName] = useState('');
  const [isValidating, setIsValidating] = useState(true);

  // Validate distributor on mount
  useEffect(() => {
    const validateDistributor = async () => {
      if (!distributorId) {
        navigate('/error?reason=missing_id');
        return;
      }

      try {
        const distRef = doc(db, 'distributors', distributorId);
        const distSnap = await getDoc(distRef);

        if (!distSnap.exists()) {
          navigate('/error?reason=invalid_id');
          return;
        }

        setDistributorName(distSnap.data().name);
        setIsValidating(false);
      } catch (error) {
        console.error('Error validating distributor:', error);
        navigate('/error?reason=validation_error');
      }
    };

    validateDistributor();
  }, [distributorId, navigate]);

  // Load saved form data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    if (currentStep > 1 && Object.keys(formData).length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, currentStep]);

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (step) {
      case 1: // Personal Info
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.mobile) {
          newErrors.mobile = 'Mobile number is required';
        } else if (!validateMobile(formData.mobile)) {
          newErrors.mobile = 'Invalid mobile number';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email address';
        }
        break;

      case 2: // Documents
       
        break;
     
      case 3: // Credit Cards
        if (!formData.creditCards || formData.creditCards.length === 0) {
          newErrors.creditCards = 'At least one credit card is required';
        } 
        break;

      case 4: // Review
        if (!confirmed) {
          toast.error('Please confirm that your information is accurate');
          return false;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors before proceeding');
      console.error('Validation errors:', errors);
      return;
    }

    if (currentStep === TOTAL_STEPS) {
      await handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const clientId = `CLIENT-${Date.now()}`;

      // Create client document with image URLs from Cloudinary
      const clientData = {
        distributorId: distributorId!,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || '',
        dateOfBirth: formData.dateOfBirth || '',
        address: formData.address || '',
        aadhaarImageUrl: formData.aadhaarImageUrl || '', // Cloudinary URL
        panImageUrl: formData.panImageUrl || '', // Cloudinary URL
        creditCards: formData.creditCards?.map(card => ({
          ...card,
          cardNumber: card.cardNumber.replace(/\D/g, ''),
        })),
        submittedAt: serverTimestamp(),
        source: 'client_form',
      };

      await addDoc(collection(db, 'clients'), clientData);

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Navigate to success page
      navigate(`/success?ref=${clientId}`);
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Priyanka Enterprises</h1>
          <p className="text-primary-foreground/90">Client Details Collection Form</p>
          {distributorName && (
            <p className="text-sm mt-2 text-primary-foreground/80">
              Distributor: {distributorName}
            </p>
          )}
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {/* Form Steps */}
          {currentStep === 1 && (
            <PersonalInfoStep
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <DocumentsStep
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}
          {/* {currentStep === 3 && (
            <PaymentRatesStep
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )} */}
          {currentStep === 3 && (
            <CreditCardsStep
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <ReviewStep
              data={formData}
              onEdit={handleEditStep}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
            />
          )}

          {/* Navigation */}
          <FormNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isNextDisabled={currentStep === 5 && !confirmed}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}