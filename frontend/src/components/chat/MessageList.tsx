import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversationStore } from "@/store/conversationStore";
import { useChatHydrated, useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/components/chat/ChatMessage";

const EMPTY_MESSAGES: readonly never[] = [];

export function MessageList() {
  const selectedConversationId = useConversationStore((state) => state.selectedConversationId);
  const hasHydrated = useChatHydrated();
  const messages = useChatStore((state) =>
    selectedConversationId ? state.messagesByConversationId[selectedConversationId] ?? EMPTY_MESSAGES : EMPTY_MESSAGES,
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, selectedConversationId]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <Skeleton className="h-20 w-3/4 rounded-2xl" />
          <Skeleton className="ml-auto h-24 w-2/3 rounded-2xl" />
          <Skeleton className="h-20 w-5/6 rounded-2xl" />
          <Skeleton className="h-20 w-1/2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!selectedConversationId || messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-12">
        <div className="max-w-lg text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <MessageCircle className="h-3.5 w-3.5" />
            Chatbot
          </div>
          <h1 className="text-3xl font-semibold text-foreground">A local ChatGPT-style workspace</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Start a conversation from the sidebar. Messages stay in this browser only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 pb-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  );
}
