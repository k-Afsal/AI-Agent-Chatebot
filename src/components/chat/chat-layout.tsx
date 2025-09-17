
"use client";

import * as React from 'react';
import type { User } from 'firebase/auth';
import Header from '@/components/header';
import ChatInput from './chat-input';
import { useState, useEffect, useTransition } from 'react';
import { sendMessageAction } from '@/app/actions';
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
import { LoaderCircle, Bot } from 'lucide-react';
import Link from 'next/link';
import ChatMessage from './chat-message';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger } from '../ui/sidebar';
import ChatHistory from './chat-history';


export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  tool?: string;
  providerRaw?: string;
  createdAt: any; // Can be Firestore Timestamp or null for optimistic updates
}

const getApiKeysFromStorage = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const storedKeys = localStorage.getItem('apiKeys');
  try {
    return storedKeys ? JSON.parse(storedKeys) : {};
  } catch (e) {
    console.error("Failed to parse API keys from localStorage", e);
    return {};
  }
};


export default function ChatLayout({ user }: { user: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, startTransition] = useTransition();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyPrompt, setKeyPrompt] = useState<{ open: boolean; tool: string | null; prompt: string | null }>({ open: false, tool: null, prompt: null });
  const [tempApiKey, setTempApiKey] = useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const fetchKeys = () => {
    const keys = getApiKeysFromStorage();
    setApiKeys(keys);
  };

  useEffect(() => {
    fetchKeys();
    const handleStorageChange = () => fetchKeys();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

   useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = (prompt: string, tool: string) => {
    if (!prompt.trim() || isSending) return;

    const apiKey = tempApiKey || apiKeys[tool];

    if (tool !== 'Auto' && tool !== 'FreeTool' && !apiKey) {
      setKeyPrompt({ open: true, tool, prompt });
      return;
    }

    // Optimistically add user message to state
    const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: prompt,
        tool,
        createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);


    startTransition(async () => {
      try {
        const result = await sendMessageAction({ prompt, tool, userId: user.uid, apiKey });
        
        if (result?.error) {
          toast({
            variant: 'destructive',
            title: 'Error sending message',
            description: result.error,
          });
           // Remove optimistic user message on error
          setMessages(prev => prev.filter(m => m.id !== userMessage.id));

        } else if (result?.success && result.aiResponse) {
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                role: 'ai',
                text: result.aiResponse.response,
                tool: result.aiResponse.tool,
                providerRaw: typeof result.aiResponse.rawResponse === 'string' 
                    ? result.aiResponse.rawResponse 
                    : JSON.stringify(result.aiResponse.rawResponse, null, 2),
                createdAt: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);

            setTempApiKey(""); 
            setKeyPrompt({open: false, tool: null, prompt: null});
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'An unexpected error occurred',
          description: error instanceof Error ? error.message : String(error),
        });
        // Remove optimistic user message on error
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      }
    });
  };
  
  const handleKeyPromptSubmit = () => {
    if(keyPrompt.tool && keyPrompt.prompt){
        handleSendMessage(keyPrompt.prompt, keyPrompt.tool)
    }
  }

  const ChatList = () => {
    if (messages.length > 0) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        </div>
      )
    }
    return (
       <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className="rounded-full bg-primary/10 p-4">
             <Bot className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Welcome!</h2>
          <p className="text-muted-foreground">Start the conversation by sending a message below.</p>
        </div>
    );
  }


  return (
    <div className="flex h-screen bg-background">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:flex" />
            <h2 className="text-lg font-semibold">Chat History</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ChatHistory messages={messages} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header user={user} />
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
          <ChatList />
        </div>
        <div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <ChatInput onSendMessage={handleSendMessage} isSending={isSending} apiKeys={apiKeys} />
          </div>
        </div>
      </SidebarInset>
       <Dialog open={keyPrompt.open} onOpenChange={(open) => setKeyPrompt(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Required for {keyPrompt.tool}</DialogTitle>
            <DialogDescription>
              An API key for {keyPrompt.tool} is not saved. Please enter one to continue or <Link href="/settings" className="underline">go to settings</Link> to save it permanently.
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
          <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
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
