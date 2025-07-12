
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { FeatureImportance } from '@/lib/definitions';

type FeatureImportanceChartProps = {
  data: FeatureImportance[];
};

export function FeatureImportanceChart({ data }: FeatureImportanceChartProps) {
  const chartConfig = {
    importance: {
      label: 'Importance',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Importance</CardTitle>
        <CardDescription>
          Top features influencing the prediction model.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            accessibilityLayer
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              dataKey="importance"
              tickFormatter={(value) => value.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={60}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="importance" fill="var(--color-importance)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
