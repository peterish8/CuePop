import type { DeckItem, DeckItemType, KeepsakeTheme, PollOption } from "@/lib/schema";

export type RoomStatus = "join" | "presenting" | "active" | "closed" | "revealed" | "ended";
export type HostCommandType = "showJoin" | "start" | "next" | "previous" | "open" | "close" | "reveal" | "end" | "lockJoin" | "unlockJoin";

export interface PublicDeckItem {
  id: string;
  position: number;
  type: DeckItemType;
  title: string;
  imageUrl: string | null;
  backgroundImageUrl: string | null;
  backgroundBlur: number;
  backgroundIntensity: number;
  question: string | null;
  options: PollOption[];
}

export interface ResultEntry {
  optionId: string;
  label: string;
  count: number;
  percent: number;
  isCorrect?: boolean;
}

export interface RoomSnapshot {
  code: string;
  deckTitle: string;
  waitingMessage: string;
  keepsakeThemes: KeepsakeTheme[];
  status: RoomStatus;
  runVersion: number;
  joinLocked: boolean;
  currentIndex: number;
  totalItems: number;
  currentItem: PublicDeckItem | null;
  attendeeCount: number;
  responseCount: number;
  results: ResultEntry[] | null;
}

export interface HostRoomPayload {
  snapshot: RoomSnapshot;
  items: DeckItem[];
  remotePasswordSet: boolean;
}

export type SocketAck<T = unknown> = (response: { ok: true; data: T } | { ok: false; error: string }) => void;
