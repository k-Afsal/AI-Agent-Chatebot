
"use client";

import ChatLayout from '@/components/chat/chat-layout';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import Header from '@/components/header';


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  // Create a plain object for passing to client components
  const plainUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header user={plainUser} />
      <ChatLayout user={plainUser} />
    </div>
  );
}
