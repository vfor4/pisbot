import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatMessage } from "@/types/chat";

type ChatStore = {
  messagesByConversationId: Record<string, ChatMessage[]>;
  addUserMessage: (conversationId: string, content: string) => ChatMessage;
  addAssistantMessage: (conversationId: string, content: string) => ChatMessage;
  updateAssistantMessage: (
    conversationId: string,
    messageId: string,
    content: string,
  ) => void;
  clearConversation: (conversationId: string) => void;
  clearConversations: (conversationIds: string[]) => void;
  clearAllConversations: () => void;
};

const createMessage = (
  conversationId: string,
  role: ChatMessage["role"],
  content: string,
): ChatMessage => ({
  id: crypto.randomUUID(),
  conversationId,
  role,
  content,
  createdAt: Date.now(),
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messagesByConversationId: {},
      addUserMessage: (conversationId, content) => {
        const message = createMessage(conversationId, "user", content);
        set((state) => ({
          messagesByConversationId: {
            ...state.messagesByConversationId,
            [conversationId]: [
              ...(state.messagesByConversationId[conversationId] ?? []),
              message,
            ],
          },
        }));
        return message;
      },
      addAssistantMessage: (conversationId, content) => {
        const message = createMessage(conversationId, "assistant", content);
        set((state) => ({
          messagesByConversationId: {
            ...state.messagesByConversationId,
            [conversationId]: [
              ...(state.messagesByConversationId[conversationId] ?? []),
              message,
            ],
          },
        }));
        return message;
      },
      updateAssistantMessage: (conversationId, messageId, content) => {
        set((state) => {
          const messages = state.messagesByConversationId[conversationId] ?? [];
          return {
            messagesByConversationId: {
              ...state.messagesByConversationId,
              [conversationId]: messages.map((message) =>
                message.id === messageId ? { ...message, content } : message,
              ),
            },
          };
        });
      },
      clearConversation: (conversationId) => {
        const { [conversationId]: _removed, ...rest } =
          get().messagesByConversationId;
        set({ messagesByConversationId: rest });
      },
      clearConversations: (conversationIds) => {
        if (conversationIds.length === 0) {
          return;
        }

        const idsToRemove = new Set(conversationIds);
        set((state) => ({
          messagesByConversationId: Object.fromEntries(
            Object.entries(state.messagesByConversationId).filter(
              ([conversationId]) => !idsToRemove.has(conversationId),
            ),
          ),
        }));
      },
      clearAllConversations: () => {
        set({ messagesByConversationId: {} });
      },
    }),
    {
      name: "chatbot-messages",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useChatHydrated() {
  const [hasHydrated, setHasHydrated] = useState(
    useChatStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const updateHydrationState = () => {
      setHasHydrated(useChatStore.persist.hasHydrated());
    };

    const unsubscribeHydrate = useChatStore.persist.onHydrate(() => {
      setHasHydrated(false);
    });
    const unsubscribeFinishHydration =
      useChatStore.persist.onFinishHydration(updateHydrationState);

    if (!useChatStore.persist.hasHydrated()) {
      void useChatStore.persist.rehydrate();
    } else {
      updateHydrationState();
    }

    return () => {
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  return hasHydrated;
}
