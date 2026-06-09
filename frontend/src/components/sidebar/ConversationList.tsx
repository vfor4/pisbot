import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { MoreVertical, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useConversationHydrated,
  useConversationStore,
} from "@/store/conversationStore";

export function ConversationList({
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  selectedConversationIds,
  setSelectedConversationIds,
}: {
  onSelectConversation?: () => void;
  onRenameConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  selectedConversationIds: string[];
  setSelectedConversationIds: Dispatch<SetStateAction<string[]>>;
}) {
  const conversations = useConversationStore((state) => state.conversations);
  const selectedConversationId = useConversationStore(
    (state) => state.selectedConversationId,
  );
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  const hasHydrated = useConversationHydrated();

  const selectedConversationIdSet = useMemo(
    () => new Set(selectedConversationIds),
    [selectedConversationIds],
  );

  useEffect(() => {
    const validConversationIds = new Set(
      conversations.map((conversation) => conversation.id),
    );
    setSelectedConversationIds((current) =>
      current.filter((conversationId) =>
        validConversationIds.has(conversationId),
      ),
    );
  }, [conversations, setSelectedConversationIds]);

  if (!hasHydrated) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={120}>
      <ScrollArea className="h-full flex-1 pr-2">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const isActive = conversation.id === selectedConversationId;
            const isSelected = selectedConversationIdSet.has(conversation.id);

            return (
              <div
                key={conversation.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors cursor-pointer",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => {
                  selectConversation(conversation.id);
                  onSelectConversation?.();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectConversation(conversation.id);
                    onSelectConversation?.();
                  }
                }}
              >
                <input
                  aria-label={`Select ${conversation.title}`}
                  checked={isSelected}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
                  onChange={() => {
                    setSelectedConversationIds((current) =>
                      current.includes(conversation.id)
                        ? current.filter(
                            (conversationId) =>
                              conversationId !== conversation.id,
                          )
                        : [...current, conversation.id],
                    );
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  type="checkbox"
                />

                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label="Conversation actions"
                          className="opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0"
                          size="icon"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Conversation actions</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => {
                        onRenameConversation(conversation.id);
                      }}
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-rose-300 focus:text-rose-300"
                      onClick={() => {
                        onDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
