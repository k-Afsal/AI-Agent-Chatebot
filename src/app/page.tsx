
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
          <Header user={null} />
          <div className="flex flex-1 items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading...</p>
          </div>
      </div>
    );
  }
  
  const plainUser = {
    uid: user.uid,
    username: user.username,
    displayName: user.username,
    photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
  }

  return (
    <main className="flex h-screen w-full flex-col bg-background">
      <ChatLayout user={plainUser}/>
    </main>
  );
}
