"use client";

import { useState } from 'react';
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
  onSendMessage: (prompt: string, tool: string) => void;
  isSending: boolean;
  apiKeys: Record<string, string>;
}

const aiTools = ['GPT', 'Gemini', 'Purplexcity', 'Grok', 'Deepseek', 'FreeTool'];

export default function ChatInput({ onSendMessage, isSending, apiKeys }: ChatInputProps) {
  const [prompt, setPrompt] = useState('');
  const [useAutoTool, setUseAutoTool] = useState(true);
  const [selectedTool, setSelectedTool] = useState(aiTools[1]); // Default to Gemini

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const tool = useAutoTool ? 'Auto' : selectedTool;
    onSendMessage(prompt, tool);
    // Don't clear prompt if we need to show the API key dialog
    const apiKeyNeeded = !useAutoTool && !apiKeys[selectedTool];
    if (!isSending && !apiKeyNeeded) {
       setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const isCurrentToolKeyMissing = !useAutoTool && !apiKeys[selectedTool];

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
            
            <div className="relative flex items-center">
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
                  {aiTools.map((tool) => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCurrentToolKeyMissing && (
                <Tooltip>
                   <TooltipTrigger asChild>
                    <div className="absolute -right-5 top-1/2 -translate-y-1/2">
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

          <Button type="submit" size="default" disabled={!prompt.trim() || isSending} className="w-28 bg-accent hover:bg-accent/90">
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
