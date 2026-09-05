export type PromptMode = 'reflect' | 'summarize' | 'brainstorm' | 'explore';

export interface JournalMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export interface JournalSession {
  id: string;
  userId: string;
  title: string;
  promptMode: PromptMode;
  messages: JournalMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  lastLoginAt: string;
}
