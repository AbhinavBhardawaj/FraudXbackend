"use client";

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ManualInputForm } from '@/components/manual-input-form';
import { CsvUpload } from '@/components/csv-upload';
import { DashboardHeader } from '@/components/dashboard-header';
import { FeatureImportanceChart } from '@/components/feature-importance-chart';
import { ResultsTable } from '@/components/results-table';
import type { PredictionResult, FeatureImportance, Transaction } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { predictFraud, batchPredictFraud, getSummary } from '@/app/actions';
import { SummaryCard } from '@/components/summary-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const initialFeatureImportance: FeatureImportance[] = [
  { feature: 'V17', importance: 0.18 },
  { feature: 'V14', importance: 0.15 },
  { feature: 'V12', importance: 0.12 },
  { feature: 'V10', importance: 0.10 },
  { feature: 'V11', importance: 0.09 },
  { feature: 'V16', importance: 0.08 },
  { feature: 'V7', importance: 0.07 },
  { feature: 'V4', importance: 0.06 },
  { feature: 'V3', importance: 0.05 },
  { feature: 'V9', importance: 0.04 },
];

const initialSummary = "No transactions have been processed yet. Submit a single transaction or a batch file to get started.";

export default function DashboardPage() {
  const [results, setResults] = React.useState<PredictionResult[]>([]);
  const [featureImportance, setFeatureImportance] = React.useState<FeatureImportance[]>(initialFeatureImportance);
  const [summary, setSummary] = React.useState<string>(initialSummary);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false);
  const { toast } = useToast();
  
  const processPredictions = async (predictionPromise: Promise<{ results?: PredictionResult[], result?: PredictionResult, featureImportance?: FeatureImportance[], error?: string }>) => {
    setIsLoading(true);
    setIsSummaryLoading(true);
    setResults([]);
    setSummary('');

    try {
      const response = await predictionPromise;
      if (response.error) {
        throw new Error(response.error);
      }
      
      const newResults = response.results || (response.result ? [response.result] : []);
      setResults(newResults);

      if (response.featureImportance) {
        setFeatureImportance(response.featureImportance);
      }
      
      toast({
        title: 'Prediction Successful',
        description: `${newResults.length} transaction(s) processed.`,
      });
      
      // Generate summary
      if (newResults.length > 0) {
        const summaryResponse = await getSummary(newResults);
        if(summaryResponse.summary) {
          setSummary(summaryResponse.summary);
        } else {
          setSummary('Could not generate a summary for the results.');
           toast({
            variant: 'destructive',
            title: 'Summary Failed',
            description: summaryResponse.error,
          });
        }
      } else {
        setSummary(initialSummary);
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setResults([]);
      setSummary(initialSummary);
    } finally {
      setIsLoading(false);
      setIsSummaryLoading(false);
    }
  };

  const handleManualSubmit = (data: Transaction) => {
    processPredictions(predictFraud(data));
  };
  
  const handleCsvSubmit = (file: File) => {
    processPredictions(batchPredictFraud(file.name));
  };
  
  const downloadCsv = () => {
    if (results.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There is no data to download.',
      });
      return;
    }
  
    const headers = Object.keys(results[0]).filter(h => h !== 'id');
    const csvContent = [
      headers.join(','),
      ...results.map(row => headers.map(header => {
        const cell = row[header as keyof PredictionResult];
        const value = typeof cell === 'number' ? cell.toFixed(4) : `"${String(cell).replace(/"/g, '""')}"`;
        return value;
      }).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'prediction_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manual Input</SidebarGroupLabel>
              <ManualInputForm onSubmit={handleManualSubmit} isLoading={isLoading} />
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
               <SidebarGroupLabel>Batch Upload</SidebarGroupLabel>
               <CsvUpload onSubmit={handleCsvSubmit} isLoading={isLoading} />
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <DashboardHeader onDownload={downloadCsv} canDownload={results.length > 0} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <SummaryCard summary={summary} isLoading={isSummaryLoading} />
            <FeatureImportanceChart data={featureImportance} />
          </div>
          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>Processing data...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-[400px] w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ResultsTable data={results} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
