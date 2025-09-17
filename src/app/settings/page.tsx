// src/app/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const aiTools = ['GPT', 'Gemini', 'Purplexcity', 'Grok', 'Deepseek', 'FreeTool'];

export default function SettingsPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchKeys() {
      if (!user) return;
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setApiKeys(docSnap.data().apiKeys || {});
        }
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
  }, [user, toast]);

  const handleKeyChange = (tool: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [tool]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { apiKeys }, { merge: true });
      toast({
        title: "Success",
        description: "Your API keys have been saved.",
      });
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your API keys.",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // This is a mock user for development since we removed the login page.
  const mockUser = {
    uid: 'mock-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  };
  
  const displayUser = user || mockUser;


  return (
    <div className="flex h-screen flex-col bg-background">
      <Header user={displayUser as any} />
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
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
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