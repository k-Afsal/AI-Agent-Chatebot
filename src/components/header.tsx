
"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import * as React from 'react';


interface PlainUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export default function Header({ user }: { user: PlainUser }) {
  const [isClient, setIsClient] = React.useState(false);
  const { isMobile } = useSidebar();

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
         {isClient && <SidebarTrigger className={isMobile ? 'flex md:hidden' : 'hidden md:flex'} />}
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          AIAgentChat
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9 border">
              <AvatarFallback className="bg-secondary">
                {user.photoURL ? <img src={user.photoURL} alt="User"/> : <UserIcon className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName ?? 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/settings">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
