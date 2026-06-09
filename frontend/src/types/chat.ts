export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};
