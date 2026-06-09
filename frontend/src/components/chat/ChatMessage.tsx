import ReactMarkdown from "react-markdown";
import { Bot, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/themeStore";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const theme = useThemeStore((state) => state.theme);

  return (
    <article className={cn("flex items-end gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      ) : null}

      <div
        className={cn(
          "max-w-[min(44rem,100%)] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm",
          isUser
            ? "border-primary/20 bg-primary text-primary-foreground"
            : "border-border bg-card text-card-foreground",
        )}
      >
        <div className="max-w-none space-y-3">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const isBlock = Boolean(className);
                return (
                  <code
                    className={cn(
                      isBlock
                        ? cn(
                            "block whitespace-pre rounded-xl p-4 text-[0.85rem]",
                            theme === "dark" ? "bg-black/30 text-foreground" : "bg-muted text-foreground",
                          )
                        : isUser
                          ? "rounded bg-primary/20 px-1.5 py-0.5 text-[0.9em] text-primary-foreground"
                          : "rounded bg-muted px-1.5 py-0.5 text-[0.9em] text-foreground",
                      className,
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a({ children, ...props }) {
                return (
                  <a className="text-primary underline decoration-primary/40" {...props}>
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {isUser ? (
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-muted text-foreground">
            <UserRound className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      ) : null}
    </article>
  );
}
