import { Bot, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from './chat-layout';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button';
import { ChevronDown, Terminal } from 'lucide-react';

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex items-start gap-3', isUser && 'justify-end')}>
      {!isUser && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback className="bg-accent/20 text-accent">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg p-3 shadow-sm lg:max-w-2xl',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground'
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{message.text}</p>
        {!isUser && message.tool && (
           <p className="mt-2 text-xs text-muted-foreground">
             Tool: <span className="font-semibold">{message.tool}</span>
           </p>
        )}
        {!isUser && message.providerRaw && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
                <Terminal className="mr-1 h-3 w-3" />
                Raw Response
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-1 max-h-64 overflow-x-auto rounded-md bg-muted/50 p-2 font-code text-xs text-muted-foreground">
                <code>{message.providerRaw}</code>
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
      {isUser && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback>
            <UserIcon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
