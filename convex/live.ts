import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roomCode = v.string();
const controllerCommand = v.union(
  v.literal("showJoin"), v.literal("start"), v.literal("next"), v.literal("previous"),
  v.literal("open"), v.literal("close"), v.literal("reveal"), v.literal("end"),
  v.literal("lockJoin"), v.literal("unlockJoin"),
);

export const create = mutation({
  args: {
    code: roomCode,
    controllerToken: v.string(),
    deckTitle: v.string(),
    waitingMessage: v.string(),
    keepsakeThemes: v.array(v.string()),
    items: v.array(v.object({
      id: v.string(), position: v.number(), type: v.union(v.literal("slide"), v.literal("poll"), v.literal("quiz")),
      title: v.string(), imageUrl: v.union(v.string(), v.null()), backgroundImageUrl: v.union(v.string(), v.null()),
      backgroundBlur: v.number(), backgroundIntensity: v.number(), question: v.union(v.string(), v.null()),
      options: v.array(v.object({ id: v.string(), label: v.string(), isCorrect: v.optional(v.boolean()) })), notes: v.union(v.string(), v.null()),
    })),
  },
  returns: v.object({ code: v.string(), controllerToken: v.string() }),
  handler: async (ctx, args) => {
    if (!args.items.length) throw new ConvexError("Add at least one item before starting a session.");
    const existing = await sessionForCode(ctx, args.code);
    if (existing) throw new ConvexError("That room code is already in use. Start the session again.");
    await ctx.db.insert("liveSessions", {
      ...args, code: args.code.trim().toUpperCase(), status: "join", currentItemId: null,
      joinLocked: false, runVersion: 0, endedAt: null,
    });
    return { code: args.code.trim().toUpperCase(), controllerToken: args.controllerToken };
  },
});

async function sessionForCode(ctx: { db: any }, code: string) {
  return await ctx.db.query("liveSessions").withIndex("by_code", (q: any) => q.eq("code", code.trim().toUpperCase())).unique();
}

async function roomSnapshot(ctx: { db: any }, session: any) {
  const currentItem = session.currentItemId ? session.items.find((entry: any) => entry.id === session.currentItemId) ?? null : null;
  const currentIndex = currentItem ? session.items.findIndex((entry: any) => entry.id === currentItem.id) : -1;
  const attendees = await ctx.db.query("attendees").withIndex("by_session", (q: any) => q.eq("sessionId", session._id)).take(600);
  const responses = currentItem
    ? await ctx.db.query("responses").withIndex("by_session_and_item", (q: any) => q.eq("sessionId", session._id).eq("itemId", currentItem.id)).take(600)
    : [];
  const results = currentItem && (session.status === "revealed" || session.status === "ended") && currentItem.type !== "slide"
    ? currentItem.options.map((entry: any) => {
        const count = responses.filter((response: any) => response.runVersion === session.runVersion && response.optionId === entry.id).length;
        return { optionId: entry.id, label: entry.label, count, percent: responses.length ? Math.round((count / responses.length) * 100) : 0, ...(currentItem.type === "quiz" ? { isCorrect: entry.isCorrect === true } : {}) };
      })
    : null;
  return {
    code: session.code,
    deckTitle: session.deckTitle,
    waitingMessage: session.waitingMessage,
    keepsakeThemes: session.keepsakeThemes,
    status: session.status,
    runVersion: session.runVersion,
    joinLocked: session.joinLocked,
    currentIndex,
    totalItems: session.items.length,
    currentItem: currentItem ? { ...currentItem, options: currentItem.options.map((entry: any) => ({ id: entry.id, label: entry.label, ...(session.status === "revealed" || session.status === "ended" ? { isCorrect: entry.isCorrect === true } : {}) })) } : null,
    attendeeCount: attendees.length,
    responseCount: responses.filter((response: any) => response.runVersion === session.runVersion).length,
    results,
  };
}

export const room = query({
  args: { code: roomCode },
  returns: v.any(),
  handler: async (ctx, args) => {
    const session = await sessionForCode(ctx, args.code);
    return session ? await roomSnapshot(ctx, session) : null;
  },
});

export const report = query({
  args: { code: roomCode, token: v.string() }, returns: v.any(),
  handler: async (ctx, args) => {
    const session = await sessionForCode(ctx, args.code);
    if (!session || session.controllerToken !== args.token) throw new ConvexError("Presenter access is required.");
    const attendees = await ctx.db.query("attendees").withIndex("by_session", (q) => q.eq("sessionId", session._id)).take(600);
    const responses = await ctx.db.query("responses").withIndex("by_session_and_item", (q) => q.eq("sessionId", session._id)).take(600);
    const attendeeById = new Map(attendees.map((attendee) => [attendee._id, attendee]));
    const moments = session.items.filter((item: any) => item.type !== "slide").map((item: any) => {
      const itemResponses = responses.filter((response) => response.itemId === item.id && response.runVersion === session.runVersion);
      return { itemId: item.id, type: item.type, question: item.question || "", totalResponses: itemResponses.length, participationRate: attendees.length ? Math.round((itemResponses.length / attendees.length) * 100) : 0, options: item.options.map((option: any) => ({ label: option.label, count: itemResponses.filter((response) => response.optionId === option.id).length, ...(item.type === "quiz" ? { isCorrect: option.isCorrect === true } : {}) })) };
    });
    return { code: session.code, deckTitle: session.deckTitle, attendeeCount: attendees.length, startedAt: session._creationTime, endedAt: session.endedAt, moments, answers: responses.filter((response) => response.runVersion === session.runVersion).map((response) => ({ attendeeName: attendeeById.get(response.attendeeId)?.name || "Anonymous attendee", itemId: response.itemId, answer: session.items.find((item: any) => item.id === response.itemId)?.options.find((option: any) => option.id === response.optionId)?.label || response.optionId, answeredAt: response.createdAt })) };
  },
});

export const join = mutation({
  args: { code: roomCode, deviceId: v.string(), name: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    if (args.deviceId.length < 8 || args.deviceId.length > 128) throw new ConvexError("This device could not be identified. Refresh and try again.");
    const session = await sessionForCode(ctx, args.code);
    if (!session) throw new ConvexError("Room not found.");
    const now = Date.now();
    const existing = await ctx.db.query("attendees").withIndex("by_session_and_device", (q) => q.eq("sessionId", session._id).eq("deviceId", args.deviceId)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name?.trim() || existing.name, lastSeenAt: now });
      const answered = await ctx.db.query("responses").withIndex("by_session_attendee_item_run", (q) => q.eq("sessionId", session._id).eq("attendeeId", existing._id)).take(600);
      return { attendeeId: existing._id, answeredItemIds: answered.filter((response) => response.runVersion === session.runVersion).map((response) => response.itemId), snapshot: await roomSnapshot(ctx, session) };
    }
    if (session.status === "ended") throw new ConvexError("This session has ended.");
    if (session.joinLocked) throw new ConvexError("Joining is currently locked.");
    const attendeeId = await ctx.db.insert("attendees", { sessionId: session._id, deviceId: args.deviceId, name: args.name?.trim() || null, joinedAt: now, lastSeenAt: now });
    return { attendeeId, answeredItemIds: [], snapshot: await roomSnapshot(ctx, session) };
  },
});

export const vote = mutation({
  args: { code: roomCode, attendeeId: v.id("attendees"), itemId: v.string(), optionId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const session = await sessionForCode(ctx, args.code);
    if (!session) throw new ConvexError("Room not found.");
    if (session.status !== "active" || session.currentItemId !== args.itemId) throw new ConvexError("Voting is not open for this question.");
    const attendee = await ctx.db.get(args.attendeeId);
    if (!attendee || attendee.sessionId !== session._id) throw new ConvexError("Rejoin the room before voting.");
    const item = session.items.find((entry: any) => entry.id === args.itemId);
    if (!item || item.type === "slide" || !item.options.some((entry: any) => entry.id === args.optionId)) throw new ConvexError("Invalid answer option.");
    const duplicate = await ctx.db.query("responses").withIndex("by_session_attendee_item_run", (q) => q.eq("sessionId", session._id).eq("attendeeId", attendee._id).eq("itemId", args.itemId).eq("runVersion", session.runVersion)).unique();
    if (duplicate) throw new ConvexError("You already answered this question.");
    await ctx.db.insert("responses", { sessionId: session._id, attendeeId: attendee._id, itemId: args.itemId, optionId: args.optionId, runVersion: session.runVersion, createdAt: Date.now() });
    return { submitted: true };
  },
});

export const command = mutation({
  args: { code: roomCode, token: v.string(), command: controllerCommand },
  returns: v.any(),
  handler: async (ctx, args) => {
    const session = await sessionForCode(ctx, args.code);
    if (!session || (session.controllerToken !== args.token && session.remoteToken !== args.token)) throw new ConvexError("Invalid presenter control token.");
    if (session.status === "ended") throw new ConvexError("This session has ended.");
    let status = session.status;
    let currentItemId = session.currentItemId;
    let joinLocked = session.joinLocked;
    let runVersion = session.runVersion;
    const index = currentItemId ? session.items.findIndex((entry: any) => entry.id === currentItemId) : -1;
    if (args.command === "showJoin") { status = "join"; currentItemId = null; }
    if (args.command === "start") { if (status !== "join") throw new ConvexError("Return to the join screen before restarting the deck."); status = "presenting"; currentItemId = session.items[0]?.id ?? null; runVersion += 1; }
    if (args.command === "next") { if (status === "join" || status === "active" || index >= session.items.length - 1) throw new ConvexError("This room cannot advance right now."); status = "presenting"; currentItemId = session.items[index + 1].id; }
    if (args.command === "previous") { if (status === "join" || status === "active" || index <= 0) throw new ConvexError("This room cannot move back right now."); status = "presenting"; currentItemId = session.items[index - 1].id; }
    if (args.command === "open") { const item = session.items.find((entry: any) => entry.id === currentItemId); if (!item || item.type === "slide" || status !== "presenting") throw new ConvexError("This question is not ready to open."); status = "active"; }
    if (args.command === "close") { if (status !== "active") throw new ConvexError("Voting is not open."); status = "closed"; }
    if (args.command === "reveal") { if (status !== "closed") throw new ConvexError("Close voting before revealing results."); status = "revealed"; }
    if (args.command === "end") { if (status === "active" || status === "closed") throw new ConvexError("Reveal results or return to the join screen before ending the session."); status = "ended"; }
    if (args.command === "lockJoin") joinLocked = true;
    if (args.command === "unlockJoin") joinLocked = false;
    await ctx.db.patch(session._id, { status, currentItemId, joinLocked, runVersion, endedAt: status === "ended" ? Date.now() : session.endedAt });
    const next = await ctx.db.get(session._id);
    return next ? await roomSnapshot(ctx, next) : null;
  },
});
