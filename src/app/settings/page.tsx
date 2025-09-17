// src/app/settings/page.tsx
"use client";

import { useState, useEffect, useTransition } from 'react';
import { getApiKeys, saveApiKeys } from '@/app/actions';
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


export default function SettingsPage() {
  const [initialApiKeys, setInitialApiKeys] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchKeys() {
      setLoading(true);
      try {
        // Using mock user since login is removed
        const keys = await getApiKeys(mockUser.uid);
        setApiKeys(keys);
        setInitialApiKeys(keys);
      } catch (error) {
        console.error("Error fetching API keys:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your API keys.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchKeys();
  }, [toast]);

  const handleKeyChange = (tool: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [tool]: value }));
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
      try {
        const result = await saveApiKeys(mockUser.uid, apiKeys);
        if (result.success) {
          toast({
            title: "Success",
            description: "Your API keys have been saved.",
          });
          setInitialApiKeys(apiKeys);
        } else {
          throw new Error(result.error || "An unknown error occurred while saving.");
        }
      } catch (error) {
        console.error("Error saving API keys:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Could not save your API keys.",
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
                  <CardDescription>Enter your API keys for the different AI providers.</CardDescription>
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
                  <Button type="submit" disabled={isPending || !hasChanges || !atLeastOneKey} className="w-full sm:w-auto">
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
