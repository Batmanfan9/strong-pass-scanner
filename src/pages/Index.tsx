import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { analyzePassword, PasswordAnalysis } from '@/utils/passwordAnalysis';
import { StrengthMeter } from '@/components/PasswordAnalyzer/StrengthMeter';
import { CharacterDistribution } from '@/components/PasswordAnalyzer/CharacterDistribution';
import { FeedbackList } from '@/components/PasswordAnalyzer/FeedbackList';
import { PasswordGenerator } from '@/components/PasswordAnalyzer/PasswordGenerator';

const Index = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis>(analyzePassword(''));

  // Debounced analysis with <100ms response time
  const analyzePasswordDebounced = useCallback((pwd: string) => {
    const result = analyzePassword(pwd);
    setAnalysis(result);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      analyzePasswordDebounced(password);
    }, 50); // 50ms debounce for ultra-responsive feedback

    return () => clearTimeout(timer);
  }, [password, analyzePasswordDebounced]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Password Strength Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                Real-time security analysis with advanced pattern detection
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Password Input Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to analyze..."
              className="pr-12 h-14 text-lg border-2 focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="off"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Strength Meter */}
          {password && <StrengthMeter analysis={analysis} />}
        </div>

        {/* Password Generator */}
        <div className="mb-8">
          <PasswordGenerator onPasswordGenerated={setPassword} />
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <CharacterDistribution analysis={analysis} />
          <FeedbackList analysis={analysis} />
        </div>

        {/* Additional Stats */}
        {password && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground">Length</p>
              <p className="text-2xl font-bold text-foreground">{analysis.length}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground">Entropy Score</p>
              <p className="text-2xl font-bold text-foreground">{Math.round(analysis.entropy)}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground">Character Types</p>
              <p className="text-2xl font-bold text-foreground">
                {[
                  analysis.hasUppercase,
                  analysis.hasLowercase,
                  analysis.hasNumbers,
                  analysis.hasSymbols,
                ].filter(Boolean).length}
                /4
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground">Security Score</p>
              <p className="text-2xl font-bold text-foreground">{analysis.score}/4</p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            All analysis happens locally in your browser. No passwords are stored or transmitted.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
