// SummarizeChatHistory.ts
'use server';

/**
 * @fileOverview Summarizes the chat history for a given user.
 *
 * - summarizeChatHistory - A function that summarizes the chat history.
 * - SummarizeChatHistoryInput - The input type for the summarizeChatHistory function.
 * - SummarizeChatHistoryOutput - The return type for the summarizeChatHistory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeChatHistoryInputSchema = z.object({
  userId: z.string().describe('The ID of the user whose chat history should be summarized.'),
  chatHistory: z.string().describe('The chat history of the user.'),
});

export type SummarizeChatHistoryInput = z.infer<typeof SummarizeChatHistoryInputSchema>;

const SummarizeChatHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the chat history.'),
});

export type SummarizeChatHistoryOutput = z.infer<typeof SummarizeChatHistoryOutputSchema>;

export async function summarizeChatHistory(input: SummarizeChatHistoryInput): Promise<SummarizeChatHistoryOutput> {
  return summarizeChatHistoryFlow(input);
}

const summarizeChatHistoryPrompt = ai.definePrompt({
  name: 'summarizeChatHistoryPrompt',
  input: {
    schema: SummarizeChatHistoryInputSchema,
  },
  output: {
    schema: SummarizeChatHistoryOutputSchema,
  },
  prompt: `You are an AI assistant tasked with summarizing chat histories for users.

  Given the chat history below, provide a concise summary of the conversation, including key topics discussed, decisions made, and any important action items.

  Chat History:
  {{chatHistory}}

  Summary:
  `,
});

const summarizeChatHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeChatHistoryFlow',
    inputSchema: SummarizeChatHistoryInputSchema,
    outputSchema: SummarizeChatHistoryOutputSchema,
  },
  async input => {
    const { output } = await summarizeChatHistoryPrompt(input);
    return output!;
  }
);
