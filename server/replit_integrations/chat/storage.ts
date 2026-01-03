export interface IChatStorage {
  getConversation(id: number): Promise<unknown>;
  getAllConversations(): Promise<unknown[]>;
  createConversation(title: string): Promise<unknown>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<unknown[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<unknown>;
}

export const chatStorage: IChatStorage = {
  async getConversation(_id: number) {
    throw new Error("Chat storage not configured - database required");
  },

  async getAllConversations() {
    throw new Error("Chat storage not configured - database required");
  },

  async createConversation(_title: string) {
    throw new Error("Chat storage not configured - database required");
  },

  async deleteConversation(_id: number) {
    throw new Error("Chat storage not configured - database required");
  },

  async getMessagesByConversation(_conversationId: number) {
    throw new Error("Chat storage not configured - database required");
  },

  async createMessage(_conversationId: number, _role: string, _content: string) {
    throw new Error("Chat storage not configured - database required");
  },
};
