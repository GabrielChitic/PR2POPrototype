import { cn } from "../lib/utils";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
          isUser && "bg-primary text-primary-foreground",
          !isUser && !isSystem && "bg-muted text-foreground",
          isSystem && "bg-accent text-accent-foreground border border-border"
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div
            className={cn(
              "text-xs opacity-70 mt-1",
              isUser ? "text-right" : "text-left"
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
