
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "./chat-layout"
import { Bot, User } from "lucide-react";

export default function ChatHistory({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Your chat history will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group relative flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {message.role === 'user' ? 'You' : 'AI'}
                </p>
                {message.tool && (
                  <span className="text-xs text-muted-foreground">{message.tool}</span>
                )}
              </div>
              <p className="line-clamp-2 text-muted-foreground">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
