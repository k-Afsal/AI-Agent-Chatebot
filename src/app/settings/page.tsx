
// src/app/settings/page.tsx
"use client";

import { useState, useEffect, useTransition } from 'react';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const aiTools = ['GPT', 'Gemini', 'Purplexcity', 'Grok', 'Deepseek', 'FreeTool'];

// Mock user for development without login - should match page.tsx
const mockUser = {
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

const getApiKeysFromStorage = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const storedKeys = localStorage.getItem('apiKeys');
  try {
    return storedKeys ? JSON.parse(storedKeys) : {};
  } catch (e) {
    return {};
  }
};

const saveApiKeysToStorage = (keys: Record<string, string>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('apiKeys', JSON.stringify(keys));
};


export default function SettingsPage() {
  const [initialApiKeys, setInitialApiKeys] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // Reading from localStorage is a client-side only operation.
    setLoading(true);
    const keys = getApiKeysFromStorage();
    setApiKeys(keys);
    setInitialApiKeys(keys);
    setLoading(false);
  }, []);

  const handleKeyChange = (tool: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [tool]: value }));
  };

  const handleSaveChanges = async () => {
    startTransition(() => {
      try {
        saveApiKeysToStorage(apiKeys);
        setInitialApiKeys(apiKeys);
        toast({
          title: "Success",
          description: "Your API keys have been saved locally.",
        });
        // This will trigger a re-fetch in the chat layout if it's rendered
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
  const atLeastOneKey = Object.values(apiKeys).some(key => key.trim() !== '');

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header user={mockUser as any} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Link>
          </div>

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
    </div>
  );
}
