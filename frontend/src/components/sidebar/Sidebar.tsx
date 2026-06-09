import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NewChatButton } from "@/components/sidebar/NewChatButton";
import { ConversationList } from "@/components/sidebar/ConversationList";
import { useChatStore } from "@/store/chatStore";
import {
  useConversationHydrated,
  useConversationStore,
} from "@/store/conversationStore";

type ActiveDialog = {
  type: "rename" | "delete" | "delete-selected" | "delete-all";
  conversationId?: string;
} | null;

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const conversations = useConversationStore((state) => state.conversations);
  const renameConversation = useConversationStore(
    (state) => state.renameConversation,
  );
  const deleteConversation = useConversationStore(
    (state) => state.deleteConversation,
  );
  const deleteConversations = useConversationStore(
    (state) => state.deleteConversations,
  );
  const deleteAllConversations = useConversationStore(
    (state) => state.deleteAllConversations,
  );
  const clearConversation = useChatStore((state) => state.clearConversation);
  const clearConversations = useChatStore((state) => state.clearConversations);
  const clearAllConversations = useChatStore(
    (state) => state.clearAllConversations,
  );
  const hasHydrated = useConversationHydrated();

  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [renameValue, setRenameValue] = useState("");
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const activeConversation = useMemo(
    () =>
      activeDialog
        ? conversations.find(
            (conversation) => conversation.id === activeDialog.conversationId,
          )
        : undefined,
    [activeDialog, conversations],
  );
  const allConversationIds = useMemo(
    () => conversations.map((conversation) => conversation.id),
    [conversations],
  );
  const allSelected =
    conversations.length > 0 &&
    selectedConversationIds.length === conversations.length;
  const someSelected =
    selectedConversationIds.length > 0 && !allSelected;

  useEffect(() => {
    const validConversationIds = new Set(allConversationIds);
    setSelectedConversationIds((current) =>
      current.filter((conversationId) => validConversationIds.has(conversationId)),
    );
  }, [allConversationIds]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const openRenameDialog = (conversationId: string) => {
    const conversation = conversations.find(
      (item) => item.id === conversationId,
    );
    setRenameValue(conversation?.title ?? "");
    setActiveDialog({ type: "rename", conversationId });
  };

  const openDeleteDialog = (conversationId: string) => {
    setActiveDialog({ type: "delete", conversationId });
  };

  const openBulkDeleteDialog = () => {
    if (selectedConversationIds.length === 0) {
      return;
    }

    setActiveDialog({ type: "delete-selected" });
  };

  const openDeleteAllDialog = () => {
    if (conversations.length === 0) {
      return;
    }

    setActiveDialog({ type: "delete-all" });
  };

  const handleRename = () => {
    const title = renameValue.trim();
    if (
      !activeDialog ||
      activeDialog.type !== "rename" ||
      !activeDialog.conversationId ||
      !title
    ) {
      return;
    }
    renameConversation(activeDialog.conversationId, title);
    setActiveDialog(null);
    onNavigate?.();
  };

  const handleDelete = () => {
    if (!activeDialog) {
      return;
    }

    if (activeDialog.type === "delete-selected") {
      clearConversations(selectedConversationIds);
      deleteConversations(selectedConversationIds);
      setSelectedConversationIds([]);
    } else if (activeDialog.type === "delete-all") {
      clearAllConversations();
      deleteAllConversations();
      setSelectedConversationIds([]);
    } else if (activeDialog.conversationId) {
      clearConversation(activeDialog.conversationId);
      deleteConversation(activeDialog.conversationId);
      setSelectedConversationIds((current) =>
        current.filter(
          (conversationId) => conversationId !== activeDialog.conversationId,
        ),
      );
    }

    setActiveDialog(null);
    onNavigate?.();
  };

  const handleSelectAll = () => {
    setSelectedConversationIds((current) =>
      current.length === conversations.length ? [] : allConversationIds,
    );
  };

  const selectedCountLabel =
    selectedConversationIds.length > 0
      ? `${selectedConversationIds.length} selected`
      : "Nothing selected";

  return (
    <aside className="flex h-full w-full flex-col bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            Chatbot
          </div>
          <div className="text-xs text-muted-foreground">Local UI demo</div>
        </div>
      </div>
      <Separator />
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 py-4">
        <div className="rounded-xl border border-border bg-background/60 p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                ref={selectAllRef}
                checked={allSelected}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
                disabled={!hasHydrated || conversations.length === 0}
                onChange={handleSelectAll}
                type="checkbox"
              />
              <span>Select all</span>
            </label>

            <span className="text-xs text-muted-foreground">
              {selectedCountLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              disabled={selectedConversationIds.length === 0}
              onClick={openBulkDeleteDialog}
              size="sm"
              variant="destructive"
            >
              Delete selected
            </Button>
            <Button
              disabled={conversations.length === 0}
              onClick={openDeleteAllDialog}
              size="sm"
              variant="destructive"
            >
              Delete all chats
            </Button>
          </div>
        </div>

        <NewChatButton onCreate={onNavigate} />

        <div className="min-h-0 flex-1">
          <ConversationList
            onDeleteConversation={openDeleteDialog}
            onRenameConversation={openRenameDialog}
            onSelectConversation={onNavigate}
            setSelectedConversationIds={setSelectedConversationIds}
            selectedConversationIds={selectedConversationIds}
          />
        </div>
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null);
          }
        }}
        open={activeDialog?.type === "rename"}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>
              Update the title for{" "}
              {activeConversation?.title ?? "this conversation"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              onChange={(event) => {
                setRenameValue(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleRename();
                }
              }}
              value={renameValue}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setActiveDialog(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null);
          }
        }}
        open={
          activeDialog?.type === "delete" ||
          activeDialog?.type === "delete-selected" ||
          activeDialog?.type === "delete-all"
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeDialog?.type === "delete-all"
                ? "Delete all chats"
                : activeDialog?.type === "delete-selected"
                  ? "Delete selected chats"
                  : "Delete conversation"}
            </DialogTitle>
            <DialogDescription>
              {activeDialog?.type === "delete-all"
                ? "This removes every conversation and message from local storage."
                : activeDialog?.type === "delete-selected"
                  ? `This removes ${selectedConversationIds.length} selected conversation${
                      selectedConversationIds.length === 1 ? "" : "s"
                    } and their messages from local storage.`
                  : `This removes ${activeConversation?.title ?? "the selected conversation"} and its messages from local storage.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setActiveDialog(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
