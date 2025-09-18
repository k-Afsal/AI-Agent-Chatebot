
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/header';
import { LoaderCircle, Key, Server, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


const SettingsForm = dynamic(() => import('@/components/settings-form'), {
  ssr: false,
  loading: () => <SettingsSkeleton />,
});

function SettingsSkeleton() {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6" />
            <div>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Enter your API keys. They will be stored securely in your browser. For Ollama, a key is optional.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
             </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
           <div className="flex items-center gap-3">
            <Server className="h-6 w-6" />
            <div>
              <CardTitle>Ollama Configuration</CardTitle>
              <CardDescription>Specify the host for your local Ollama server if it's not running on localhost.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div className="space-y-2">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}


export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Header user={null} />
        <div className="flex flex-1 items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
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
    <main className="flex h-screen flex-col bg-background">
      <Header user={plainUser} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
           <div className="mb-6">
             <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Link>
            </Button>
          </div>
          <SettingsForm user={plainUser} />
        </div>
      </div>
    </main>
  );
}
