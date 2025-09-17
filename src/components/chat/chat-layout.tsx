"use client";

import type { User } from 'firebase/auth';
import Header from '@/components/header';
import ChatHistory from './chat-history';
import ChatInput from './chat-input';
import { useState } from 'react';
import { sendMessageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleSendMessage = async (prompt: string, tool: string) => {
    if (!prompt.trim() || isSending) return;

    setIsSending(true);
    try {
      // The server action now handles all Firestore writes and revalidation
      const result = await sendMessageAction({ prompt, tool, userId: user.uid });
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error sending message',
          description: result.error,
        });
      }
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
  
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header user={user} />
      <div className="flex-1 overflow-hidden">
        <ChatHistory userId={user.uid} />
      </div>
      <div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
        </div>
      </div>
    </div>
  );
}
