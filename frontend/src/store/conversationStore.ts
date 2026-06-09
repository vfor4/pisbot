import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Conversation } from "@/types/chat";

type ConversationStore = {
  conversations: Conversation[];
  selectedConversationId?: string;
  hasSeededInitialConversation: boolean;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  deleteConversations: (ids: string[]) => void;
  deleteAllConversations: () => void;
  renameConversation: (id: string, title: string) => void;
  selectConversation: (id: string) => void;
  markInitialConversationSeeded: () => void;
};

const sortConversations = (conversations: Conversation[]) =>
  [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

const createConversationRecord = (title = "New chat"): Conversation => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
  };
};

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      selectedConversationId: undefined,
      hasSeededInitialConversation: false,
      createConversation: (title) => {
        const conversation = createConversationRecord(title);
        set((state) => ({
          conversations: sortConversations([
            conversation,
            ...state.conversations,
          ]),
          selectedConversationId: conversation.id,
        }));
        return conversation.id;
      },
      deleteConversation: (id) => {
        const remaining = get().conversations.filter(
          (conversation) => conversation.id !== id,
        );
        const selectedConversationId =
          get().selectedConversationId === id
            ? remaining[0]?.id
            : get().selectedConversationId;

        set({
          conversations: remaining,
          selectedConversationId,
        });
      },
      deleteConversations: (ids) => {
        if (ids.length === 0) {
          return;
        }

        const idsToDelete = new Set(ids);
        const remaining = get().conversations.filter(
          (conversation) => !idsToDelete.has(conversation.id),
        );
        const selectedConversationId = idsToDelete.has(
          get().selectedConversationId ?? "",
        )
          ? remaining[0]?.id
          : get().selectedConversationId;

        set({
          conversations: remaining,
          selectedConversationId,
        });
      },
      deleteAllConversations: () => {
        set({
          conversations: [],
          selectedConversationId: undefined,
          hasSeededInitialConversation: true,
        });
      },
      renameConversation: (id, title) => {
        set((state) => ({
          conversations: sortConversations(
            state.conversations.map((conversation) =>
              conversation.id === id
                ? { ...conversation, title, updatedAt: Date.now() }
                : conversation,
            ),
          ),
        }));
      },
      selectConversation: (id) => {
        set({ selectedConversationId: id });
      },
      markInitialConversationSeeded: () => {
        set({ hasSeededInitialConversation: true });
      },
    }),
    {
      name: "chatbot-conversations",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useConversationHydrated() {
  const [hasHydrated, setHasHydrated] = useState(
    useConversationStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const updateHydrationState = () => {
      setHasHydrated(useConversationStore.persist.hasHydrated());
    };

    const unsubscribeHydrate = useConversationStore.persist.onHydrate(() => {
      setHasHydrated(false);
    });
    const unsubscribeFinishHydration =
      useConversationStore.persist.onFinishHydration(updateHydrationState);

    if (!useConversationStore.persist.hasHydrated()) {
      void useConversationStore.persist.rehydrate();
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
