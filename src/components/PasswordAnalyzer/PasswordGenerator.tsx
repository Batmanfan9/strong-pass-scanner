// === PASSWORD GENERATOR COMPONENT ===
// This creates random, secure passwords for you!
// You can customize the length and what characters to include

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
  // State variables (these remember your settings)
  const [length, setLength] = useState([16]);  // How long should the password be?
  const [includeUppercase, setIncludeUppercase] = useState(true);  // Include A-Z?
  const [includeLowercase, setIncludeLowercase] = useState(true);  // Include a-z?
  const [includeNumbers, setIncludeNumbers] = useState(true);      // Include 0-9?
  const [includeSymbols, setIncludeSymbols] = useState(true);      // Include !@#$?
  const [generatedPassword, setGeneratedPassword] = useState('');  // The generated password
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);  // Password strength info
  const { toast } = useToast();  // For showing popup messages

  // This function generates a random password based on your settings
  const generatePassword = () => {
    // Define all possible character types
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Build the "character pool" - all characters we can use
    let characterPool = '';
    if (includeUppercase) characterPool += uppercaseChars;
    if (includeLowercase) characterPool += lowercaseChars;
    if (includeNumbers) characterPool += numberChars;
    if (includeSymbols) characterPool += symbolChars;

    // Make sure at least one type is selected!
    if (characterPool === '') {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    // Generate the password using SECURE randomness
    // (Not just Math.random() - that's not secure enough!)
    const randomNumbers = new Uint32Array(length[0]);
    window.crypto.getRandomValues(randomNumbers);  // Get truly random numbers
    
    // Convert each random number to a character from our pool
    const password = Array.from(randomNumbers, (randomNum) => {
      // Use modulo (%) to pick a character from our pool
      const index = randomNum % characterPool.length;
      return characterPool[index];
    }).join('');

    // Save the generated password and analyze its strength
    setGeneratedPassword(password);
    const passwordAnalysis = analyzePassword(password);
    setAnalysis(passwordAnalysis);
    
    // Tell the parent component about the new password
    onPasswordGenerated(password);
  };

  // Copy password to clipboard (so you can paste it elsewhere)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
  };

  // Suggest what websites/apps this password is good for based on its strength
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
