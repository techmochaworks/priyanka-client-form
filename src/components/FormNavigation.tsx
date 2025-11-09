import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export const FormNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isNextDisabled = false,
  isLoading = false,
}: FormNavigationProps) => {
  return (
    <div className="flex gap-4 pt-6 border-t border-border">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
      )}
      <Button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className="flex-1"
      >
        {isLoading ? (
          'Processing...'
        ) : currentStep === totalSteps ? (
          'Submit'
        ) : (
          <>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};
