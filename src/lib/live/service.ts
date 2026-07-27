import { randomBytes } from "node:crypto";
import { nanoid } from "nanoid";
import { getDb, repo } from "@/lib/db";
import type { DeckItem, SessionRecord } from "@/lib/schema";
import type { HostCommandType, HostRoomPayload, ResultEntry, RoomSnapshot, RoomStatus } from "@/lib/live/types";

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    const exists = getDb().prepare("SELECT id FROM live_sessions WHERE code=?").get(code);
    if (!exists) return code;
  }
  throw new Error("Could not generate a room code.");
}

function rowToSession(row: any): SessionRecord {
  return {
    id: row.id,
    deckId: row.deck_id,
    hostUserId: row.host_user_id,
    code: row.code,
    controllerToken: row.controller_token,
    status: row.status,
    currentItemId: row.current_item_id,
    joinLocked: row.join_locked,
    createdAt: row.created_at,
    endedAt: row.ended_at,
  };
}

export function getSessionByCode(code: string) {
  const row = getDb().prepare("SELECT * FROM live_sessions WHERE code=?").get(code.toUpperCase()) as any;
  return row ? rowToSession(row) : null;
}

export function createLiveSession(deckId: string, hostUserId: string) {
  const deck = repo.getDeck(deckId, hostUserId);
  if (!deck) throw new Error("Deck not found.");
  if (!deck.items?.length) throw new Error("Add at least one item before starting a session.");
  const host = repo.findUserById(hostUserId);
  if (!host) throw new Error("Host account not found.");
  if (host.plan === "free") {
    const monthStart = new Date();
    monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const count = (getDb().prepare("SELECT COUNT(*) AS count FROM live_sessions WHERE host_user_id=? AND created_at>=?").get(hostUserId, monthStart.toISOString()) as any).count as number;
    if (count >= 3) throw new Error("The free plan includes three live sessions per month.");
  }
  const id = nanoid();
  const code = makeCode();
  const controllerToken = randomBytes(24).toString("hex");
  const now = new Date().toISOString();
  getDb().prepare(`INSERT INTO live_sessions (id,deck_id,host_user_id,code,controller_token,status,current_item_id,join_locked,created_at) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, deckId, hostUserId, code, controllerToken, "join", null, 0, now);
  return { id, code, controllerToken };
}

function validateController(code: string, token: string) {
  const session = getSessionByCode(code);
  if (!session || session.controllerToken !== token) throw new Error("Invalid presenter control token.");
  return session;
}

function publicItem(item: DeckItem | null, status: RoomStatus): RoomSnapshot["currentItem"] {
  if (!item) return null;
  return {
    id: item.id,
    position: item.position,
    type: item.type,
    title: item.title,
    imageUrl: item.imageUrl,
    question: item.question,
    options: item.options.map((option) => ({
      id: option.id,
      label: option.label,
      ...(status === "revealed" || status === "ended" ? { isCorrect: option.isCorrect } : {}),
    })),
  };
}

export function getRoomSnapshot(code: string): RoomSnapshot | null {
  const session = getSessionByCode(code);
  if (!session) return null;
  const deck = repo.getDeck(session.deckId);
  if (!deck) return null;
  const items = deck.items || [];
  const currentItem = session.currentItemId ? items.find((item) => item.id === session.currentItemId) || null : null;
  const currentIndex = currentItem ? items.findIndex((item) => item.id === currentItem.id) : -1;
  const attendeeCount = (getDb().prepare("SELECT COUNT(*) AS count FROM attendees WHERE session_id=?").get(session.id) as any).count as number;
  const responseCount = currentItem ? (getDb().prepare("SELECT COUNT(*) AS count FROM responses WHERE session_id=? AND item_id=?").get(session.id, currentItem.id) as any).count as number : 0;
  let results: ResultEntry[] | null = null;
  if (currentItem && (session.status === "revealed" || session.status === "ended") && currentItem.type !== "slide") {
    const counts = getDb().prepare("SELECT option_id,COUNT(*) AS count FROM responses WHERE session_id=? AND item_id=? GROUP BY option_id").all(session.id, currentItem.id) as { option_id: string; count: number }[];
    const map = new Map(counts.map((entry) => [entry.option_id, Number(entry.count)]));
    results = currentItem.options.map((option) => {
      const count = map.get(option.id) || 0;
      return { optionId: option.id, label: option.label, count, percent: responseCount ? Math.round((count / responseCount) * 100) : 0, ...(currentItem.type === "quiz" ? { isCorrect: option.isCorrect } : {}) };
    });
  }
  return {
    code: session.code,
    deckTitle: deck.title,
    waitingMessage: deck.waitingMessage,
    keepsakeThemes: deck.keepsakeThemes,
    status: session.status as RoomStatus,
    joinLocked: Boolean(session.joinLocked),
    currentIndex,
    totalItems: items.length,
    currentItem: publicItem(currentItem, session.status as RoomStatus),
    attendeeCount,
    responseCount,
    results,
  };
}

export function getHostRoom(code: string, token: string): HostRoomPayload {
  const session = validateController(code, token);
  const deck = repo.getDeck(session.deckId);
  const snapshot = getRoomSnapshot(code);
  if (!deck || !snapshot) throw new Error("Live room not found.");
  return { snapshot, items: deck.items || [] };
}

export function joinAttendee(code: string, input: { deviceId: string; name?: string | null }) {
  const session = getSessionByCode(code);
  if (!session) throw new Error("Room not found.");
  const now = new Date().toISOString();
  const existing = getDb().prepare("SELECT id FROM attendees WHERE session_id=? AND device_id=?").get(session.id, input.deviceId) as { id: string } | undefined;
  if (existing) {
    getDb().prepare("UPDATE attendees SET name=COALESCE(?,name),last_seen_at=? WHERE id=?").run(input.name?.trim() || null, now, existing.id);
    const answeredItemIds = (getDb().prepare("SELECT item_id FROM responses WHERE session_id=? AND attendee_id=?").all(session.id, existing.id) as { item_id: string }[]).map((row) => row.item_id);
    return { attendeeId: existing.id, answeredItemIds, snapshot: getRoomSnapshot(code)! };
  }
  if (session.status === "ended") throw new Error("This session has ended.");
  if (session.joinLocked) throw new Error("Joining is currently locked.");
  const host = repo.findUserById(session.hostUserId);
  const attendeeCount = (getDb().prepare("SELECT COUNT(*) AS count FROM attendees WHERE session_id=?").get(session.id) as any).count as number;
  const cap = host?.plan === "pro" ? 500 : 50;
  if (attendeeCount >= cap) throw new Error(`This room has reached its ${cap}-attendee plan limit.`);
  const attendeeId = nanoid();
  getDb().prepare("INSERT INTO attendees (id,session_id,device_id,name,joined_at,last_seen_at) VALUES (?,?,?,?,?,?)")
    .run(attendeeId, session.id, input.deviceId, input.name?.trim() || null, now, now);
  return { attendeeId, answeredItemIds: [] as string[], snapshot: getRoomSnapshot(code)! };
}

export function submitVote(code: string, input: { attendeeId: string; itemId: string; optionId: string }) {
  const session = getSessionByCode(code);
  if (!session) throw new Error("Room not found.");
  if (session.status !== "active") throw new Error("Voting is not open.");
  if (session.currentItemId !== input.itemId) throw new Error("This question is no longer active.");
  const attendee = getDb().prepare("SELECT id FROM attendees WHERE id=? AND session_id=?").get(input.attendeeId, session.id);
  if (!attendee) throw new Error("Rejoin the room before voting.");
  const item = repo.getDeckItem(input.itemId);
  if (!item || item.type === "slide" || !item.options.some((option) => option.id === input.optionId)) throw new Error("Invalid answer option.");
  try {
    getDb().prepare("INSERT INTO responses (id,session_id,attendee_id,item_id,option_id,created_at) VALUES (?,?,?,?,?,?)")
      .run(nanoid(), session.id, input.attendeeId, input.itemId, input.optionId, new Date().toISOString());
  } catch (error: any) {
    if (String(error?.message || "").includes("UNIQUE")) throw new Error("You already answered this question.");
    throw error;
  }
  return { submitted: true, snapshot: getRoomSnapshot(code)! };
}

export function executeHostCommand(code: string, token: string, command: HostCommandType) {
  const session = validateController(code, token);
  if (session.status === "ended") throw new Error("This session has ended.");
  const deck = repo.getDeck(session.deckId);
  if (!deck) throw new Error("Deck not found.");
  const items = deck.items || [];
  const currentIndex = session.currentItemId ? items.findIndex((item) => item.id === session.currentItemId) : -1;
  let status = session.status as RoomStatus;
  let currentItemId = session.currentItemId;
  let joinLocked = session.joinLocked;
  let endedAt = session.endedAt;

  switch (command) {
    case "showJoin":
      status = "join";
      currentItemId = null;
      break;
    case "start":
      if (status !== "join") throw new Error("Return to the join screen before restarting the deck.");
      status = "presenting";
      currentItemId = items[0]?.id || null;
      break;
    case "next": {
      if (status === "join") throw new Error("Start the deck before advancing.");
      if (status === "active") throw new Error("Close voting before advancing.");
      if (currentIndex >= items.length - 1) throw new Error("There is no next item.");
      const next = items[currentIndex + 1];
      if (!next) throw new Error("There is no next item.");
      currentItemId = next.id;
      status = "presenting";
      break;
    }
    case "previous": {
      if (status === "join") throw new Error("Start the deck before moving backward.");
      if (status === "active") throw new Error("Close voting before moving backward.");
      if (currentIndex <= 0) throw new Error("There is no previous item.");
      const previous = items[currentIndex - 1];
      if (!previous) throw new Error("There is no previous item.");
      currentItemId = previous.id;
      status = "presenting";
      break;
    }
    case "open": {
      const item = currentItemId ? items.find((entry) => entry.id === currentItemId) : null;
      if (!item || item.type === "slide") throw new Error("Select a poll or quiz before opening voting.");
      if (status !== "presenting") throw new Error("This question is not ready to open.");
      status = "active";
      break;
    }
    case "close":
      if (status !== "active") throw new Error("Voting is not open.");
      status = "closed";
      break;
    case "reveal": {
      const item = currentItemId ? items.find((entry) => entry.id === currentItemId) : null;
      if (!item || item.type === "slide") throw new Error("Select a poll or quiz before revealing results.");
      if (status !== "closed") throw new Error("Close voting before revealing results.");
      status = "revealed";
      break;
    }
    case "end":
      status = "ended";
      endedAt = new Date().toISOString();
      break;
    case "lockJoin":
      joinLocked = 1;
      break;
    case "unlockJoin":
      joinLocked = 0;
      break;
  }

  getDb().prepare("UPDATE live_sessions SET status=?,current_item_id=?,join_locked=?,ended_at=? WHERE id=?")
    .run(status, currentItemId, joinLocked, endedAt, session.id);
  return getRoomSnapshot(code)!;
}

export function getReport(code: string, token: string) {
  const session = validateController(code, token);
  const deck = repo.getDeck(session.deckId);
  if (!deck) throw new Error("Deck not found.");
  const attendeeCount = (getDb().prepare("SELECT COUNT(*) AS count FROM attendees WHERE session_id=?").get(session.id) as any).count as number;
  const rows = getDb().prepare("SELECT item_id,option_id,COUNT(*) AS count FROM responses WHERE session_id=? GROUP BY item_id,option_id").all(session.id) as { item_id: string; option_id: string; count: number }[];
  const byItem = new Map<string, { optionId: string; count: number }[]>();
  for (const row of rows) byItem.set(row.item_id, [...(byItem.get(row.item_id) || []), { optionId: row.option_id, count: Number(row.count) }]);
  return {
    code: session.code,
    deckTitle: deck.title,
    attendeeCount,
    startedAt: session.createdAt,
    endedAt: session.endedAt,
    moments: (deck.items || []).filter((item) => item.type !== "slide").map((item) => {
      const counts = byItem.get(item.id) || [];
      const totalResponses = counts.reduce((sum, entry) => sum + entry.count, 0);
      return {
        itemId: item.id,
        type: item.type,
        question: item.question,
        totalResponses,
        participationRate: attendeeCount ? Math.round((totalResponses / attendeeCount) * 100) : 0,
        options: item.options.map((option) => ({ label: option.label, count: counts.find((entry) => entry.optionId === option.id)?.count || 0, isCorrect: option.isCorrect })),
      };
    }),
  };
}
