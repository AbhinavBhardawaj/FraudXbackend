
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
import { ResultsTable } from '@/components/results-table';
import type { PredictionResult, Transaction, Message, TransactionPattern, FeatureImportance } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { predictFraud, batchPredictFraud, getAnswer, getSummary } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AskAi } from '@/components/ask-ai';
import { FraudProbabilityChart } from '@/components/fraud-probability-chart';
import { TransactionPatternsChart } from '@/components/transaction-patterns-chart';
import { SummaryCard } from '@/components/summary-card';
import { FeatureImportanceChart } from '@/components/feature-importance-chart';


const initialPatterns: TransactionPattern[] = [
    { date: "2024-03-01", total: 20, fraudulent: 5 },
    { date: "2024-03-02", total: 30, fraudulent: 8 },
    { date: "2024-03-03", total: 45, fraudulent: 15 },
    { date: "2024-03-04", total: 35, fraudulent: 12 },
    { date: "2024-03-05", total: 25, fraudulent: 4 },
];


export default function DashboardPage() {
  const [results, setResults] = React.useState<PredictionResult[]>([]);
  const [patterns, setPatterns] = React.useState<TransactionPattern[]>(initialPatterns);
  const [featureImportance, setFeatureImportance] = React.useState<FeatureImportance[]>([]);
  const [summary, setSummary] = React.useState('');
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isAiReplying, setIsAiReplying] = React.useState(false);
  const { toast } = useToast();

  const fetchSummary = async (predictionResults: PredictionResult[]) => {
    if (predictionResults.length === 0) {
        setSummary('No transactions were processed. Please run a prediction to see a summary.');
        return;
    }
    setIsSummaryLoading(true);
    try {
        const response = await getSummary(predictionResults);
        if (response.error) {
            toast({
                variant: 'destructive',
                title: 'AI Summary Failed',
                description: response.error,
            });
            setSummary('Could not generate a summary.');
        } else {
            setSummary(response.summary || 'Summary generated successfully.');
        }
    } catch (error) {
        setSummary('An unexpected error occurred while generating the summary.');
    } finally {
        setIsSummaryLoading(false);
    }
  };
  
  const processPredictions = async (predictionPromise: Promise<{ results?: PredictionResult[], result?: PredictionResult, featureImportance?: FeatureImportance[], error?: string }>) => {
    setIsLoading(true);
    setResults([]);
    setMessages([]);
    setSummary('');
    setFeatureImportance([]);


    try {
      const response = await predictionPromise;
      if (response.error) {
        throw new Error(response.error);
      }
      
      const newResults = response.results || (response.result ? [response.result] : []);
      setResults(newResults);
      setFeatureImportance(response.featureImportance || []);

      // Process patterns for the chart
      const newPatterns = newResults.reduce((acc, curr) => {
        const date = new Date(Date.now()).toISOString().split('T')[0]; // Using current date as mock
        let entry = acc.find(p => p.date === date);
        if (!entry) {
            entry = { date, total: 0, fraudulent: 0 };
            acc.push(entry);
        }
        entry.total += 1;
        if (curr.prediction === 'Fraudulent') {
            entry.fraudulent += 1;
        }
        return acc;
      }, [] as TransactionPattern[]);

      if(newPatterns.length > 0) {
        setPatterns(newPatterns);
      } else {
        setPatterns(initialPatterns);
      }
      
      toast({
        title: 'Prediction Successful',
        description: `${newResults.length} transaction(s) processed.`,
      });

      // Fetch summary after getting results
      fetchSummary(newResults);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setResults([]);
      setPatterns(initialPatterns);
      setFeatureImportance([]);
      setSummary('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (data: Transaction) => {
    processPredictions(predictFraud(data));
  };
  
  const handleCsvSubmit = (file: File) => {
    processPredictions(batchPredictFraud(file.name));
  };

  const handleAiSubmit = async (question: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsAiReplying(true);

    try {
        const response = await getAnswer(question, results);
        if (response.error) {
            throw new Error(response.error);
        }
        const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.answer || ''};
        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        const errorMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: error instanceof Error ? error.message : 'An unexpected error occurred.'
        };
        setMessages(prev => [...prev, errorMessage]);
        toast({
            variant: 'destructive',
            title: 'AI Reply Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsAiReplying(false);
    }
  };
  
  const flaggedTransactions = React.useMemo(() => {
    return results.filter(r => r.prediction === 'Fraudulent');
  }, [results]);


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
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Ask AI</SidebarGroupLabel>
                <AskAi 
                    messages={messages} 
                    onSubmit={handleAiSubmit} 
                    isReplying={isAiReplying}
                    isDataAvailable={results.length > 0}
                />
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            <FraudProbabilityChart data={results} isLoading={isLoading} />
            <TransactionPatternsChart data={patterns} isLoading={isLoading}/>
            <SummaryCard summary={summary} isLoading={isSummaryLoading || isLoading} />
            <FeatureImportanceChart data={featureImportance} />
          </div>
          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Flagged Transactions</CardTitle>
                <CardDescription>Processing data...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ResultsTable data={flaggedTransactions} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

