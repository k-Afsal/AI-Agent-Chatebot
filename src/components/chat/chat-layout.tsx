
"use client";

import * as React from 'react';
import ChatInput from './chat-input';
import { useState, useTransition, useEffect } from 'react';
import { sendMessageAction } from '@/app/actions';
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
import { LoaderCircle, Bot, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ChatMessage from './chat-message';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from '../ui/sidebar';
import ChatHistory from './chat-history';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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

  const { toast } = useToast();

  const fetchKeys = React.useCallback(() => {
    const keys = getApiKeysFromStorage(user.uid);
    setApiKeys(keys);
  }, [user.uid]);

  useEffect(() => {
    // Load keys and messages from local storage on mount
    fetchKeys();
    setMessages(getMessagesFromStorage(user.uid));

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `apiKeys_${user.uid}`) {
        fetchKeys();
      }
      if (e.key === `chatHistory_${user.uid}`) {
        setMessages(getMessagesFromStorage(user.uid));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user.uid, fetchKeys]);

  useEffect(() => {
    // Save messages to local storage whenever they change
    saveMessagesToStorage(user.uid, messages);
  }, [messages, user.uid]);


   useEffect(() => {
    // Auto-scroll to bottom
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

    const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: prompt,
        tool,
        createdAt: new Date(),
    };
    
    // Use a callback with setMessages to ensure we have the latest state
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
    <TooltipProvider>
      <div className="flex h-[calc(100vh-theme(height.16))] w-full">
        <Sidebar>
          <SidebarHeader>
             <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <h2 className="text-lg font-semibold">Chat History</h2>
              </div>
              <div className="flex items-center gap-1">
                 <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat}>
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">New Chat</span>
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>New Chat</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowClearConfirm(true)} disabled={messages.length === 0}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Clear History</span>
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear History</TooltipContent>
                  </Tooltip>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <ChatHistory messages={messages} />
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
             <Header user={user} />
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
    </TooltipProvider>
  );
}
