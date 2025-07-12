
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransactionPattern } from '@/lib/definitions';
import { Skeleton } from './ui/skeleton';

type TransactionPatternsChartProps = {
  data: TransactionPattern[];
  isLoading: boolean;
};

export function TransactionPatternsChart({ data, isLoading }: TransactionPatternsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Patterns</CardTitle>
        <CardDescription>Total vs. fraudulent transactions over time.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
        ) : (
            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)"
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total Transactions" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="fraudulent" name="Fraudulent" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
                </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
