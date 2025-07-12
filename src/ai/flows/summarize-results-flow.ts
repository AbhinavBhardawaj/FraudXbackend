
'use server';
/**
 * @fileOverview A flow for summarizing fraud detection results.
 * 
 * - summarizeResults - A function that generates a summary for a list of prediction results.
 * - SummarizeResultsInput - The input type for the summarizeResults function.
 * - SummarizeResultsOutput - The return type for the summarizeResults function.
 */

import { ai } from '@/ai/genkit';
import type { PredictionResult } from '@/lib/definitions';
import { z } from 'genkit';

const PredictionResultSchema = z.object({
  id: z.string(),
  prediction: z.enum(['Fraudulent', 'Not Fraudulent']),
  riskScore: z.number(),
  V1: z.number(),
  V2: z.number(),
  V3: z.number(),
  V4: z.number(),
  V5: z.number(),
  V6: z.number(),
  V7: z.number(),
  V8: z.number(),
  V9: z.number(),
  V10: z.number(),
});

const SummarizeResultsInputSchema = z.object({
    results: z.array(PredictionResultSchema),
});
export type SummarizeResultsInput = z.infer<typeof SummarizeResultsInputSchema>;

const SummarizeResultsOutputSchema = z.object({
    summary: z.string().describe('A concise, insightful summary of the fraud detection results, written for a financial analyst. It should be about 2-3 sentences long.'),
});
export type SummarizeResultsOutput = z.infer<typeof SummarizeResultsOutputSchema>;


export async function summarizeResults(input: SummarizeResultsInput): Promise<SummarizeResultsOutput> {
    if (input.results.length === 0) {
        return { summary: 'No transactions were processed. Please run a prediction to see a summary.' };
    }
    return summarizeResultsFlow(input);
}


const prompt = ai.definePrompt({
    name: 'summarizeResultsPrompt',
    input: { schema: SummarizeResultsInputSchema },
    output: { schema: SummarizeResultsOutputSchema },
    prompt: `You are a senior financial analyst providing a summary of fraud detection results. 
    
Analyze the following transaction prediction data and generate a concise, insightful summary of 2-3 sentences.

Your summary should include:
- The total number of transactions analyzed.
- The number of transactions flagged as "Fraudulent".
- The overall fraud rate as a percentage.
- A brief concluding remark on the overall risk level.

Do not list individual transactions. Provide a high-level overview.

Transaction Data:
{{#each results}}
- Transaction {{id}}: Prediction: {{prediction}}, Risk Score: {{riskScore}}
{{/each}}
`,
});

const summarizeResultsFlow = ai.defineFlow(
    {
        name: 'summarizeResultsFlow',
        inputSchema: SummarizeResultsInputSchema,
        outputSchema: SummarizeResultsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
