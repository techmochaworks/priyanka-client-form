import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get('reason') || 'unknown';

  const getErrorMessage = () => {
    switch (reason) {
      case 'missing_id':
        return {
          title: 'Invalid Link',
          message: 'The form link you\'re trying to access is incomplete. Please check the link and try again.',
        };
      case 'invalid_id':
        return {
          title: 'Distributor Not Found',
          message: 'The distributor associated with this link could not be found. Please contact your distributor for a valid link.',
        };
      case 'validation_error':
        return {
          title: 'Validation Error',
          message: 'There was an error validating your distributor information. Please try again later.',
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred. Please try again or contact support.',
        };
    }
  };

  const error = getErrorMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            {error.title}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            {error.message}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Need help? Contact your distributor or reach out to Priyanka Enterprises support.
          </p>
        </div>
      </div>
    </div>
  );
}
