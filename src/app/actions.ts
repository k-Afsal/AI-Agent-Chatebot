"use server";

import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { autoAIToolSelection } from '@/ai/flows/auto-ai-tool-selection';
import { revalidatePath } from 'next/cache';

interface SendMessageInput {
  prompt: string;
  tool: string;
  userId: string;
}

interface ChatDoc {
  userId: string;
  tool: string;
  createdAt: FieldValue;
  input?: string;
  providerRaw?: string;
  providerParsed?: string;
}

export async function sendMessageAction(input: SendMessageInput) {
  const { prompt, tool, userId } = input;
  
  if (!userId) {
    return { error: 'User not authenticated.' };
  }
  
  try {
    // 1. Add user message to Firestore optimistically from the server
    const userMessageRef = await db.collection('chats').add({
      userId,
      tool,
      input: prompt,
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/'); // Revalidate to show user message immediately

    let aiResponse: { tool: string; response: string; rawResponse?: string | object };
    
    // 2. Call AI backend or Genkit flow
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
        headers: { 'Content-Type': 'application/json' },
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

    // 3. Add AI response to Firestore
    const aiMessage: Omit<ChatDoc, 'createdAt' | 'input'> = {
      userId,
      tool: aiResponse.tool,
      providerParsed: aiResponse.response,
      providerRaw: typeof aiResponse.rawResponse === 'string' 
        ? aiResponse.rawResponse 
        : JSON.stringify(aiResponse.rawResponse, null, 2),
    };
    await db.collection('chats').add({ ...aiMessage, createdAt: FieldValue.serverTimestamp() });

    revalidatePath('/'); // Revalidate to show AI message
    return { success: true };

  } catch (error) {
    console.error('sendMessageAction Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    await db.collection('chats').add({
      userId,
      tool,
      providerParsed: `An error occurred: ${errorMessage}`,
      providerRaw: JSON.stringify({ error: errorMessage }, null, 2),
      createdAt: FieldValue.serverTimestamp()
    });
    revalidatePath('/');
    return { error: errorMessage };
  }
}
