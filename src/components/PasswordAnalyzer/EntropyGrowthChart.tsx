import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { PasswordAnalysis } from '@/utils/passwordAnalysis';
import { TrendingUp } from 'lucide-react';

interface EntropyGrowthChartProps {
  analysis: PasswordAnalysis;
}

export function EntropyGrowthChart({ analysis }: EntropyGrowthChartProps) {
  const data = analysis.entropyPerCharacter;
  
  const getGradientColor = () => {
    const finalEntropy = data[data.length - 1]?.entropy || 0;
    if (finalEntropy < 28) return '#ef4444';
    if (finalEntropy < 36) return '#f97316';
    if (finalEntropy < 60) return '#eab308';
    return '#22c55e';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Entropy Growth per Character
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getGradientColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getGradientColor()} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="character" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Character Position', position: 'insideBottom', offset: -5, fontSize: 11 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Entropy (bits)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} bits`, 'Entropy']}
                  labelFormatter={(label) => `Character ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="entropy"
                  stroke={getGradientColor()}
                  strokeWidth={2}
                  fill="url(#entropyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="p-2 rounded bg-muted/50">
                <p className="text-muted-foreground">Start</p>
                <p className="font-semibold text-foreground">{data[0]?.entropy.toFixed(1)} bits</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-muted-foreground">Current</p>
                <p className="font-semibold text-foreground">{data[data.length - 1]?.entropy.toFixed(1)} bits</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-muted-foreground">Avg/Char</p>
                <p className="font-semibold text-foreground">
                  {(data[data.length - 1]?.entropy / data.length).toFixed(2)} bits
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Each character should ideally add 3-5 bits of entropy. A steep upward curve indicates 
              good unpredictability, while plateaus suggest predictable patterns.
            </p>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Enter a password to see entropy growth
          </div>
        )}
      </CardContent>
    </Card>
  );
}
