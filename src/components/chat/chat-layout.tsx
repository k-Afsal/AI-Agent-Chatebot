"use client";

import type { User } from 'firebase/auth';
import Header from '@/components/header';
import ChatHistory from './chat-history';
import ChatInput from './chat-input';
import { useState, useEffect, useTransition } from 'react';
import { sendMessageAction, getApiKeys } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';


export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  tool?: string;
  providerRaw?: string;
  createdAt: any; // Can be Firestore Timestamp or null for optimistic updates
}

export default function ChatLayout({ user }: { user: User }) {
  const [isSending, setIsSending] = useTransition();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyPrompt, setKeyPrompt] = useState<{ open: boolean; tool: string | null; prompt: string | null }>({ open: false, tool: null, prompt: null });
  const [tempApiKey, setTempApiKey] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    async function fetchKeys() {
      if (user?.uid) {
        try {
          const keys = await getApiKeys(user.uid);
          setApiKeys(keys);
        } catch (error) {
          console.error("Failed to fetch API keys on layout mount:", error);
        }
      }
    }
    fetchKeys();
  }, [user]);

  const handleSendMessage = (prompt: string, tool: string) => {
    if (!prompt.trim() || isSending) return;

    // Use a temp key if provided, otherwise check stored keys
    const apiKey = tempApiKey || apiKeys[tool];

    if (tool !== 'Auto' && !apiKey) {
      setKeyPrompt({ open: true, tool, prompt });
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendMessageAction({ prompt, tool, userId: user.uid, apiKey });
        if (result?.error) {
          toast({
            variant: 'destructive',
            title: 'Error sending message',
            description: result.error,
          });
        }
        setTempApiKey(""); // Clear temp key after sending
        setKeyPrompt({open: false, tool: null, prompt: null});
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'An unexpected error occurred',
          description: error instanceof Error ? error.message : String(error),
        });
      }
    });
  };
  
  const handleKeyPromptSubmit = () => {
    if(keyPrompt.tool && keyPrompt.prompt){
        handleSendMessage(keyPrompt.prompt, keyPrompt.tool)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header user={user} />
      <div className="flex-1 overflow-hidden">
        <ChatHistory userId={user.uid} />
      </div>
      <div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSendMessage={handleSendMessage} isSending={isSending} apiKeys={apiKeys} />
        </div>
      </div>
       <Dialog open={keyPrompt.open} onOpenChange={(open) => setKeyPrompt(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Required for {keyPrompt.tool}</DialogTitle>
            <DialogDescription>
              An API key for {keyPrompt.tool} is not saved. Please enter one to continue or go to settings to save it permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <Input 
                id="api-key-prompt"
                type="password"
                placeholder={`Enter ${keyPrompt.tool} API Key`}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
             />
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" asChild>
                <Link href="/settings">Go to Settings</Link>
            </Button>
            <Button onClick={handleKeyPromptSubmit} disabled={isSending || !tempApiKey.trim()}>
                {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit and Send
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
