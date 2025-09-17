
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
  const { prompt, tool, userId, apiKey } = input;
  
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  
  try {
    let aiResponse: { tool: string; response: string; rawResponse?: string | object };
    
    // Create headers for the AI backend call
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Call AI backend or Genkit flow
    if (tool === 'Auto') {
      const result = await autoAIToolSelection({ query: prompt, userId });
      aiResponse = {
        tool: result.tool,
        response: result.response,
        rawResponse: result.rawResponse,
      };
    } else {
      const backendUrl = process.env.AI_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('AI_BACKEND_URL is not configured.');
      }
      
      const res = await fetch(`${backendUrl}/api/ai`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ tool, input: prompt, userId }),
        cache: 'no-store',
      });
      
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`AI backend error: ${res.status} ${errorBody}`);
      }
      
      const data = await res.json();
      aiResponse = {
        tool: data.provider,
        response: data.provider_parsed,
        rawResponse: data.provider_raw,
      };
    }

    // Since we are not using a database, we will return the AI response directly.
    // The client will be responsible for managing the chat state.
    revalidatePath('/'); // Revalidate to help update client state if needed
    return { success: true, aiResponse };

  } catch (error) {
    console.error('sendMessageAction Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
