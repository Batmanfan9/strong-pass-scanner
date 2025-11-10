import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';
import { Progress } from '@/components/ui/progress';

interface NgramAnalysisProps {
  analysis: PasswordAnalysis;
}

export function NgramAnalysis({ analysis }: NgramAnalysisProps) {
  const likelihood = analysis.ngramLikelihood;
  
  const getLikelihoodLevel = () => {
    if (likelihood < 20) return { 
      label: 'Excellent', 
      color: 'text-success', 
      icon: CheckCircle,
      description: 'Very low predictability from leaked password patterns',
      bgColor: 'bg-success/10'
    };
    if (likelihood < 40) return { 
      label: 'Good', 
      color: 'text-success', 
      icon: CheckCircle,
      description: 'Low predictability, some common patterns detected',
      bgColor: 'bg-success/10'
    };
    if (likelihood < 60) return { 
      label: 'Fair', 
      color: 'text-warning', 
      icon: Activity,
      description: 'Moderate predictability, reduce common sequences',
      bgColor: 'bg-warning/10'
    };
    return { 
      label: 'Poor', 
      color: 'text-destructive', 
      icon: AlertTriangle,
      description: 'High predictability from common leaked password patterns',
      bgColor: 'bg-destructive/10'
    };
  };

  const level = getLikelihoodLevel();
  const Icon = level.icon;

  // Invert the progress so lower likelihood shows better progress
  const invertedProgress = 100 - likelihood;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          N-gram Frequency Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-4 rounded-lg ${level.bgColor} border border-border mb-4`}>
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`h-5 w-5 ${level.color}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground">{level.label}</span>
                <span className={`text-sm font-mono ${level.color}`}>
                  {likelihood.toFixed(1)}% match
                </span>
              </div>
              <Progress value={invertedProgress} className="h-2" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{level.description}</p>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">What is N-gram Analysis?</h4>
            <p className="text-xs text-muted-foreground">
              This analyzes 2-character and 3-character sequences in your password against patterns 
              commonly found in leaked password databases. Lower scores indicate more unique patterns.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted/50">
              <p className="text-muted-foreground">Pattern Uniqueness</p>
              <p className="font-semibold text-foreground">
                {likelihood < 30 ? 'High' : likelihood < 60 ? 'Medium' : 'Low'}
              </p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-muted-foreground">Real-world Risk</p>
              <p className="font-semibold text-foreground">
                {likelihood < 30 ? 'Low' : likelihood < 60 ? 'Medium' : 'High'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h5 className="text-xs font-semibold text-foreground mb-1">Common Patterns to Avoid:</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Sequential numbers: 123, 234, 789</li>
              <li>• Alphabet sequences: abc, def, xyz</li>
              <li>• Common words: the, and, ing</li>
              <li>• Repeated pairs: aa, 11, !!</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
