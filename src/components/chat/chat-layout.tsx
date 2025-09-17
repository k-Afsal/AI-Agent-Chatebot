
"use client";

import * as React from 'react';
import ChatInput from './chat-input';
import { useState, useTransition, useEffect } from 'react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import Header from '@/components/header';
import { useRouter } from 'next/navigation';


export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  tool?: string;
  providerRaw?: string;
  createdAt: any; // Can be Date object or string from JSON
}

interface PlainUser {
  uid: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const getApiKeysFromStorage = (userId: string): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const storedKeys = localStorage.getItem(`apiKeys_${userId}`);
  try {
    return storedKeys ? JSON.parse(storedKeys) : {};
  } catch (e) {
    console.error("Failed to parse API keys from localStorage", e);
    return {};
  }
};

const getMessagesFromStorage = (userId: string): Message[] => {
    if (typeof window === 'undefined') return [];
    const storedMessages = localStorage.getItem(`chatHistory_${userId}`);
    try {
        const parsed = storedMessages ? JSON.parse(storedMessages) : [];
        // Ensure createdAt is a Date object
        return parsed.map((msg: Message) => ({...msg, createdAt: new Date(msg.createdAt)}));
    } catch (e) {
        console.error("Failed to parse chat history from localStorage", e);
        return [];
    }
}

const saveMessagesToStorage = (userId: string, messages: Message[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`chatHistory_${userId}`, JSON.stringify(messages));
}


export default function ChatLayout({ user }: { user: PlainUser }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, startTransition] = useTransition();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyPrompt, setKeyPrompt] = useState<{ open: boolean; tool: string | null; prompt: string | null }>({ open: false, tool: null, prompt: null });
  const [tempApiKey, setTempApiKey] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { toast } = useToast();

  const fetchKeysAndRedirect = React.useCallback(() => {
    const keys = getApiKeysFromStorage(user.uid);
    setApiKeys(keys);
    // Redirect to settings if Gemini key is missing
    if (!keys['Gemini']) {
        router.push('/settings?from=chat');
    }
  }, [user.uid, router]);


  useEffect(() => {
    fetchKeysAndRedirect();
    
    // This is the correct way to load messages from storage on mount
    const loadedMessages = getMessagesFromStorage(user.uid);
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `apiKeys_${user.uid}`) {
        fetchKeysAndRedirect();
      }
      if (e.key === `chatHistory_${user.uid}`) {
        setMessages(getMessagesFromStorage(user.uid));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user.uid, fetchKeysAndRedirect]);

  useEffect(() => {
    // Only save if there are messages to prevent overwriting on initial load
    if (messages.length > 0) {
      saveMessagesToStorage(user.uid, messages);
    }
  }, [messages, user.uid]);


   useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = (prompt: string, tool: string) => {
    if (!prompt.trim() || isSending) return;

    let apiKey = tempApiKey || apiKeys[tool];

    // For 'Auto' tool, we need to decide which key to use. Let's default to Gemini.
    if (tool === 'Auto' && !apiKey) {
      apiKey = apiKeys['Gemini'];
    }

    if (tool !== 'Auto' && !apiKey) {
      setKeyPrompt({ open: true, tool, prompt });
      return;
    }

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
        const result = await chat({ query: prompt, selectedTool: tool, userId: user.uid, apiKey });
        
        if (!result) {
            throw new Error("No response from the AI.");
        }
       
        const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: result.response,
            tool: result.tool,
            providerRaw: typeof result.rawResponse === 'string' 
                ? result.rawResponse 
                : JSON.stringify(result.rawResponse, null, 2),
            createdAt: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setTempApiKey(""); 
        setKeyPrompt({open: false, tool: null, prompt: null});

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'An unexpected error occurred',
          description: error instanceof Error ? error.message : String(error),
        });
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      }
    });
  };
  
  const handleKeyPromptSubmit = () => {
    if(keyPrompt.tool && keyPrompt.prompt){
        handleSendMessage(keyPrompt.prompt, keyPrompt.tool)
    }
  }

  const handleNewChat = () => {
    if(messages.length > 0){
        setMessages([]);
        localStorage.removeItem(`chatHistory_${user.uid}`);
        toast({
            title: "New chat started.",
            description: "Your previous conversation has been cleared.",
        });
    }
  }

  const handleClearHistory = () => {
    setShowClearConfirm(false);
    handleNewChat();
  }

  const ChatList = () => {
    if (messages.length > 0) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} userPhoto={user.photoURL} />)}
        </div>
      )
    }
    return (
       <div className="flex h-full flex-col items-center justify-center gap-2">
          <div className="rounded-full bg-primary/10 p-4">
             <Bot className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Welcome, {user.displayName || 'User'}!</h2>
          <p className="text-muted-foreground">Start the conversation by sending a message below.</p>
        </div>
    );
  }


  return (
    <div className="flex h-screen w-full flex-col">
        <Header 
            user={user} 
            onNewChat={handleNewChat} 
            onClearHistory={() => setShowClearConfirm(true)}
            isChatEmpty={messages.length === 0}
        />
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
            <ChatList />
        </div>
        <div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                onSendMessage={handleSendMessage}
                isSending={isSending}
                apiKeys={apiKeys}
              />
            </div>
        </div>
        <Dialog
          open={keyPrompt.open}
          onOpenChange={(open) => setKeyPrompt((prev) => ({ ...prev, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Required for {keyPrompt.tool}</DialogTitle>
              <DialogDescription>
                An API key for {keyPrompt.tool} is not saved. Please enter one to
                continue or{' '}
                <Link href="/settings" className="underline">
                  go to settings
                </Link>{' '}
                to save it permanently.
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
              <Button
                onClick={handleKeyPromptSubmit}
                disabled={isSending || !tempApiKey.trim()}
              >
                {isSending ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit and Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your chat history. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    