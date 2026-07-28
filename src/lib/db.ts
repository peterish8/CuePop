import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type { Deck, DeckItem, KeepsakeTheme, PollOption, User } from "@/lib/schema";
import { safeJsonParse } from "@/lib/utils";

let db: Database.Database | undefined;
let databaseInitialized = false;

function databasePath() {
  if (process.env.VERCEL) return "/tmp/cuepop.db";
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "cuepop.db");
}

export function getDb() {
  if (!db) {
    const target = databasePath();
    fs.mkdirSync(path.dirname(target), { recursive: true });
    db = new Database(target);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  if (!databaseInitialized) {
    databaseInitialized = true;
    initializeDatabase();
  }
  return db;
}

export function closeDatabase() {
  db?.close();
  db = undefined;
  databaseInitialized = false;
}

export function resetDbForTests(targetPath: string) {
  closeDatabase();
  process.env.DATABASE_PATH = targetPath;
}

export function initializeDatabase() {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      waiting_message TEXT NOT NULL DEFAULT 'We will begin in a moment.',
      keepsake_theme TEXT NOT NULL DEFAULT 'signal',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deck_items (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      background_image_url TEXT,
      background_blur INTEGER NOT NULL DEFAULT 0,
      background_intensity INTEGER NOT NULL DEFAULT 64,
      question TEXT,
      options_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      reveal_mode TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS live_sessions (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      host_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      controller_token TEXT NOT NULL UNIQUE,
      remote_password_hash TEXT,
      status TEXT NOT NULL DEFAULT 'join',
      current_item_id TEXT,
      join_locked INTEGER NOT NULL DEFAULT 0,
      run_version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      ended_at TEXT
    );
    CREATE TABLE IF NOT EXISTS attendees (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
      device_id TEXT NOT NULL,
      name TEXT,
      joined_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      UNIQUE(session_id, device_id)
    );
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
      attendee_id TEXT NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES deck_items(id) ON DELETE CASCADE,
      option_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(session_id, attendee_id, item_id)
    );
    CREATE INDEX IF NOT EXISTS idx_deck_items_deck_position ON deck_items(deck_id, position);
    CREATE INDEX IF NOT EXISTS idx_responses_session_item ON responses(session_id, item_id);
  `);

  ensureColumn(database, "deck_items", "background_image_url", "background_image_url TEXT");
  ensureColumn(database, "deck_items", "background_blur", "background_blur INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "deck_items", "background_intensity", "background_intensity INTEGER NOT NULL DEFAULT 64");
  ensureColumn(database, "live_sessions", "remote_password_hash", "remote_password_hash TEXT");
  ensureColumn(database, "live_sessions", "run_version", "run_version INTEGER NOT NULL DEFAULT 0");

  seedDemo(database);
  fs.mkdirSync(process.env.VERCEL ? "/tmp/uploads" : path.join(process.cwd(), "data", "uploads"), { recursive: true });
}

function ensureColumn(database: Database.Database, table: string, column: string, definition: string) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((entry) => entry.name === column)) database.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}

function seedDemo(database: Database.Database) {
  const existing = database.prepare("SELECT id FROM users WHERE email = ?").get("demo@cuepop.app") as { id: string } | undefined;
  if (existing) return;

  const now = new Date().toISOString();
  const userId = nanoid();
  const deckId = nanoid();
  const passwordHash = bcrypt.hashSync("demo1234", 10);

  const transaction = database.transaction(() => {
    database.prepare(`INSERT INTO users (id,name,email,password_hash,plan,created_at) VALUES (?,?,?,?,?,?)`)
      .run(userId, "CuePop Demo", "demo@cuepop.app", passwordHash, "pro", now);
    database.prepare(`INSERT INTO decks (id,user_id,title,description,waiting_message,keepsake_theme,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)`)
      .run(deckId, userId, "Placement Readiness Live", "A sample live session with a slide, poll and quiz.", "Find a seat, scan the code and join the room.", JSON.stringify(["signal", "midnight", "paper"]), now, now);

    const items = [
      {
        type: "slide",
        title: "Welcome to Placement Readiness",
        imageUrl: "/art/demo-slide-1.svg",
        question: null,
        options: [],
        notes: "Welcome the room and explain how CuePop works.",
      },
      {
        type: "poll",
        title: "Room pulse",
        imageUrl: null,
        question: "What is your biggest placement concern right now?",
        options: [
          { id: "skills", label: "Technical skills" },
          { id: "resume", label: "Resume and profile" },
          { id: "interview", label: "Interview confidence" },
          { id: "direction", label: "Choosing a direction" },
        ],
        notes: "Use this to understand the room before the main talk.",
      },
      {
        type: "slide",
        title: "A simple preparation loop",
        imageUrl: "/art/demo-slide-2.svg",
        question: null,
        options: [],
        notes: "Explain the practice-feedback-improve loop.",
      },
      {
        type: "quiz",
        title: "Quick check",
        imageUrl: null,
        question: "Which action creates the strongest interview signal?",
        options: [
          { id: "a", label: "Listing every tool you have heard of" },
          { id: "b", label: "Explaining one project and its trade-offs", isCorrect: true },
          { id: "c", label: "Using the longest possible resume" },
          { id: "d", label: "Avoiding follow-up questions" },
        ],
        notes: "Reveal the answer only after everyone has submitted.",
      },
    ];

    const insert = database.prepare(`INSERT INTO deck_items
      (id,deck_id,position,type,title,image_url,question,options_json,notes,reveal_mode,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    items.forEach((item, index) => {
      insert.run(nanoid(), deckId, index, item.type, item.title, item.imageUrl, item.question, JSON.stringify(item.options), item.notes, "manual", now, now);
    });
  });
  transaction();
}


type UserWithPassword = User & { passwordHash: string };

interface Repository {
  findUserByEmail(email: string): UserWithPassword | null;
  findUserById(id: string): User | null;
  createUser(input: { name: string; email: string; passwordHash: string }): User;
  createAuthSession(userId: string, token: string, expiresAt: string): void;
  deleteAuthSession(token: string): void;
  findUserBySession(token: string): User | null;
  listDecks(userId: string): Deck[];
  getDeck(deckId: string, userId?: string): Deck | null;
  createDeck(userId: string, input: { title: string; description?: string }): Deck;
  updateDeck(deckId: string, userId: string, input: Partial<Pick<Deck, "title" | "description" | "waitingMessage" | "keepsakeThemes">>): Deck | null;
  deleteDeck(deckId: string, userId: string): boolean;
  listDeckItems(deckId: string): DeckItem[];
  getDeckItem(itemId: string): DeckItem | null;
  createDeckItem(deckId: string, input: Partial<DeckItem> & { type: DeckItem["type"] }): DeckItem;
  updateDeckItem(itemId: string, input: Partial<DeckItem>): DeckItem | null;
  deleteDeckItem(itemId: string): boolean;
  reorderDeckItems(deckId: string, orderedIds: string[]): DeckItem[];
}

function rowToUser(row: any): User {
  return { id: row.id, name: row.name, email: row.email, plan: row.plan, createdAt: row.created_at };
}

function rowToDeckItem(row: any): DeckItem {
  return {
    id: row.id,
    deckId: row.deck_id,
    position: row.position,
    type: row.type,
    title: row.title,
    imageUrl: row.image_url,
    backgroundImageUrl: row.background_image_url || null,
    backgroundBlur: Number(row.background_blur || 0),
    backgroundIntensity: Number(row.background_intensity ?? 64),
    question: row.question,
    options: safeJsonParse<PollOption[]>(row.options_json, []),
    notes: row.notes,
    revealMode: row.reveal_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseKeepsakeThemes(value: unknown): KeepsakeTheme[] {
  const allowed = new Set<KeepsakeTheme>(["signal", "midnight", "paper"]);
  const parsed = typeof value === "string" && value.startsWith("[")
    ? safeJsonParse<unknown[]>(value, [])
    : typeof value === "string"
      ? value.split(",")
      : [];
  const themes = parsed.filter((entry): entry is KeepsakeTheme => typeof entry === "string" && allowed.has(entry as KeepsakeTheme));
  return themes.length ? [...new Set(themes)] : ["signal"];
}

function rowToDeck(row: any, includeItems = false): Deck {
  const deck: Deck = {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    waitingMessage: row.waiting_message,
    keepsakeThemes: parseKeepsakeThemes(row.keepsake_theme),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includeItems) deck.items = listDeckItems(row.id);
  return deck;
}

export const repo: Repository = {
  findUserByEmail(email: string) {
    const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as any;
    return row ? { ...rowToUser(row), passwordHash: row.password_hash } : null;
  },
  findUserById(id: string) {
    const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    return row ? rowToUser(row) : null;
  },
  createUser(input: { name: string; email: string; passwordHash: string }) {
    const id = nanoid();
    const now = new Date().toISOString();
    getDb().prepare("INSERT INTO users (id,name,email,password_hash,plan,created_at) VALUES (?,?,?,?,?,?)")
      .run(id, input.name, input.email.toLowerCase(), input.passwordHash, "free", now);
    return repo.findUserById(id)!;
  },
  createAuthSession(userId: string, token: string, expiresAt: string) {
    getDb().prepare("INSERT INTO auth_sessions (token,user_id,expires_at,created_at) VALUES (?,?,?,?)")
      .run(token, userId, expiresAt, new Date().toISOString());
  },
  deleteAuthSession(token: string) {
    getDb().prepare("DELETE FROM auth_sessions WHERE token = ?").run(token);
  },
  findUserBySession(token: string) {
    const row = getDb().prepare(`SELECT u.* FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at > ?`)
      .get(token, new Date().toISOString()) as any;
    return row ? rowToUser(row) : null;
  },
  listDecks(userId: string) {
    const rows = getDb().prepare("SELECT * FROM decks WHERE user_id=? ORDER BY updated_at DESC").all(userId) as any[];
    return rows.map((row) => rowToDeck(row));
  },
  getDeck(deckId: string, userId?: string) {
    const row = userId
      ? getDb().prepare("SELECT * FROM decks WHERE id=? AND user_id=?").get(deckId, userId)
      : getDb().prepare("SELECT * FROM decks WHERE id=?").get(deckId);
    return row ? rowToDeck(row as any, true) : null;
  },
  createDeck(userId: string, input: { title: string; description?: string }) {
    const id = nanoid();
    const now = new Date().toISOString();
    getDb().prepare(`INSERT INTO decks (id,user_id,title,description,waiting_message,keepsake_theme,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, userId, input.title, input.description || "", "We will begin in a moment.", JSON.stringify(["signal", "midnight", "paper"]), now, now);
    return repo.getDeck(id, userId)!;
  },
  updateDeck(deckId: string, userId: string, input: Partial<Pick<Deck, "title" | "description" | "waitingMessage" | "keepsakeThemes">>) {
    const current = repo.getDeck(deckId, userId);
    if (!current) return null;
    const next = { ...current, ...input };
    getDb().prepare(`UPDATE decks SET title=?,description=?,waiting_message=?,keepsake_theme=?,updated_at=? WHERE id=? AND user_id=?`)
      .run(next.title, next.description, next.waitingMessage, JSON.stringify(next.keepsakeThemes), new Date().toISOString(), deckId, userId);
    return repo.getDeck(deckId, userId);
  },
  deleteDeck(deckId: string, userId: string) {
    return getDb().prepare("DELETE FROM decks WHERE id=? AND user_id=?").run(deckId, userId).changes > 0;
  },
  listDeckItems,
  getDeckItem(itemId: string) {
    const row = getDb().prepare("SELECT * FROM deck_items WHERE id=?").get(itemId) as any;
    return row ? rowToDeckItem(row) : null;
  },
  createDeckItem(deckId: string, input: Partial<DeckItem> & { type: DeckItem["type"] }) {
    const id = nanoid();
    const now = new Date().toISOString();
    const position = (getDb().prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next FROM deck_items WHERE deck_id=?").get(deckId) as any).next;
    getDb().prepare(`INSERT INTO deck_items (id,deck_id,position,type,title,image_url,background_image_url,background_blur,background_intensity,question,options_json,notes,reveal_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, deckId, position, input.type, input.title || (input.type === "slide" ? "Untitled slide" : "Untitled moment"), input.imageUrl || null, input.backgroundImageUrl || null, input.backgroundBlur || 0, input.backgroundIntensity ?? 64, input.question || null, JSON.stringify(input.options || []), input.notes || null, input.revealMode || "manual", now, now);
    return repo.getDeckItem(id)!;
  },
  updateDeckItem(itemId: string, input: Partial<DeckItem>) {
    const current = repo.getDeckItem(itemId);
    if (!current) return null;
    const next = { ...current, ...input };
    getDb().prepare(`UPDATE deck_items SET title=?,image_url=?,background_image_url=?,background_blur=?,background_intensity=?,question=?,options_json=?,notes=?,reveal_mode=?,updated_at=? WHERE id=?`)
      .run(next.title, next.imageUrl, next.backgroundImageUrl, next.backgroundBlur, next.backgroundIntensity, next.question, JSON.stringify(next.options), next.notes, next.revealMode, new Date().toISOString(), itemId);
    return repo.getDeckItem(itemId);
  },
  deleteDeckItem(itemId: string) {
    const item = repo.getDeckItem(itemId);
    if (!item) return false;
    const database = getDb();
    const tx = database.transaction(() => {
      database.prepare("DELETE FROM deck_items WHERE id=?").run(itemId);
      const rows = database.prepare("SELECT id FROM deck_items WHERE deck_id=? ORDER BY position").all(item.deckId) as { id: string }[];
      const update = database.prepare("UPDATE deck_items SET position=? WHERE id=?");
      rows.forEach((row, index) => update.run(index, row.id));
    });
    tx();
    return true;
  },
  reorderDeckItems(deckId: string, orderedIds: string[]) {
    const database = getDb();
    const tx = database.transaction(() => {
      const update = database.prepare("UPDATE deck_items SET position=?,updated_at=? WHERE id=? AND deck_id=?");
      orderedIds.forEach((id, position) => update.run(position, new Date().toISOString(), id, deckId));
    });
    tx();
    return listDeckItems(deckId);
  },
};

function listDeckItems(deckId: string): DeckItem[] {
  const rows = getDb().prepare("SELECT * FROM deck_items WHERE deck_id=? ORDER BY position").all(deckId) as any[];
  return rows.map(rowToDeckItem);
}
