import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';

interface CharacterDistributionProps {
  analysis: PasswordAnalysis;
}

const COLORS = {
  uppercase: 'hsl(var(--primary))',
  lowercase: 'hsl(var(--accent))',
  numbers: 'hsl(var(--info))',
  symbols: 'hsl(var(--warning))',
};

export function CharacterDistribution({ analysis }: CharacterDistributionProps) {
  const data = [
    { name: 'Uppercase (A-Z)', value: analysis.charDistribution.uppercase, color: COLORS.uppercase },
    { name: 'Lowercase (a-z)', value: analysis.charDistribution.lowercase, color: COLORS.lowercase },
    { name: 'Numbers (0-9)', value: analysis.charDistribution.numbers, color: COLORS.numbers },
    { name: 'Symbols (!@#...)', value: analysis.charDistribution.symbols, color: COLORS.symbols },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Character Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            Enter a password to see distribution
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Character Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Object.entries(analysis.charDistribution).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
