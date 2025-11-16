import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { analyzePassword, PasswordAnalysis } from '@/utils/passwordAnalysis';
import { StrengthMeter } from '@/components/PasswordAnalyzer/StrengthMeter';
import { EntropyChart } from '@/components/PasswordAnalyzer/EntropyChart';
import { CharacterDistribution } from '@/components/PasswordAnalyzer/CharacterDistribution';
import { FeedbackList } from '@/components/PasswordAnalyzer/FeedbackList';
import { BreachChecker } from '@/components/PasswordAnalyzer/BreachChecker';
import { HashStrengthTester } from '@/components/PasswordAnalyzer/HashStrengthTester';
import { EntropyGrowthChart } from '@/components/PasswordAnalyzer/EntropyGrowthChart';
import { NgramAnalysis } from '@/components/PasswordAnalyzer/NgramAnalysis';
import { PasswordGenerator } from '@/components/PasswordAnalyzer/PasswordGenerator';

const Index = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis>(analyzePassword(''));

  // Update analysis when password changes
  const analyzePasswordDebounced = useCallback((pwd: string) => {
    const result = analyzePassword(pwd);
    setAnalysis(result);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      analyzePasswordDebounced(password);
    }, 100);

    return () => clearTimeout(timer);
  }, [password, analyzePasswordDebounced]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Password Strength Analyzer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Password Input Section */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="pr-10 h-12"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Strength Meter */}
          {password && <StrengthMeter analysis={analysis} />}
        </div>

        {/* Password Generator */}
        <div className="mb-6">
          <PasswordGenerator onPasswordGenerated={setPassword} />
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Entropy Chart */}
          <EntropyChart analysis={analysis} />

          {/* Character Distribution */}
          <div>
            <CharacterDistribution analysis={analysis} />
          </div>

          {/* Entropy Growth Chart */}
          <EntropyGrowthChart analysis={analysis} />

          {/* N-gram Analysis */}
          <div>
            <NgramAnalysis analysis={analysis} />
          </div>

          {/* Hash Strength Tester */}
          <HashStrengthTester analysis={analysis} />

          {/* Feedback */}
          <div>
            <FeedbackList analysis={analysis} />
          </div>

          {/* Breach Checker */}
          <BreachChecker password={password} />
        </div>

        {/* Additional Stats */}
        {password && (
          <div className="mt-4 grid gap-3 grid-cols-4">
            <div className="p-3 rounded border border-border bg-card">
              <p className="text-xs text-muted-foreground">Length</p>
              <p className="text-xl font-bold text-foreground">{analysis.length}</p>
            </div>
            <div className="p-3 rounded border border-border bg-card">
              <p className="text-xs text-muted-foreground">Entropy</p>
              <p className="text-xl font-bold text-foreground">{Math.round(analysis.entropy)}</p>
            </div>
            <div className="p-3 rounded border border-border bg-card">
              <p className="text-xs text-muted-foreground">Types</p>
              <p className="text-xl font-bold text-foreground">
                {[
                  analysis.hasUppercase,
                  analysis.hasLowercase,
                  analysis.hasNumbers,
                  analysis.hasSymbols,
                ].filter(Boolean).length}
                /4
              </p>
            </div>
            <div className="p-3 rounded border border-border bg-card">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-xl font-bold text-foreground">{analysis.score}/4</p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 p-4 rounded border border-border bg-muted">
          <h3 className="font-semibold text-foreground mb-2">About</h3>
          <p className="text-sm text-muted-foreground">
            This tool checks password strength by analyzing length, character types, patterns, and common words.
            All checks happen in your browser - your password is never sent anywhere.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
