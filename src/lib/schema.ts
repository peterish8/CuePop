export type DeckItemType = "slide" | "poll" | "quiz";
export type KeepsakeTheme = "signal" | "midnight" | "paper";

export interface PollOption {
  id: string;
  label: string;
  isCorrect?: boolean;
}

export interface DeckItem {
  id: string;
  deckId: string;
  position: number;
  type: DeckItemType;
  title: string;
  imageUrl: string | null;
  backgroundImageUrl: string | null;
  backgroundBlur: number;
  backgroundIntensity: number;
  question: string | null;
  options: PollOption[];
  notes: string | null;
  revealMode: "manual" | "auto";
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string;
  waitingMessage: string;
  keepsakeThemes: KeepsakeTheme[];
  createdAt: string;
  updatedAt: string;
  items?: DeckItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  deckId: string;
  hostUserId: string;
  code: string;
  controllerToken: string;
  remotePasswordHash: string | null;
  status: string;
  currentItemId: string | null;
  joinLocked: number;
  runVersion: number;
  createdAt: string;
  endedAt: string | null;
}
