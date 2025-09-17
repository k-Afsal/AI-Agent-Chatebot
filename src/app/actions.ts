
"use server";

import { autoAIToolSelection } from '@/ai/flows/auto-ai-tool-selection';
import { revalidatePath } from 'next/cache';

interface SendMessageInput {
  prompt: string;
  tool: string;
  userId: string;
  apiKey?: string;
}

export async function sendMessageAction(input: SendMessageInput): Promise<{ 
    success: boolean; 
    aiResponse?: { tool: string; response: string; rawResponse?: string | object }; 
    error?: string 
}> {
  const { prompt, tool, userId } = input;
  
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  
  try {
    const result = await autoAIToolSelection({ query: prompt, userId });
    
    revalidatePath('/');
    return { success: true, aiResponse: result };

  } catch (error) {
    console.error('sendMessageAction Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
