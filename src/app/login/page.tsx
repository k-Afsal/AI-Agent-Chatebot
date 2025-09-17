
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot, LoaderCircle } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';

export default function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-In Failed',
        description: 'Could not sign you in with Google. Please try again.',
      });
      setIsSigningIn(false);
    }
  };

  return (
    <main className="flex h-screen w-full flex-col bg-background">
      <Header user={null} />
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-sm text-center">
          <Bot className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Welcome to AIAgentChat
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to start your conversation with AI.
          </p>
          <Button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="mt-6 w-full"
            size="lg"
          >
            {isSigningIn ? (
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 122.4 109.8 12.6 244 12.6c70.3 0 129.8 27.8 174.4 72.4l-64 64c-21.5-20.5-49-33-80.4-33-58.9 0-107.1 48.2-107.1 107.1s48.2 107.1 107.1 107.1c66.2 0 97.2-48.2 101.6-72.9H244v-64h244z"></path>
              </svg>
            )}
            Sign in with Google
          </Button>
        </div>
      </div>
    </main>
  );
}
