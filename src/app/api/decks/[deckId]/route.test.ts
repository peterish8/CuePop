import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { closeDatabase, initializeDatabase, repo, resetDbForTests } from "@/lib/db";
import { createLiveSession } from "@/lib/live/service";

vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));

import { requireUser } from "@/lib/auth";
import { DELETE } from "./route";

let tempDir: string;
let deckId: string;
let userId: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cuepop-deck-route-"));
  resetDbForTests(path.join(tempDir, "test.db"));
  initializeDatabase();
  const user = repo.findUserByEmail("demo@cuepop.app")!;
  userId = user.id;
  deckId = repo.listDecks(user.id)[0].id;
  vi.mocked(requireUser).mockResolvedValue(user);
});

afterEach(() => {
  closeDatabase();
  fs.rmSync(tempDir, { recursive: true, force: true });
  vi.clearAllMocks();
});

describe("deck deletion during a live session", () => {
  it("does not remove a deck while its live room is still open", async () => {
    createLiveSession(deckId, userId);
    const response = await DELETE(new Request("http://local.test", { method: "DELETE" }), {
      params: Promise.resolve({ deckId }),
    });

    expect(response.status).toBe(409);
    expect(repo.getDeck(deckId, userId)).not.toBeNull();
  });
});
