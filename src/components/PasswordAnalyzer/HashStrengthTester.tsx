import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, Zap } from 'lucide-react';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';

interface HashStrengthTesterProps {
  analysis: PasswordAnalysis;
}

export function HashStrengthTester({ analysis }: HashStrengthTesterProps) {
  const hashAlgorithms = [
    {
      name: 'Bcrypt',
      icon: Shield,
      description: 'Industry standard, very secure',
      color: 'text-success',
      data: analysis.hashStrength.bcrypt,
      security: 'High Security',
    },
    {
      name: 'Argon2',
      icon: Shield,
      description: 'Most secure, recommended',
      color: 'text-success',
      data: analysis.hashStrength.argon2,
      security: 'Highest Security',
    },
    {
      name: 'SHA-256',
      icon: Zap,
      description: 'Fast but less secure',
      color: 'text-warning',
      data: analysis.hashStrength.sha256,
      security: 'Lower Security',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Hash Brute-Force Resistance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hashAlgorithms.map((algo) => (
            <div key={algo.name} className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background ${algo.color}`}>
                  <algo.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{algo.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-background ${algo.color}`}>
                      {algo.security}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{algo.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Crack Time:</span>
                      <p className="font-mono font-semibold text-foreground">{algo.data.time}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <p className="font-mono font-semibold text-foreground">{algo.data.guessesPerSecond}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Different hashing algorithms provide varying levels of protection. Slower algorithms like Bcrypt and Argon2 
          are more resistant to brute-force attacks.
        </p>
      </CardContent>
    </Card>
  );
}
