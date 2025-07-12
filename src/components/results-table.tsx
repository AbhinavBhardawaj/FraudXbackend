"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PredictionResult } from '@/lib/definitions';
import { ScrollArea } from '@/components/ui/scroll-area';

type ResultsTableProps = {
  data: PredictionResult[];
};

export function ResultsTable({ data }: ResultsTableProps) {
  const getBadgeVariant = (prediction: 'Fraudulent' | 'Not Fraudulent') => {
    return prediction === 'Fraudulent' ? 'destructive' : 'secondary';
  };
  
  const getRiskColor = (score: number) => {
    if (score > 0.8) return 'text-destructive';
    if (score > 0.5) return 'text-amber-600 dark:text-amber-500';
    return 'text-green-600 dark:text-green-500';
  }

  const columns = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction Results</CardTitle>
        <CardDescription>
          {data.length > 0 ? `Showing ${data.length} results.` : 'No results to display. Run a prediction to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <TableRow>
                {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                <TableHead className="text-right">Risk Score</TableHead>
                <TableHead>Prediction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map(col => <TableCell key={col}>{(row[col] as number)?.toFixed(4)}</TableCell>)}
                    <TableCell className={`text-right font-mono font-medium ${getRiskColor(row.riskScore)}`}>
                      {(row.riskScore * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(row.prediction)} className="w-[110px] justify-center">{row.prediction}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="h-24 text-center text-muted-foreground">
                    Your prediction results will appear here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
