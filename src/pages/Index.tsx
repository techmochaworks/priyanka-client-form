import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Lock, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Priyanka Enterprises
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4">
            Client Details Collection Platform
          </p>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Secure, fast, and easy way to submit your information to your distributor
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Encrypted</h3>
            <p className="text-sm text-muted-foreground">
              Your data is protected with industry-standard encryption
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Quick & Easy</h3>
            <p className="text-sm text-muted-foreground">
              Complete the form in just 5 simple steps
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Private & Confidential</h3>
            <p className="text-sm text-muted-foreground">
              Your information is never shared with third parties
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Instant Confirmation</h3>
            <p className="text-sm text-muted-foreground">
              Get immediate confirmation after submission
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive Form Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Your distributor will share a unique link with you
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Fill the Form</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete 5 simple steps with your personal and card details
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Review & Submit</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your information and submit securely
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Confirmed</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive a reference number and wait for distributor contact
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Have a form link from your distributor?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The link should look like: <code className="text-xs">yourapp.com/form/DIST-XXX</code>
            </p>
            <Button onClick={() => navigate('/form/DIST-001')} size="lg" className="w-full md:w-auto">
              View Sample Form
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Priyanka Enterprises. All rights reserved.</p>
          <p className="mt-2">Secure | Reliable | Trusted</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
