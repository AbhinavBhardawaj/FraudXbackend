
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
import type { PredictionResult } from '@/lib/definitions';
import { ScrollArea } from '@/components/ui/scroll-area';

type ResultsTableProps = {
  data: PredictionResult[];
};

export function ResultsTable({ data }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flagged Transactions</CardTitle>
        <CardDescription>
          {data.length > 0 ? `Showing ${data.length} transactions flagged as high-risk.` : 'No fraudulent transactions detected in the latest run.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] w-full rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Fraud Probability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.id}</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {(row.riskScore * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Your flagged transactions will appear here.
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
