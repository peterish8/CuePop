import { describe, expect, it } from "vitest";
import { createDeckTransfer, parseDeckTransfer } from "@/lib/deck-transfer";
import type { Deck } from "@/lib/schema";

const deck: Deck = { id: "deck", userId: "host", title: "Gavel News", description: "CLAT current affairs", waitingMessage: "Join in.", keepsakeThemes: ["signal"], createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", items: [{ id: "item", deckId: "deck", position: 0, type: "poll", title: "Daily pulse", imageUrl: null, backgroundImageUrl: null, backgroundBlur: 0, backgroundIntensity: 64, question: "What matters?", options: [{ id: "a", label: "Judgment" }, { id: "b", label: "Act" }], notes: null, revealMode: "manual", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }] };

describe("deck transfer", () => {
  it("round-trips a portable deck package", () => expect(parseDeckTransfer(createDeckTransfer(deck))).toMatchObject({ success: true }));
  it("rejects an unknown package", () => expect(parseDeckTransfer({ format: "other" }).success).toBe(false));
});
