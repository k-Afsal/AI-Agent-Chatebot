
"use server";

import { autoAIToolSelection } from '@/ai/flows/auto-ai-tool-selection';
import { revalidatePath } from 'next/cache';

interface SendMessageInput {
  prompt: string;
  tool: string;
  userId: string;
  apiKey?: string;
}

const getApiEndpoint = (tool: string) => {
  switch (tool) {
    case 'GPT':
      return 'https://api.openai.com/v1/chat/completions';
    case 'Gemini':
      return `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
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

const getRequestOptions = (tool: string, prompt: string, apiKey?: string): RequestInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: object;

    switch (tool) {
        case 'GPT':
            if(apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            body = {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
            };
            break;

        case 'Gemini':
            if (apiKey) headers['x-goog-api-key'] = apiKey;
            body = {
                contents: [{ parts: [{ text: prompt }] }],
            };
            break;

        case 'Deepseek':
            if(apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            body = {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt },
                ],
            };
            break;
        
        case 'Grok':
            if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            body = { input: prompt };
            break;
        case 'Purplexcity':
            if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            body = { input: prompt };
            break;

        default:
            throw new Error(`Unsupported tool: ${tool}`);
    }

    return {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        cache: 'no-store',
    };
};

const parseResponse = (tool: string, data: any): { response: string; rawResponse: object } => {
  let responseText: string;

  switch (tool) {
    case 'GPT':
    case 'Deepseek':
      responseText = data.choices[0]?.message?.content || 'No response';
      break;
    case 'Gemini':
      responseText = data.candidates[0]?.content?.parts[0]?.text || 'No response';
      break;
    case 'Grok':
    case 'Purplexcity':
      responseText = data.response || data.text || 'No response';
      break;
    default:
      responseText = 'Unsupported tool response format';
  }

  return {
    response: responseText,
    rawResponse: data,
  };
};


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
    
    if (tool === 'Auto') {
      const result = await autoAIToolSelection({ query: prompt, userId });
      aiResponse = {
        tool: result.tool,
        response: result.response,
        rawResponse: result.rawResponse,
      };
    } else if (tool === 'FreeTool') {
        aiResponse = {
            tool: 'FreeTool',
            response: `This is a mock response from FreeTool for your query: "${prompt}"`,
            rawResponse: { note: "FreeTool is a mock tool and does not call a real API." }
        }
    } else {
      const endpoint = getApiEndpoint(tool);
      if (!endpoint) {
        throw new Error(`Invalid tool selected: ${tool}`);
      }
      
      const options = getRequestOptions(tool, prompt, apiKey);
      const url = endpoint;

      const res = await fetch(url, options);
      
      const responseData = await res.json();

      if (!res.ok) {
        const errorBody = responseData.error?.message || JSON.stringify(responseData);
        throw new Error(`${tool} API error: ${res.status} ${errorBody}`);
      }
      
      const { response, rawResponse } = parseResponse(tool, responseData);

      aiResponse = {
        tool: tool,
        response: response,
        rawResponse: rawResponse,
      };
    }

    revalidatePath('/');
    return { success: true, aiResponse };

  } catch (error) {
    console.error('sendMessageAction Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
