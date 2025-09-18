
"use client";

import { useState, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Key, Info, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSearchParams, useRouter } from 'next/navigation';

interface PlainUser {
  uid: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const aiTools = ['Gemini', 'Ollama', 'OpenRouter', 'Cohere'];

export default function SettingsForm({ user }: { user: PlainUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromChat = searchParams.get('from') === 'chat';

  const [initialApiKeys, setInitialApiKeys] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [initialOllamaHost, setInitialOllamaHost] = useState('');
  const [ollamaHost, setOllamaHost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const getApiKeysFromStorage = (userId: string): Record<string, string> => {
    const storedKeys = localStorage.getItem(`apiKeys_${userId}`);
    try {
      return storedKeys ? JSON.parse(storedKeys) : {};
    } catch (e) {
      return {};
    }
  };

  const saveApiKeysToStorage = (userId: string, keys: Record<string, string>) => {
    localStorage.setItem(`apiKeys_${userId}`, JSON.stringify(keys));
  };
  
  const getOllamaHostFromStorage = (userId: string): string => {
    return localStorage.getItem(`ollamaHost_${userId}`) || '';
  };
  
  const saveOllamaHostToStorage = (userId: string, host: string) => {
    localStorage.setItem(`ollamaHost_${userId}`, host);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      const keys = getApiKeysFromStorage(user.uid);
      const host = getOllamaHostFromStorage(user.uid);
      setApiKeys(keys);
      setInitialApiKeys(keys);
      setOllamaHost(host);
      setInitialOllamaHost(host);
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
        saveOllamaHostToStorage(user.uid, ollamaHost);
        setInitialApiKeys(apiKeys);
        setInitialOllamaHost(ollamaHost);
        toast({
          title: "Success",
          description: "Your settings have been saved locally.",
        });
        
        if (fromChat) {
            router.push('/');
        }

        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save your settings to local storage.",
        });
      }
    });
  };
  
  const hasChanges = JSON.stringify(initialApiKeys) !== JSON.stringify(apiKeys) || initialOllamaHost !== ollamaHost;
  const hasAtLeastOneKey = Object.values(apiKeys).some(key => key.trim() !== '') || !!ollamaHost.trim();

  return (
    <>
      {!hasAtLeastOneKey && fromChat && (
        <p className="text-xs text-destructive -mt-5 mb-6">Please add at least one API key or an Ollama host to go back to the chat.</p>
      )}
            
      {fromChat && !hasAtLeastOneKey && (
         <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Welcome!</AlertTitle>
            <AlertDescription>
                To get started, please add an API key for at least one service. You can use Ollama without a key if it's running locally and unsecured, but you must provide the host URL.
            </AlertDescription>
        </Alert>
      )}

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
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
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
            </div>
          )}
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
            <Label htmlFor="ollama-host" className="font-semibold">Ollama Host</Label>
            <Input
              id="ollama-host"
              type="text"
              placeholder="e.g. http://192.168.1.10:11434"
              value={ollamaHost}
              onChange={(e) => setOllamaHost(e.target.value)}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
         <Button onClick={handleSaveChanges} disabled={isPending || !hasChanges} className="w-full sm:w-auto">
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </>
  );
}
