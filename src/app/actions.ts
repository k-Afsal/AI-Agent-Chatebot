
"use server";

import { autoAIToolSelection } from '@/ai/flows/auto-ai-tool-selection';
import { revalidatePath } from 'next/cache';

interface SendMessageInput {
  prompt: string;
  tool: string;
  userId: string;
  apiKey?: string;
}

// This function is kept for potential future re-enabling of real APIs,
// but is not used in the mocked implementation.
const getApiEndpoint = (tool: string) => {
  switch (tool) {
    case 'GPT':
      return 'https://api.openai.com/v1/chat/completions';
    case 'Gemini':
      const apiKey = process.env.GEMINI_API_KEY;
      return `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    case 'Deepseek':
      return 'https://api.deepseek.com/chat/completions';
    case 'Grok':
      return 'https://api.grok.com/v1/chat/completions';
    case 'Purplexcity':
      return 'https://api.perplexcity.ai/v1/respond';
    default:
      return null;
  }
};

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
    let finalTool = tool;

    if (tool === 'Auto') {
      // The auto-tool selection can still run to decide which mock tool to "use".
      const result = await autoAIToolSelection({ query: prompt, userId });
      finalTool = result.tool;
    }
    
    // All tools now return a mock response for speed.
    const mockResponse = {
      tool: finalTool,
      response: `This is a mock response from ${finalTool} for your query: "${prompt}"`,
      rawResponse: { note: "This is a mock response to prevent long loading times.", tool: finalTool }
    };
    
    revalidatePath('/');
    return { success: true, aiResponse: mockResponse };

  } catch (error) {
    console.error('sendMessageAction Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
