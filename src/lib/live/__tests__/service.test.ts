import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, initializeDatabase, repo, resetDbForTests } from "@/lib/db";
import { authenticateRemoteAccess, createLiveSession, executeHostCommand, getRoomSnapshot, getRemoteRoom, joinAttendee, setRemotePassword, submitVote } from "@/lib/live/service";

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

  it("does not let ending a live question bypass the deliberate reveal flow", () => {
    const { room } = seededRoom();
    executeHostCommand(room.code, room.controllerToken, "start");
    executeHostCommand(room.code, room.controllerToken, "next");
    executeHostCommand(room.code, room.controllerToken, "open");
    expect(() => executeHostCommand(room.code, room.controllerToken, "end")).toThrow(/close voting/i);

    executeHostCommand(room.code, room.controllerToken, "close");
    expect(() => executeHostCommand(room.code, room.controllerToken, "end")).toThrow(/reveal the result/i);
    executeHostCommand(room.code, room.controllerToken, "reveal");
    expect(executeHostCommand(room.code, room.controllerToken, "end").status).toBe("ended");
  });

  it("lets an existing attendee reconnect after joining is locked", () => {
    const { room } = seededRoom();
    const first = joinAttendee(room.code, { deviceId: "device-0002", name: "Ravi" });
    executeHostCommand(room.code, room.controllerToken, "lockJoin");

    const rejoined = joinAttendee(room.code, { deviceId: "device-0002", name: "Ravi" });
    expect(rejoined.attendeeId).toBe(first.attendeeId);
    expect(() => joinAttendee(room.code, { deviceId: "device-0003", name: "New attendee" })).toThrow(/locked/i);
  });

  it("restores the same attendee and answer history after a connection resume", () => {
    const { room } = seededRoom();
    executeHostCommand(room.code, room.controllerToken, "start");
    executeHostCommand(room.code, room.controllerToken, "next");
    const open = executeHostCommand(room.code, room.controllerToken, "open");
    const first = joinAttendee(room.code, { deviceId: "device-resume", name: "Maya" });
    submitVote(room.code, { attendeeId: first.attendeeId, itemId: open.currentItem!.id, optionId: open.currentItem!.options[1].id });

    const resumed = joinAttendee(room.code, { deviceId: "device-resume", name: "Maya" });
    expect(resumed.attendeeId).toBe(first.attendeeId);
    expect(resumed.answeredItemIds).toEqual([open.currentItem!.id]);
    expect(resumed.snapshot.attendeeCount).toBe(1);
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

  it("unlocks phone controls only with the room password", async () => {
    const { room } = seededRoom();
    await setRemotePassword(room.code, room.controllerToken, "room-lock");
    await expect(authenticateRemoteAccess(room.code, "wrong")).rejects.toThrow(/not correct/i);
    const access = await authenticateRemoteAccess(room.code, "room-lock");
    expect(getRemoteRoom(room.code, access.remoteToken).items).toHaveLength(4);
    expect(executeHostCommand(room.code, access.remoteToken, "start").status).toBe("presenting");
  });

  it("clears old answers when the host restarts from the join screen", () => {
    const { room } = seededRoom();
    executeHostCommand(room.code, room.controllerToken, "start");
    executeHostCommand(room.code, room.controllerToken, "next");
    const open = executeHostCommand(room.code, room.controllerToken, "open");
    const attendee = joinAttendee(room.code, { deviceId: "device-restart", name: "Nila" });
    submitVote(room.code, { attendeeId: attendee.attendeeId, itemId: open.currentItem!.id, optionId: open.currentItem!.options[0].id });
    executeHostCommand(room.code, room.controllerToken, "close");
    executeHostCommand(room.code, room.controllerToken, "showJoin");

    const restarted = executeHostCommand(room.code, room.controllerToken, "start");
    expect(restarted.runVersion).toBe(2);
    executeHostCommand(room.code, room.controllerToken, "next");
    const reopened = executeHostCommand(room.code, room.controllerToken, "open");
    expect(() => submitVote(room.code, { attendeeId: attendee.attendeeId, itemId: reopened.currentItem!.id, optionId: reopened.currentItem!.options[0].id })).not.toThrow();
  });

  it("publishes the saved question background settings to every live surface", () => {
    const { deck, room } = seededRoom();
    const poll = repo.getDeck(deck.id)!.items!.find((item) => item.type === "poll")!;
    repo.updateDeckItem(poll.id, { backgroundImageUrl: "/api/media/poll-background.png", backgroundBlur: 12, backgroundIntensity: 71 });
    executeHostCommand(room.code, room.controllerToken, "start");
    const snapshot = executeHostCommand(room.code, room.controllerToken, "next");
    expect(snapshot.currentItem).toMatchObject({ backgroundImageUrl: "/api/media/poll-background.png", backgroundBlur: 12, backgroundIntensity: 71 });
  });

  it("invalidates old phone remote access when its password changes", async () => {
    const { room } = seededRoom();
    await setRemotePassword(room.code, room.controllerToken, "first-lock");
    const first = await authenticateRemoteAccess(room.code, "first-lock");
    await setRemotePassword(room.code, room.controllerToken, "second-lock");
    expect(() => getRemoteRoom(room.code, first.remoteToken)).toThrow(/invalid/i);
    await expect(authenticateRemoteAccess(room.code, "second-lock")).resolves.toHaveProperty("remoteToken");
  });
});
