import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const option = v.object({
  id: v.string(),
  label: v.string(),
  isCorrect: v.optional(v.boolean()),
});

const item = v.object({
  id: v.string(),
  position: v.number(),
  type: v.union(v.literal("slide"), v.literal("poll"), v.literal("quiz")),
  title: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  backgroundImageUrl: v.union(v.string(), v.null()),
  backgroundBlur: v.number(),
  backgroundIntensity: v.number(),
  question: v.union(v.string(), v.null()),
  options: v.array(option),
  notes: v.union(v.string(), v.null()),
});

export default defineSchema({
  liveSessions: defineTable({
    code: v.string(),
    controllerToken: v.string(),
    remoteToken: v.optional(v.string()),
    remotePasswordHash: v.optional(v.string()),
    deckTitle: v.string(),
    waitingMessage: v.string(),
    keepsakeThemes: v.array(v.string()),
    items: v.array(item),
    status: v.union(v.literal("join"), v.literal("presenting"), v.literal("active"), v.literal("closed"), v.literal("revealed"), v.literal("ended")),
    currentItemId: v.union(v.string(), v.null()),
    joinLocked: v.boolean(),
    runVersion: v.number(),
    endedAt: v.union(v.number(), v.null()),
  }).index("by_code", ["code"]),
  attendees: defineTable({
    sessionId: v.id("liveSessions"),
    deviceId: v.string(),
    name: v.union(v.string(), v.null()),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_device", ["sessionId", "deviceId"]),
  responses: defineTable({
    sessionId: v.id("liveSessions"),
    attendeeId: v.id("attendees"),
    itemId: v.string(),
    optionId: v.string(),
    runVersion: v.number(),
    createdAt: v.number(),
  })
    .index("by_session_and_item", ["sessionId", "itemId"])
    .index("by_session_attendee_item_run", ["sessionId", "attendeeId", "itemId", "runVersion"]),
});
