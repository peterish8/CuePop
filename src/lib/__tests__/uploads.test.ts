import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, initializeDatabase, repo, resetDbForTests } from "@/lib/db";
import { deleteStoredMediaIfUnused, hasValidImageSignature, storedMediaFilename } from "@/lib/uploads";

let tempDir: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cuepop-uploads-"));
  resetDbForTests(path.join(tempDir, "test.db"));
  initializeDatabase();
});

afterEach(() => {
  closeDatabase();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("image upload signatures", () => {
  it("accepts known image headers", () => {
    expect(hasValidImageSignature(new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), "image/png")).toBe(true);
    expect(hasValidImageSignature(new Uint8Array([0xff,0xd8,0xff,0xdb]), "image/jpeg")).toBe(true);
    expect(hasValidImageSignature(new TextEncoder().encode("GIF89a"), "image/gif")).toBe(true);
    expect(hasValidImageSignature(new TextEncoder().encode("RIFF1234WEBP"), "image/webp")).toBe(true);
  });

  it("rejects spoofed files", () => {
    expect(hasValidImageSignature(new TextEncoder().encode("not an image"), "image/png")).toBe(false);
    expect(hasValidImageSignature(new TextEncoder().encode("<svg></svg>"), "image/jpeg")).toBe(false);
  });

  it("only recognizes generated local media URLs for cleanup", () => {
    expect(storedMediaFilename("/api/media/123-abc.png")).toBe("123-abc.png");
    expect(storedMediaFilename("/art/demo-slide-1.svg")).toBeNull();
    expect(storedMediaFilename("/api/media/../../secret")).toBeNull();
  });

  it("keeps a reused backdrop until its final moment reference is removed", async () => {
    const user = repo.findUserByEmail("demo@cuepop.app")!;
    const deck = repo.listDecks(user.id)[0];
    const filename = "shared-backdrop-test.png";
    const sharedUrl = `/api/media/${filename}`;
    const uploadDirectory = path.join(process.cwd(), "data", "uploads");
    fs.mkdirSync(uploadDirectory, { recursive: true });
    fs.writeFileSync(path.join(uploadDirectory, filename), "fixture");
    const first = repo.getDeck(deck.id)!.items![1];
    const second = repo.getDeck(deck.id)!.items![3];
    repo.updateDeckItem(first.id, { backgroundImageUrl: sharedUrl });
    repo.updateDeckItem(second.id, { backgroundImageUrl: sharedUrl });

    expect(await deleteStoredMediaIfUnused(sharedUrl)).toBe(false);
    repo.updateDeckItem(first.id, { backgroundImageUrl: null });
    expect(await deleteStoredMediaIfUnused(sharedUrl)).toBe(false);
    repo.updateDeckItem(second.id, { backgroundImageUrl: null });
    expect(await deleteStoredMediaIfUnused(sharedUrl)).toBe(true);
  });
});
