import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversationHydrated, useConversationStore } from "@/store/conversationStore";

type NewChatButtonProps = {
  onCreate?: () => void;
};

export function NewChatButton({ onCreate }: NewChatButtonProps) {
  const createConversation = useConversationStore((state) => state.createConversation);
  const hasHydrated = useConversationHydrated();

  return (
    <Button
      className="w-full justify-start"
      disabled={!hasHydrated}
      onClick={() => {
        if (!hasHydrated) {
          return;
        }
        createConversation();
        onCreate?.();
      }}
    >
      <Plus className="h-4 w-4" />
      <span>New chat</span>
    </Button>
  );
}
