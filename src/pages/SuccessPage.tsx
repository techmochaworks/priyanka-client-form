import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, Check } from 'lucide-react';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const refNumber = searchParams.get('ref') || 'N/A';

  useEffect(() => {
    // Prevent going back
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewSubmission = () => {
    navigate(0); // Reload the page
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Thank You!
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Your details have been submitted successfully. Your distributor will contact you shortly.
          </p>

          {/* <div className="bg-accent p-4 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground mb-2">Reference Number</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-semibold text-foreground">
                {refNumber}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Save this reference number for your records
            </p>
          </div> */}

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-left">
              <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your distributor will review your details</li>
                <li>• They will contact you for verification</li>
                <li>• You'll receive confirmation once approved</li>
              </ul>
            </div>
{/* 
            <Button
              onClick={handleNewSubmission}
              variant="outline"
              className="w-full"
            >
              Submit Another Form
            </Button> */}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 Priyanka Enterprises. All rights reserved.
        </p>
      </div>
    </div>
  );
}
