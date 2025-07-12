"use server";

import type { PredictionResult, FeatureImportance, Transaction } from "@/lib/definitions";
import { summarizeResults, type SummarizeResultsInput } from "@/ai/flows/summarize-results-flow";

const MOCK_FEATURE_IMPORTANCE: FeatureImportance[] = [
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

// Simulate network latency and processing
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a single prediction
export async function predictFraud(data: Transaction): Promise<{ result?: PredictionResult; featureImportance?: FeatureImportance[]; error?: string }> {
  await sleep(1500);

  // Basic validation
  if (!data || Object.keys(data).length < 10) {
    return { error: "Incomplete transaction data provided." };
  }

  try {
    const riskScore = Math.random();
    const prediction: 'Fraudulent' | 'Not Fraudulent' = riskScore > 0.8 ? 'Fraudulent' : 'Not Fraudulent';

    const result: PredictionResult = {
      id: `txn_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      prediction,
      riskScore: parseFloat(riskScore.toFixed(2)),
    };

    return { result, featureImportance: MOCK_FEATURE_IMPORTANCE };
  } catch (e) {
    return { error: "An unexpected error occurred during prediction." };
  }
}

// Simulate a batch prediction from a CSV
export async function batchPredictFraud(fileName: string): Promise<{ results?: PredictionResult[]; featureImportance?: FeatureImportance[]; error?: string }> {
  await sleep(2500);

  if (!fileName) {
    return { error: "No file provided for batch prediction." };
  }
  
  try {
    const results: PredictionResult[] = Array.from({ length: 15 }, (_, i) => {
      const riskScore = Math.random();
      const prediction: 'Fraudulent' | 'Not Fraudulent' = riskScore > 0.8 ? 'Fraudulent' : 'Not Fraudulent';
      return {
        id: `batch_${i+1}_${Math.random().toString(36).substr(2, 9)}`,
        V1: Math.random() * 10,
        V2: Math.random() * 10,
        V3: Math.random() * 10,
        V4: Math.random() * 10,
        V5: Math.random() * 10,
        V6: Math.random() * 10,
        V7: Math.random() * 10,
        V8: Math.random() * 10,
        V9: Math.random() * 10,
        V10: Math.random() * 10,
        prediction,
        riskScore: parseFloat(riskScore.toFixed(2)),
      };
    });

    return { results, featureImportance: MOCK_FEATURE_IMPORTANCE };
  } catch (e) {
    return { error: "An unexpected error occurred during batch processing." };
  }
}

export async function getSummary(results: PredictionResult[]): Promise<{summary?: string; error?: string}> {
  try {
    const input: SummarizeResultsInput = { results: results.map(r => ({...r})) };
    const { summary } = await summarizeResults(input);
    return { summary };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate summary.'}
  }
}
