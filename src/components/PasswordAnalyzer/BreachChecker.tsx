import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BreachCheckerProps {
  password: string;
}

export function BreachChecker({ password }: BreachCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ breached: boolean; count?: number } | null>(null);
  const { toast } = useToast();

  const checkBreach = async () => {
    if (!password || password.length < 3) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 3 characters long',
        variant: 'destructive',
      });
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      // Hash the password on client side using SHA-1
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      // Query Have I Been Pwned API (k-Anonymity model)
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        throw new Error('Failed to check breach database');
      }

      const text = await response.text();
      const hashes = text.split('\n');
      
      let breached = false;
      let count = 0;

      for (const line of hashes) {
        const [hashSuffix, countStr] = line.split(':');
        if (hashSuffix === suffix) {
          breached = true;
          count = parseInt(countStr, 10);
          break;
        }
      }

      setResult({ breached, count });

      if (breached) {
        toast({
          title: 'Password Breach Detected!',
          description: `This password has been found in ${count.toLocaleString()} data breaches.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'No Breaches Found',
          description: 'This password has not been found in known data breaches.',
        });
      }
    } catch (error) {
      console.error('Breach check error:', error);
      toast({
        title: 'Check Failed',
        description: 'Unable to verify password against breach database',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Breach Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Check if this password has been exposed in known data breaches using the
          Have I Been Pwned API (secure k-Anonymity model).
        </p>
        
        <Button
          onClick={checkBreach}
          disabled={!password || checking}
          variant="outline"
          className="w-full"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Check for Breaches
            </>
          )}
        </Button>

        {result && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg border ${
              result.breached
                ? 'bg-destructive/10 border-destructive/20'
                : 'bg-success/10 border-success/20'
            }`}
          >
            {result.breached ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Password Compromised
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    Found in {result.count?.toLocaleString()} breaches. Choose a different password.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-success">
                    No Breaches Detected
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    This password has not been found in known data breaches.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
