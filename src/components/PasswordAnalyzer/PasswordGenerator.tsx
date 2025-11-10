import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, Sparkles } from 'lucide-react';
import { analyzePassword, PasswordAnalysis } from '@/utils/passwordAnalysis';
import { useToast } from '@/hooks/use-toast';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

export function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const { toast } = useToast();

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (charset === '') {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    // Generate password using cryptographically secure random
    const array = new Uint32Array(length[0]);
    window.crypto.getRandomValues(array);
    const password = Array.from(array, (x) => charset[x % charset.length]).join('');

    setGeneratedPassword(password);
    const passwordAnalysis = analyzePassword(password);
    setAnalysis(passwordAnalysis);
    onPasswordGenerated(password);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
  };

  const getSuggestedApplications = (analysis: PasswordAnalysis) => {
    if (analysis.score >= 4) {
      return {
        title: "Extremely Strong - Critical Applications",
        apps: [
          "Banking & Financial Services",
          "Corporate Email & Work Systems",
          "Password Managers Master Password",
          "Cryptocurrency Wallets",
          "Medical Records & Healthcare Systems"
        ],
        color: "text-success"
      };
    } else if (analysis.score >= 3) {
      return {
        title: "Strong - Sensitive Applications",
        apps: [
          "Personal Email Accounts",
          "Social Media Accounts",
          "E-commerce & Shopping Sites",
          "Cloud Storage Services",
          "Government Portals"
        ],
        color: "text-primary"
      };
    } else if (analysis.score >= 2) {
      return {
        title: "Moderate - General Use",
        apps: [
          "Forum Accounts",
          "Gaming Platforms",
          "Newsletter Subscriptions",
          "Basic Web Services",
          "Mobile Apps (non-sensitive)"
        ],
        color: "text-warning"
      };
    } else {
      return {
        title: "Weak - Not Recommended",
        apps: [
          "Test Accounts Only",
          "Temporary Access",
          "Local Development Environment"
        ],
        color: "text-destructive"
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Password Length</Label>
            <span className="text-sm font-medium text-foreground">{length[0]}</span>
          </div>
          <Slider
            value={length}
            onValueChange={setLength}
            min={8}
            max={32}
            step={1}
            className="w-full"
          />
        </div>

        {/* Character Options */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
            />
            <Label htmlFor="uppercase" className="text-sm cursor-pointer">
              Uppercase Letters (A-Z)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
            />
            <Label htmlFor="lowercase" className="text-sm cursor-pointer">
              Lowercase Letters (a-z)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
            />
            <Label htmlFor="numbers" className="text-sm cursor-pointer">
              Numbers (0-9)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
            />
            <Label htmlFor="symbols" className="text-sm cursor-pointer">
              Symbols (!@#$%^&*)
            </Label>
          </div>
        </div>

        {/* Generate Button */}
        <Button onClick={generatePassword} className="w-full" size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Password
        </Button>

        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <div className="p-3 rounded-md bg-muted border border-border font-mono text-sm break-all">
                {generatedPassword}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggested Applications */}
            {analysis && (
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <h4 className={`font-semibold text-sm ${getSuggestedApplications(analysis).color}`}>
                  {getSuggestedApplications(analysis).title}
                </h4>
                <ul className="space-y-1">
                  {getSuggestedApplications(analysis).apps.map((app, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary"></span>
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
