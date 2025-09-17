"use client";

import type { User } from 'firebase/auth';
import Header from '@/components/header';
import ChatHistory from './chat-history';
import ChatInput from './chat-input';
import { useState, useEffect } from 'react';
import { sendMessageAction, getApiKeys } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  tool?: string;
  providerRaw?: string;
  createdAt: any; // Can be Firestore Timestamp or null for optimistic updates
}

export default function ChatLayout({ user }: { user: User }) {
  const [isSending, setIsSending] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyPrompt, setKeyPrompt] = useState<{ open: boolean; tool: string | null }>({ open: false, tool: null });
  const [tempApiKey, setTempApiKey] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    async function fetchKeys() {
      if (user?.uid) {
        const keys = await getApiKeys(user.uid);
        setApiKeys(keys);
      }
    }
    fetchKeys();
  }, [user]);

  const handleSendMessage = async (prompt: string, tool: string) => {
    if (!prompt.trim() || isSending) return;

    // Use a temp key if provided, otherwise check stored keys
    const apiKey = tempApiKey || apiKeys[tool];

    if (tool !== 'Auto' && !apiKey) {
      setKeyPrompt({ open: true, tool });
      return;
    }

    setIsSending(true);
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
      setKeyPrompt({open: false, tool: null});
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyPromptSubmit = () => {
    if(keyPrompt.tool){
        handleSendMessage((document.querySelector('textarea')?.value || ""), keyPrompt.tool)
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
       <Dialog open={keyPrompt.open} onOpenChange={(open) => setKeyPrompt({ open, tool: keyPrompt.tool })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Required for {keyPrompt.tool}</DialogTitle>
            <DialogDescription>
              Please enter the API key for {keyPrompt.tool}. You can also save it in Settings for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <Input 
                id="api-key-prompt"
                type="password"
                placeholder={`Enter ${keyPrompt.tool} API Key`}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
             />
             <Button onClick={handleKeyPromptSubmit} disabled={isSending || !tempApiKey.trim()} className="w-full">
                Submit and Send
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
