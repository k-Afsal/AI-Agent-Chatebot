
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';

const USER_CREDENTIALS_KEY = 'user_credentials';

export default function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { user, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if a user is already created to decide the default mode
    if (localStorage.getItem(USER_CREDENTIALS_KEY)) {
      setIsSignUp(false);
    } else {
      setIsSignUp(true);
    }
    // If user is already logged in (from session), redirect
    if (user) {
        router.push('/');
    }
  }, [user, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    if (!username.trim() || !password.trim()) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Username and password cannot be empty.",
        });
        setIsSigningIn(false);
        return;
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
        if(isSignUp) {
            // Sign Up Logic
            const existingUsers = JSON.parse(localStorage.getItem(USER_CREDENTIALS_KEY) || '{}');
            if (existingUsers[username]) {
                throw new Error("Username already exists. Please try to sign in.");
            }
            existingUsers[username] = password;
            localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(existingUsers));
            
            const newUser = { uid: username, username };
            login(newUser);

            toast({ title: "Account created successfully!" });
            router.push('/');

        } else {
            // Sign In Logic
            const existingUsers = JSON.parse(localStorage.getItem(USER_CREDENTIALS_KEY) || '{}');
            
            // Hardcoded admin check
            if (username === 'admin' && password === 'admin') {
                const adminUser = { uid: 'admin', username: 'admin' };
                login(adminUser);
                router.push('/');
                return;
            }

            if (!existingUsers[username] || existingUsers[username] !== password) {
                throw new Error("Invalid username or password.");
            }

            const loggedInUser = { uid: username, username };
            login(loggedInUser);
            router.push('/');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({
            variant: "destructive",
            title: isSignUp ? "Sign-Up Failed" : "Sign-In Failed",
            description: errorMessage,
        });
    } finally {
        setIsSigningIn(false);
    }
  };


  return (
    <main className="flex h-screen w-full flex-col bg-background">
      <Header user={null} />
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <Bot className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 text-2xl font-bold">
                    {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription>
                    {isSignUp ? 'Enter your details to get started.' : 'Sign in to continue to AIAgentChat.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                            id="username" 
                            placeholder="e.g. admin" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isSigningIn}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password"
                            placeholder="e.g. admin" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSigningIn}
                        />
                    </div>
                    <Button type="submit" disabled={isSigningIn} className="w-full">
                        {isSigningIn ? (
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                           isSignUp ? 'Sign Up' : 'Sign In'
                        )}
                    </Button>
                </form>
                 <div className="mt-4 text-center text-sm">
                    {isSignUp ? (
                        <>
                            Already have an account?{" "}
                            <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)}>
                                Sign In
                            </Button>
                        </>
                    ) : (
                        <>
                            Don&apos;t have an account?{" "}
                             <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)}>
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
