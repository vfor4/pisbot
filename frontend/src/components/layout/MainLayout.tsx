import { useEffect, useMemo, useState } from "react";
import { Menu, MoonStar, Plus, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import {
  useConversationHydrated,
  useConversationStore,
} from "@/store/conversationStore";
import { useChatHydrated, useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export function MainLayout() {
  const conversations = useConversationStore((state) => state.conversations);
  const selectedConversationId = useConversationStore(
    (state) => state.selectedConversationId,
  );
  const hasSeededInitialConversation = useConversationStore(
    (state) => state.hasSeededInitialConversation,
  );
  const conversationsHydrated = useConversationHydrated();
  const createConversation = useConversationStore(
    (state) => state.createConversation,
  );
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  const markInitialConversationSeeded = useConversationStore(
    (state) => state.markInitialConversationSeeded,
  );
  const renameConversation = useConversationStore(
    (state) => state.renameConversation,
  );
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const addAssistantMessage = useChatStore(
    (state) => state.addAssistantMessage,
  );
  const chatHydrated = useChatHydrated();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [draft, setDraft] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!conversationsHydrated) {
      return;
    }

    if (conversations.length === 0) {
      if (!hasSeededInitialConversation) {
        createConversation();
        markInitialConversationSeeded();
      }
      return;
    }

    if (!hasSeededInitialConversation) {
      markInitialConversationSeeded();
    }

    if (!selectedConversationId) {
      selectConversation(conversations[0].id);
    }
  }, [
    conversations,
    conversationsHydrated,
    createConversation,
    hasSeededInitialConversation,
    markInitialConversationSeeded,
    selectConversation,
    selectedConversationId,
  ]);

  const isReady = conversationsHydrated && chatHydrated;

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ),
    [conversations, selectedConversationId],
  );

  const handleSend = () => {
    const content = draft.trim();
    if (!content || !selectedConversationId) {
      return;
    }

    addUserMessage(selectedConversationId, content);
    addAssistantMessage(
      selectedConversationId,
      "This is a local demo response. The chat state is stored in your browser.",
    );

    if (activeConversation?.title === "New chat") {
      renameConversation(selectedConversationId, content.slice(0, 32));
    }

    setDraft("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="hidden w-[260px] shrink-0 border-r border-border lg:block">
        <Sidebar />
      </aside>

      <Sheet
        onOpenChange={(open) => {
          setMobileSidebarOpen(open);
        }}
        open={mobileSidebarOpen}
      >
        <SheetTrigger asChild>
          <Button
            aria-label="Open sidebar"
            className="fixed left-4 top-4 z-40 lg:hidden"
            onClick={() => {
              setMobileSidebarOpen(true);
            }}
            size="icon"
            variant="secondary"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0" side="left">
          <Sidebar
            onNavigate={() => {
              setMobileSidebarOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <div className="min-w-0 pl-12 lg:pl-0">
            <div className="truncate text-sm font-medium text-foreground">
              {activeConversation?.title ?? "Chatbot"}
            </div>
            <div className="text-xs text-muted-foreground">
              Local conversations
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              onClick={toggleTheme}
              size="icon"
              variant="secondary"
            >
              {theme === "dark" ? (
                <SunMedium className="h-4 w-4" />
              ) : (
                <MoonStar className="h-4 w-4" />
              )}
            </Button>
            <Button
              className="hidden sm:inline-flex"
              disabled={!isReady}
              onClick={() => {
                if (!isReady) {
                  return;
                }
                createConversation();
                setDraft("");
              }}
              size="sm"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              <span>New chat</span>
            </Button>
          </div>
        </header>

        <MessageList />
        <ChatInput
          disabled={!isReady || !selectedConversationId}
          onChange={setDraft}
          onSend={handleSend}
          value={draft}
        />
      </main>
    </div>
  );
}
