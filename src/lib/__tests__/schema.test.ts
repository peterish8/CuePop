import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, initializeDatabase, repo, resetDbForTests } from "@/lib/db";

let tempDir: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cuepop-test-"));
  resetDbForTests(path.join(tempDir, "test.db"));
  initializeDatabase();
});

afterEach(() => {
  closeDatabase();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("database seed", () => {
  it("creates the demo user and a mixed sample deck", () => {
    const user = repo.findUserByEmail("demo@cuepop.app");
    expect(user?.name).toBe("CuePop Demo");
    const decks = repo.listDecks(user!.id);
    expect(decks).toHaveLength(1);
    const deck = repo.getDeck(decks[0].id, user!.id);
    expect(deck?.items?.map((item) => item.type)).toEqual(["slide", "poll", "slide", "quiz"]);
  });
});
