import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';

interface EntropyChartProps {
  analysis: PasswordAnalysis;
}

export function EntropyChart({ analysis }: EntropyChartProps) {
  const data = [
    {
      name: 'Entropy',
      value: Math.round(analysis.entropy),
      reference: 40, // Minimum recommended entropy
    },
  ];

  const getEntropyLevel = (entropy: number) => {
    if (entropy < 28) return { label: 'Very Low', color: '#ef4444' };
    if (entropy < 36) return { label: 'Low', color: '#f97316' };
    if (entropy < 60) return { label: 'Medium', color: '#eab308' };
    if (entropy < 80) return { label: 'Good', color: '#22c55e' };
    return { label: 'Excellent', color: '#16a34a' };
  };

  const level = getEntropyLevel(analysis.entropy);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>Shannon Entropy</span>
          <span className="text-sm font-normal" style={{ color: level.color }}>
            {Math.round(analysis.entropy)} bits ({level.label})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar 
              dataKey="value" 
              fill={level.color}
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="reference" 
              fill="hsl(var(--muted))" 
              opacity={0.3}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2">
          Higher entropy indicates greater unpredictability and security.
          Aim for at least 40 bits for a secure password.
        </p>
      </CardContent>
    </Card>
  );
}
