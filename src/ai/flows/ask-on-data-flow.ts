'use server';
/**
 * @fileOverview A flow for answering questions about fraud detection results.
 * 
 * - askOnData - A function that answers a user's question based on a set of prediction results.
 * - AskOnDataInput - The input type for the askOnData function.
 * - AskOnDataOutput - The return type for the askOnData function.
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

const AskOnDataInputSchema = z.object({
    question: z.string().describe('The user\'s question about the transaction data.'),
    results: z.array(PredictionResultSchema),
});
export type AskOnDataInput = z.infer<typeof AskOnDataInputSchema>;

const AskOnDataOutputSchema = z.object({
    answer: z.string().describe('A concise and helpful answer to the user\'s question.'),
});
export type AskOnDataOutput = z.infer<typeof AskOnDataOutputSchema>;


export async function askOnData(input: AskOnDataInput): Promise<AskOnDataOutput> {
    return askOnDataFlow(input);
}


const prompt = ai.definePrompt({
    name: 'askOnDataPrompt',
    input: { schema: AskOnDataInputSchema },
    output: { schema: AskOnDataOutputSchema },
    prompt: `You are a helpful financial analyst assistant. Your task is to answer questions about a given set of credit card transaction fraud predictions.

The user will provide a question and the transaction data. Base your answer ONLY on the data provided.
If the question cannot be answered from the data, say so. Keep your answers concise and to the point.

User Question:
"{{{question}}}"

Transaction Data:
\`\`\`json
{{{json results}}}
\`\`\`
`,
});

const askOnDataFlow = ai.defineFlow(
    {
        name: 'askOnDataFlow',
        inputSchema: AskOnDataInputSchema,
        outputSchema: AskOnDataOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
