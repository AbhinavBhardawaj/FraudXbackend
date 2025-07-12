
"use client";

import * as React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PredictionResult } from '@/lib/definitions';
import { Skeleton } from './ui/skeleton';

type ChartData = {
  name: string;
  value: number;
};

type FraudProbabilityChartProps = {
  data: PredictionResult[];
  isLoading: boolean;
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function FraudProbabilityChart({ data, isLoading }: FraudProbabilityChartProps) {
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: 'Legitimate', value: 80 },
        { name: 'Fraudulent', value: 20 },
      ];
    }
    const legitimate = data.filter(d => d.prediction === 'Not Fraudulent').length;
    const fraudulent = data.filter(d => d.prediction === 'Fraudulent').length;
    return [
      { name: 'Legitimate', value: legitimate },
      { name: 'Fraudulent', value: fraudulent },
    ];
  }, [data]);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Probability</CardTitle>
        <CardDescription>Distribution of legitimate vs. fraudulent transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-[250px]">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </div>
        ) : (
            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)"
                        }}
                    />
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            if (percent === 0) return null;
                            return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Legend iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
