import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, initializeDatabase, repo, resetDbForTests } from "@/lib/db";
import { createLiveSession, executeHostCommand, getRoomSnapshot, joinAttendee, submitVote } from "@/lib/live/service";

let tempDir: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cuepop-live-"));
  resetDbForTests(path.join(tempDir, "test.db"));
  initializeDatabase();
});

afterEach(() => {
  closeDatabase();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function seededRoom() {
  const user = repo.findUserByEmail("demo@cuepop.app")!;
  const deck = repo.listDecks(user.id)[0];
  return { user, deck, room: createLiveSession(deck.id, user.id) };
}

describe("live room service", () => {
  it("moves through a poll and rejects duplicate votes", () => {
    const { room } = seededRoom();
    executeHostCommand(room.code, room.controllerToken, "start");
    executeHostCommand(room.code, room.controllerToken, "next");
    const active = executeHostCommand(room.code, room.controllerToken, "open");
    expect(active.currentItem?.type).toBe("poll");

    const attendee = joinAttendee(room.code, { deviceId: "device-0001", name: "Asha" });
    const optionId = active.currentItem!.options[0].id;
    submitVote(room.code, { attendeeId: attendee.attendeeId, itemId: active.currentItem!.id, optionId });
    expect(() => submitVote(room.code, { attendeeId: attendee.attendeeId, itemId: active.currentItem!.id, optionId })).toThrow(/already answered/i);

    executeHostCommand(room.code, room.controllerToken, "close");
    const revealed = executeHostCommand(room.code, room.controllerToken, "reveal");
    expect(revealed.results?.[0].count).toBe(1);
    expect(getRoomSnapshot(room.code)?.attendeeCount).toBe(1);
  });

  it("enforces close-before-reveal and blocks navigation while voting is active", () => {
    const { room } = seededRoom();
    executeHostCommand(room.code, room.controllerToken, "start");
    executeHostCommand(room.code, room.controllerToken, "next");
    executeHostCommand(room.code, room.controllerToken, "open");

    expect(() => executeHostCommand(room.code, room.controllerToken, "reveal")).toThrow(/close voting/i);
    expect(() => executeHostCommand(room.code, room.controllerToken, "next")).toThrow(/close voting/i);

    executeHostCommand(room.code, room.controllerToken, "close");
    expect(executeHostCommand(room.code, room.controllerToken, "reveal").status).toBe("revealed");
  });

  it("lets an existing attendee reconnect after joining is locked", () => {
    const { room } = seededRoom();
    const first = joinAttendee(room.code, { deviceId: "device-0002", name: "Ravi" });
    executeHostCommand(room.code, room.controllerToken, "lockJoin");

    const rejoined = joinAttendee(room.code, { deviceId: "device-0002", name: "Ravi" });
    expect(rejoined.attendeeId).toBe(first.attendeeId);
    expect(() => joinAttendee(room.code, { deviceId: "device-0003", name: "New attendee" })).toThrow(/locked/i);
  });

  it("keeps presenter notes and quiz correctness private until reveal", () => {
    const { room } = seededRoom();
    executeHostCommand(room.code, room.controllerToken, "start");
    executeHostCommand(room.code, room.controllerToken, "next");
    executeHostCommand(room.code, room.controllerToken, "next");
    const quiz = executeHostCommand(room.code, room.controllerToken, "next");

    expect(quiz.currentItem?.type).toBe("quiz");
    expect("notes" in (quiz.currentItem || {})).toBe(false);
    expect(quiz.currentItem?.options.some((option) => "isCorrect" in option)).toBe(false);

    executeHostCommand(room.code, room.controllerToken, "open");
    executeHostCommand(room.code, room.controllerToken, "close");
    const revealed = executeHostCommand(room.code, room.controllerToken, "reveal");
    expect(revealed.currentItem?.options.some((option) => option.isCorrect)).toBe(true);
  });
});
