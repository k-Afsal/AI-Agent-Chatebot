
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "./chat-layout"
import { Bot, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function ChatHistory({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No messages yet.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Your chat history will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {messages.map((message) => (
          <div key={message.id} className="group relative flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex-1 space-y-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {message.role === 'user' ? 'You' : 'AI'}
                </p>
                 <time className="text-xs text-muted-foreground" dateTime={new Date(message.createdAt).toISOString()}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </time>
              </div>
              <p className="truncate text-muted-foreground group-hover:line-clamp-none group-hover:whitespace-normal">
                {message.text}
              </p>
               {message.tool && (
                  <span className="text-xs text-muted-foreground">Tool: {message.tool}</span>
                )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
