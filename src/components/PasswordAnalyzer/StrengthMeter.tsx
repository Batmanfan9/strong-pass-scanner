import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';

interface StrengthMeterProps {
  analysis: PasswordAnalysis;
}

const strengthConfig = {
  'very-weak': {
    label: 'Very Weak',
    color: 'bg-strength-very-weak',
    textColor: 'text-strength-very-weak',
    icon: ShieldX,
    segments: 1,
  },
  'weak': {
    label: 'Weak',
    color: 'bg-strength-weak',
    textColor: 'text-strength-weak',
    icon: ShieldAlert,
    segments: 2,
  },
  'fair': {
    label: 'Fair',
    color: 'bg-strength-fair',
    textColor: 'text-strength-fair',
    icon: Shield,
    segments: 3,
  },
  'strong': {
    label: 'Strong',
    color: 'bg-strength-strong',
    textColor: 'text-strength-strong',
    icon: ShieldCheck,
    segments: 4,
  },
  'very-strong': {
    label: 'Very Strong',
    color: 'bg-strength-very-strong',
    textColor: 'text-strength-very-strong',
    icon: ShieldCheck,
    segments: 5,
  },
};

export function StrengthMeter({ analysis }: StrengthMeterProps) {
  const config = strengthConfig[analysis.strength];
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.textColor}`} />
          <span className="text-sm font-medium text-foreground">
            Password Strength: <span className={config.textColor}>{config.label}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Crack Time: {analysis.crackTime}
        </span>
      </div>

      {/* Visual strength bar with 5 segments */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              segment <= config.segments
                ? config.color
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
