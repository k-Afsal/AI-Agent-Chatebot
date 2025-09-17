"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatLayout from '@/components/chat/chat-layout';
import { Bot, LoaderCircle } from 'lucide-react';
import type { User } from 'firebase/auth';

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
      <Bot className="h-16 w-16 animate-pulse text-primary" />
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        <span>Authenticating...</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <ChatLayout user={user as User} />;
}
