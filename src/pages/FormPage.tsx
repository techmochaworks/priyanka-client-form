import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, serverTimestamp, writeBatch, query, orderBy, getDocs, limit, where, arrayUnion } from 'firebase/firestore';
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
import { useAuth } from '@/context/authcontext';


const TOTAL_STEPS = 5;
const STORAGE_KEY = 'client_form_data';

export default function FormPage() {
  const { distributorId } = useParams<{ distributorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editClientId = searchParams.get('edit'); // Check if we're editing
  
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
  const [isEditMode, setIsEditMode] = useState(false);

  // Load existing client data if in edit mode
  useEffect(() => {
    const loadClientData = async () => {
      if (!editClientId) return;

      try {
        const clientRef = doc(db, 'clients', editClientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const clientData = clientSnap.data();
          setFormData({
            name: clientData.name,
            mobile: clientData.mobile,
            email: clientData.email,
            address: clientData.address,
            aadhaarImages: clientData.aadhaarImages || [],
            panImageUrl: clientData.panImageUrl,
            bankAccounts: clientData.bankAccounts || [],
            creditCards: clientData.creditCards || [],
          });
          setIsEditMode(true);
        }
      } catch (error) {
        console.error('Error loading client data:', error);
        toast.error('Failed to load client data');
      }
    };

    loadClientData();
  }, [editClientId]);

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
    if (!isEditMode) {
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
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode && currentStep > 1 && Object.keys(formData).length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, currentStep, isEditMode]);

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

    // switch (step) {
    //   case 1:
    //     if (!formData.name?.trim()) newErrors.name = 'Name is required';
    //     if (!formData.mobile) {
    //       newErrors.mobile = 'Mobile number is required';
    //     } else if (!validateMobile(formData.mobile)) {
    //       newErrors.mobile = 'Invalid mobile number';
    //     }
    //     if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //       newErrors.email = 'Invalid email address';
    //     }
    //     break;
    //      case 2:
    //     const aadhaarImages = formData.aadhaarImages || [];
    //     const hasFront = aadhaarImages.some(img => img.side === 'front');
    //     const hasBack = aadhaarImages.some(img => img.side === 'back');
        
    //     if (!hasFront || !hasBack) {
    //       newErrors.aadhaarImages = 'Both front and back sides of Aadhaar card are required';
    //     }
        
    //     if (!formData.panImageUrl?.trim()) {
    //       newErrors.panImageUrl = 'PAN card image is required';
    //     }
    //     break;
     
    //   case 3:
    //     if (!formData.bankAccounts || formData.bankAccounts.length === 0) {
    //       newErrors.bankAccounts = 'At least one bank account is required';
    //     } else {
    //       const invalidAccounts = formData.bankAccounts.some(account => {
    //         return !account.accountNumber?.trim() ||
    //                !account.accountHolderName?.trim() ||
    //                !account.mobile?.trim() ||
    //                account.mobile.length !== 10 ||
    //                !account.bankName?.trim() ||
    //                !account.ifscCode?.trim() ||
    //                !validateIFSC(account.ifscCode) ||
    //                !account.branch?.trim();
    //       });

    //       if (invalidAccounts) {
    //         newErrors.bankAccounts = 'Please fill all required fields correctly for all bank accounts';
    //       }
    //     }
    //     break;

    //   case 4:
    //     if (!formData.creditCards || formData.creditCards.length === 0) {
    //       newErrors.creditCards = 'At least one credit card is required';
    //     } else {
    //       const invalidCards = formData.creditCards.some(card => {
    //         const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    //         return !card.bankName?.trim() ||
    //                !card.cardHolderName?.trim() ||
    //                !card.cardHolderMobile?.trim() ||
    //                card.cardHolderMobile.length !== 10 ||
    //                cardNumberDigits.length < 13 ||
    //                !card.cvv?.trim() ||
    //                card.cvv.length < 3 ||
    //                !card.expiryDate?.trim() ||
    //                !card.cardLimit ||
    //                card.cardLimit <= 0 ||
    //                !card.billGenerationDate?.trim() ||
    //                !card.cardDueDate?.trim();
    //       });

    //       if (invalidCards) {
    //         newErrors.creditCards = 'Please fill all required fields correctly for all credit cards';
    //       }
    //     }
    //     break;

    //   case 5:
    //     if (!confirmed) {
    //       toast.error('Please confirm that your information is accurate');
    //       return false;
    //     }
    //     break;
    // }
switch (step) {
      case 1: // Personal Info (REQUIRED)
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.mobile) newErrors.mobile = 'Mobile is required';
        else if (!validateMobile(formData.mobile)) newErrors.mobile = 'Invalid mobile';
        break;

      case 2: // Credit Cards (REQUIRED)
        if (!formData.creditCards || formData.creditCards.length === 0) {
          newErrors.creditCards = 'Please add at least one credit card';
        } else {
          // Strict validation for cards
          const invalidCards = formData.creditCards.some(card => {
             return !card.bankName || !card.cardNumber || card.cardNumber.length < 15 || !card.cvv || !card.expiryDate;
          });
          if (invalidCards) newErrors.creditCards = 'Please complete all card details';
        }
        break;

      case 3: // Documents (OPTIONAL)
        // Only validate if they uploaded one side but not the other
        const aadhaarImages = formData.aadhaarImages || [];
        const hasFront = aadhaarImages.some(img => img.side === 'front');
        const hasBack = aadhaarImages.some(img => img.side === 'back');
        
        if ((hasFront && !hasBack) || (!hasFront && hasBack)) {
            newErrors.aadhaarImages = 'Please upload both sides if uploading Aadhaar';
        }
        // Pan is now fully optional, no check needed unless you want to check format
        break;

      case 4: // Bank Details (OPTIONAL)
        // If they started filling a bank account, make sure it's complete. 
        // If array is empty or fields are empty, let it pass.
        if (formData.bankAccounts && formData.bankAccounts.length > 0) {
            const hasPartialData = formData.bankAccounts.some(acc => 
                acc.accountNumber || acc.bankName || acc.ifscCode
            );
            
            if (hasPartialData) {
                const invalidAccounts = formData.bankAccounts.some(account => {
                    return !account.accountNumber || !account.ifscCode || !account.bankName;
                });
                if (invalidAccounts) {
                    newErrors.bankAccounts = 'Please complete bank details or remove the account';
                }
            }
        }
        break;

      case 5: // Confirmation
        if (!confirmed) {
          toast.error('Please confirm details');
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

  const generateClientId = async () => {
    try {
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, orderBy('clientId', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      let nextNumber = 1;
      if (!snapshot.empty) {
        const lastId = snapshot.docs[0].data().clientId;
        const lastNumber = parseInt(lastId.replace('CST-', ''));
        nextNumber = lastNumber + 1;
      }
      
      return `CST-${String(nextNumber).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error generating client ID:', error);
      return `CST-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      
      const clientId = isEditMode ? editClientId! : await generateClientId();

      const clientData = {
        distributorId: distributorId!,
        userId: user?.uid || null, // ADDED: Link to user
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
        submittedAt: isEditMode ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp(),
        clientId: clientId,
        source: 'client_form',
      };

      const clientRef = doc(db, "clients", clientId);
      batch.set(clientRef, clientData, { merge: true });
    if (!isEditMode && user) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const existingClientIds = userDoc.data()?.clientIds || [];
      
      if (!existingClientIds.includes(clientId)) {
        batch.update(userRef, {
          clientIds: arrayUnion(clientId)
        });
      }
    }


      // If editing, DELETE old reminders first
      if (isEditMode) {
        const remindersQuery = query(
          collection(db, 'reminders'),
          where('clientId', '==', clientId)
        );
        const oldReminders = await getDocs(remindersQuery);
        oldReminders.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // Create new/updated reminders
      formData.creditCards?.forEach((card, index) => {
        const reminderData = {
          clientId: clientId,
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

      await batch.commit();

      if (!isEditMode) {
        localStorage.removeItem(STORAGE_KEY);
      }

      navigate(`/dashboard`);
      toast.success(isEditMode ? 'Client updated successfully!' : 'Form submitted successfully!');
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
          <p className="text-primary-foreground/90">
            {isEditMode ? 'Edit Client Details' : 'Client Details Collection Form'}
          </p>
          {distributorName && (
            <p className="text-sm mt-2 text-primary-foreground/80">
              Retailer: {distributorName}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-card rounded-lg shadow-lg p-4 md:p-4">
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

{currentStep === 1 && (
          <PersonalInfoStep data={formData} onChange={handleFieldChange} errors={errors} />
        )}
        {currentStep === 2 && (
          <CreditCardsStep data={formData} onChange={handleFieldChange} errors={errors} />
        )}
        {currentStep === 3 && (
            // Add a Header to say it's Optional
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold">Documents</h2>
                     <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">Optional</span>
                </div>
                <DocumentsStep data={formData} onChange={handleFieldChange} errors={errors} />
            </div>
        )}
        {currentStep === 4 && (
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold">Bank Details</h2>
                     <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">Optional</span>
                </div>
                <BankDetailsStep data={formData} onChange={handleFieldChange} errors={errors} />
            </div>
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