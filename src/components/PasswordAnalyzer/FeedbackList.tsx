import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';

interface FeedbackListProps {
  analysis: PasswordAnalysis;
}

export function FeedbackList({ analysis }: FeedbackListProps) {
  const isStrong = analysis.score >= 3;
  const Icon = isStrong ? CheckCircle : AlertCircle;
  const iconColor = isStrong ? 'text-success' : 'text-warning';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Info className="h-4 w-4" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {analysis.feedback.map((message, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
              <span className="text-foreground">{message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
