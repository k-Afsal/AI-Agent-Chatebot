// src/app/settings/page.tsx
"use client";

import { useState, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Key, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/header';


const aiTools = ['GPT', 'Gemini', 'Purplexcity', 'Grok', 'Deepseek'];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromChat = searchParams.get('from') === 'chat';

  const [initialApiKeys, setInitialApiKeys] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const getApiKeysFromStorage = (userId: string): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const storedKeys = localStorage.getItem(`apiKeys_${userId}`);
    try {
      return storedKeys ? JSON.parse(storedKeys) : {};
    } catch (e) {
      return {};
    }
  };

  const saveApiKeysToStorage = (userId: string, keys: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`apiKeys_${userId}`, JSON.stringify(keys));
  };


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const keys = getApiKeysFromStorage(user.uid);
      setApiKeys(keys);
      setInitialApiKeys(keys);
      setLoading(false);
    }
  }, [user]);

  const handleKeyChange = (tool: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [tool]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    startTransition(() => {
      try {
        saveApiKeysToStorage(user.uid, apiKeys);
        setInitialApiKeys(apiKeys);
        toast({
          title: "Success",
          description: "Your API keys have been saved locally.",
        });
        
        if (fromChat) {
            router.push('/');
        }

        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error("Error saving API keys to localStorage:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save your API keys to local storage.",
        });
      }
    });
  };
  
  const hasChanges = JSON.stringify(initialApiKeys) !== JSON.stringify(apiKeys);
  const hasAtLeastOneKey = Object.values(apiKeys).some(key => key.trim() !== '');

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  const plainUser = {
    uid: user.uid,
    username: user.username,
    displayName: user.username,
    photoURL: `https://i.pravatar.cc/150?u=${user.uid}`,
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <Header user={plainUser} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="link" className="p-0 h-auto" disabled={!hasAtLeastOneKey} asChild>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Link>
            </Button>
            {!hasAtLeastOneKey && (
                <p className="text-xs text-destructive mt-1">Please add at least one API key to go back to the chat.</p>
            )}
          </div>
            
          {fromChat && !hasAtLeastOneKey && (
             <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Welcome!</AlertTitle>
                <AlertDescription>
                    To get started, please add your Gemini API key. Other keys are optional.
                </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6" />
                <div>
                  <CardTitle>API Key Management</CardTitle>
                  <CardDescription>Enter your API keys. They will be stored securely in your browser.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={(e) => {e.preventDefault(); handleSaveChanges();}} className="space-y-6">
                  {aiTools.map(tool => (
                    <div key={tool} className="space-y-2">
                      <Label htmlFor={tool} className="font-semibold">{tool}</Label>
                      <Input
                        id={tool}
                        type="password"
                        placeholder={`Enter ${tool} API Key`}
                        value={apiKeys[tool] || ''}
                        onChange={(e) => handleKeyChange(tool, e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  ))}
                  <Button type="submit" disabled={isPending || !hasChanges} className="w-full sm:w-auto">
                    {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
