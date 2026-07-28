import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

function authorize(secret: string) { if (!process.env.CONVEX_SERVER_SECRET || secret !== process.env.CONVEX_SERVER_SECRET) throw new ConvexError("Server authorization required."); }

export const generateUploadUrl = mutation({
  args: { serverSecret: v.string() }, returns: v.string(),
  handler: async (ctx, args) => { authorize(args.serverSecret); return await ctx.storage.generateUploadUrl(); },
});
export const getUrl = query({
  args: { storageId: v.id("_storage"), serverSecret: v.string() }, returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => { authorize(args.serverSecret); return await ctx.storage.getUrl(args.storageId); },
});
