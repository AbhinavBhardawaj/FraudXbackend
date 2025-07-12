
"use server";

import type { PredictionResult, FeatureImportance, Transaction } from "@/lib/definitions";
import { summarizeResults, type SummarizeResultsInput } from "@/ai/flows/summarize-results-flow";
import { askOnData, type AskOnDataInput } from "@/ai/flows/ask-on-data-flow";

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

// This function simulates a single prediction.
// TODO: Replace this with a call to your actual ML model endpoint.
export async function predictFraud(data: Transaction): Promise<{ result?: PredictionResult; featureImportance?: FeatureImportance[]; error?: string }> {
  // Basic validation
  if (!data || Object.keys(data).length < 10) {
    return { error: "Incomplete transaction data provided." };
  }

  try {
    // =================================================================
    // START: ML Model Integration Point
    // =================================================================
    
    // 1. Define your model's API endpoint.
    // const YOUR_MODEL_ENDPOINT = 'https://your-model-api.com/predict';

    // 2. Make an API call to your model.
    //    You might need to add headers for authentication (e.g., API keys).
    /*
    const response = await fetch(YOUR_MODEL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer YOUR_API_KEY` 
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Model API call failed with status: ${response.status}`);
    }

    const modelPrediction = await response.json();
    */

    // 3. Replace mock logic with actual results from your model.
    //    The example below assumes your model returns a `prediction` and `riskScore`.
    //    Adjust this to match your model's actual response structure.

    // MOCK LOGIC (DELETE AND REPLACE THIS)
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network latency
    const riskScore = Math.random();
    const prediction: 'Fraudulent' | 'Not Fraudulent' = riskScore > 0.8 ? 'Fraudulent' : 'Not Fraudulent';
    // END MOCK LOGIC

    const result: PredictionResult = {
      id: `txn_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      // Use your model's output here:
      // prediction: modelPrediction.prediction,
      // riskScore: modelPrediction.riskScore,
      prediction, // from mock
      riskScore: parseFloat(riskScore.toFixed(2)), // from mock
    };

    // If your model also returns feature importance, you can pass it here.
    // Otherwise, you can keep or remove the mock data.
    return { result, featureImportance: MOCK_FEATURE_IMPORTANCE };

    // =================================================================
    // END: ML Model Integration Point
    // =================================================================

  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during prediction.";
    return { error: errorMessage };
  }
}

// This function simulates a batch prediction from a CSV.
// TODO: This should be updated to handle file upload and processing with your model.
export async function batchPredictFraud(fileName: string): Promise<{ results?: PredictionResult[]; featureImportance?: FeatureImportance[]; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate processing time

  if (!fileName) {
    return { error: "No file provided for batch prediction." };
  }
  
  try {
    // In a real application, you would:
    // 1. Parse the CSV file content.
    // 2. Send the batch data to your model's batch prediction endpoint.
    // 3. Process the response from your model.
    // For now, we are just generating mock results.
    
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
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during batch processing.";
    return { error: errorMessage };
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

export async function getAnswer(question: string, results: PredictionResult[]): Promise<{answer?: string; error?: string}> {
    if (results.length === 0) {
        return { answer: "I can't answer questions until some transaction data is available. Please run a prediction first." };
    }
    if (!question) {
        return { error: "Please provide a question." };
    }
    try {
        const input: AskOnDataInput = { question, results };
        const { answer } = await askOnData(input);
        return { answer };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to get an answer from the AI.' };
    }
}
