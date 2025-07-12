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
import { predictFraud, batchPredictFraud } from '@/app/actions';

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

export default function DashboardPage() {
  const [results, setResults] = React.useState<PredictionResult[]>([]);
  const [featureImportance, setFeatureImportance] = React.useState<FeatureImportance[]>(initialFeatureImportance);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleManualSubmit = async (data: Transaction) => {
    setIsLoading(true);
    setResults([]);
    try {
      const response = await predictFraud(data);
      if (response.error) {
        throw new Error(response.error);
      }
      setResults(response.result ? [response.result] : []);
      if(response.featureImportance) {
        setFeatureImportance(response.featureImportance);
      }
       toast({
        title: 'Prediction Successful',
        description: 'Single transaction processed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCsvSubmit = async (file: File) => {
    setIsLoading(true);
    setResults([]);
    try {
      const response = await batchPredictFraud(file.name); // Simulating with file name
      if (response.error) {
        throw new Error(response.error);
      }
      setResults(response.results || []);
      if(response.featureImportance) {
        setFeatureImportance(response.featureImportance);
      }
      toast({
        title: 'Batch Prediction Successful',
        description: `${response.results?.length || 0} transactions processed.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Batch Prediction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
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
            {/* 
              Future Enhancements:
              - Real-time prediction stream using WebSockets.
              - Interactive SHAP plots for model explainability.
              - Historical prediction data view with filtering and search.
              - User authentication and role-based access control.
            */}
          <FeatureImportanceChart data={featureImportance} />
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
