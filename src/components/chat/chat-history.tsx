"use client";

import { useEffect, useRef, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message } from './chat-layout';
import ChatMessage from './chat-message';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatHistory({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          role: data.input ? 'user' : 'ai',
          text: data.input || data.providerParsed || '...',
          tool: data.tool,
          providerRaw: data.providerRaw,
          createdAt: data.createdAt,
        });
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chat history:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const ChatList = () => {
    if (loading) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
          <Skeleton className="h-16 w-3/4 rounded-lg" />
          <Skeleton className="ml-auto h-20 w-3/4 rounded-lg" />
          <Skeleton className="h-16 w-2/3 rounded-lg" />
        </div>
      );
    }
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
    <div ref={scrollAreaRef} className="h-full overflow-y-auto">
      <ChatList />
    </div>
  );
}
