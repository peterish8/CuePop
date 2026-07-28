import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { closeDatabase, initializeDatabase, repo, resetDbForTests } from "@/lib/db";
import { createLiveSession, executeHostCommand } from "@/lib/live/service";

vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));

import { requireUser } from "@/lib/auth";
import { DELETE, PATCH } from "./route";

let tempDir: string;
let deckId: string;
let userId: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cuepop-item-route-"));
  resetDbForTests(path.join(tempDir, "test.db"));
  initializeDatabase();
  const user = repo.findUserByEmail("demo@cuepop.app")!;
  userId = user.id;
  deckId = repo.listDecks(user.id)[0].id;
  vi.mocked(requireUser).mockResolvedValue(user);
});

afterEach(() => { closeDatabase(); fs.rmSync(tempDir, { recursive: true, force: true }); vi.clearAllMocks(); });

function context(itemId: string) { return { params: Promise.resolve({ deckId, itemId }) }; }

describe("live item protection", () => {
  it("rejects edits and deletion for the item currently being presented", async () => {
    const room = createLiveSession(deckId, userId);
    const start = executeHostCommand(room.code, room.controllerToken, "start");
    const itemId = start.currentItem!.id;
    const patch = await PATCH(new Request("http://local.test", { method: "PATCH", body: JSON.stringify({ title: "Changed while live" }), headers: { "content-type": "application/json" } }), context(itemId));
    const remove = await DELETE(new Request("http://local.test", { method: "DELETE" }), context(itemId));
    expect(patch.status).toBe(409);
    expect(remove.status).toBe(409);
    expect(repo.getDeckItem(itemId)?.title).not.toBe("Changed while live");
  });

  it("still allows edits to a future item while a different item is live", async () => {
    const room = createLiveSession(deckId, userId);
    executeHostCommand(room.code, room.controllerToken, "start");
    const futureItem = repo.getDeck(deckId)!.items![1];
    const response = await PATCH(new Request("http://local.test", { method: "PATCH", body: JSON.stringify({ title: "Prepared early" }), headers: { "content-type": "application/json" } }), context(futureItem.id));
    expect(response.status).toBe(200);
    expect(repo.getDeckItem(futureItem.id)?.title).toBe("Prepared early");
  });
});
