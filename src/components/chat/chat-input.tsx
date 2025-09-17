
"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, LoaderCircle, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  onSendMessage: (prompt: string, tool: string, ollamaModel?: string) => void;
  isSending: boolean;
  apiKeys: Record<string, string>;
}

const aiTools = ['GPT', 'Gemini', 'Purplexcity', 'Grok', 'Deepseek', 'Hugging Face', 'Ollama'];
const ollamaModels = ['gpt-oss:20b', 'llama2:latest'];

export default function ChatInput({ onSendMessage, isSending, apiKeys }: ChatInputProps) {
  const [prompt, setPrompt] = useState('');
  const [useAutoTool, setUseAutoTool] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [selectedOllamaModel, setSelectedOllamaModel] = useState(ollamaModels[1]);

  useEffect(() => {
    if (Object.keys(apiKeys).length > 0) {
        // If the current selected tool is still valid, do nothing.
        if (selectedTool && (apiKeys[selectedTool] || selectedTool === 'Ollama')) {
            return;
        }

        // Otherwise, find the first available tool and set it.
        const availableTool = aiTools.find(tool => apiKeys[tool] || tool === 'Ollama');
        if (availableTool) {
            setSelectedTool(availableTool);
        } else {
            setSelectedTool('');
        }
    } else {
        // Handle case where there are no API keys at all.
        const availableTool = aiTools.find(tool => tool === 'Ollama' && !apiKeys[tool]);
        if(availableTool) {
            setSelectedTool(availableTool);
        } else {
            setSelectedTool('');
        }
    }
  }, [apiKeys, selectedTool]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const tool = useAutoTool ? 'Auto' : selectedTool;
    const ollamaModel = tool === 'Ollama' ? selectedOllamaModel : undefined;
    onSendMessage(prompt, tool, ollamaModel);

    const isManualToolAndKeyMissing = !useAutoTool && selectedTool && !apiKeys[selectedTool] && selectedTool !== 'Ollama';
    if (!isSending && !isManualToolAndKeyMissing) {
       setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const isManualToolAndKeyMissing = !useAutoTool && selectedTool && !apiKeys[selectedTool] && selectedTool !== 'Ollama';

  return (
    <TooltipProvider delayDuration={200}>
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <Textarea
          placeholder="Type your message here... (Shift + Enter for new line)"
          className="min-h-[80px] resize-none text-base"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-tool-switch" checked={useAutoTool} onCheckedChange={setUseAutoTool} disabled={isSending} aria-label="Auto-select tool"/>
                  <Label htmlFor="auto-tool-switch" className="cursor-pointer text-sm text-muted-foreground">Auto-select</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Let the AI choose the best tool for your query.</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="relative flex items-center gap-2">
              <Select value={selectedTool} onValueChange={setSelectedTool} disabled={useAutoTool || isSending}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue placeholder="Select tool" />
                    </SelectTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manually select an AI provider.</p>
                  </TooltipContent>
                </Tooltip>
                <SelectContent>
                  {aiTools.map((tool) => {
                    const isKeyAvailable = !!apiKeys[tool] || tool === 'Ollama';
                    return (
                      <Tooltip key={tool}>
                        <TooltipTrigger asChild>
                          <div className='w-full'>
                            <SelectItem
                              value={tool}
                              disabled={!isKeyAvailable}
                              className={!isKeyAvailable ? 'cursor-not-allowed text-muted-foreground/50' : ''}
                              onClick={(e) => {
                                if(!isKeyAvailable) {
                                  e.preventDefault();
                                }
                              }}
                            >
                               {tool}
                            </SelectItem>
                          </div>
                        </TooltipTrigger>
                        {!isKeyAvailable && (
                           <TooltipContent side="right">
                             <p>API key for {tool} is not set. Please add it in settings.</p>
                           </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </SelectContent>
              </Select>
              {!useAutoTool && selectedTool === 'Ollama' && (
                <Select value={selectedOllamaModel} onValueChange={setSelectedOllamaModel} disabled={isSending}>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <SelectTrigger className="h-9 w-[150px]">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the Ollama model to use.</p>
                    </TooltipContent>
                  </Tooltip>
                  <SelectContent>
                    {ollamaModels.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {isManualToolAndKeyMissing && (
                <Tooltip>
                   <TooltipTrigger asChild>
                    <div className="pointer-events-none absolute -right-5 top-1/2 -translate-y-1/2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>API key for {selectedTool} is missing.</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <Button type="submit" size="default" disabled={!prompt.trim() || isSending || isManualToolAndKeyMissing} className="w-28 bg-accent hover:bg-accent/90">
            {isSending ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Send
              </>
            )}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
