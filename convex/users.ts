import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const serverSecret = v.string();
const userResult = v.object({ id: v.string(), name: v.string(), email: v.string(), passwordHash: v.optional(v.string()), plan: v.union(v.literal("free"), v.literal("pro")), createdAt: v.number() });
function authorize(secret: string) { if (!process.env.CONVEX_SERVER_SECRET || secret !== process.env.CONVEX_SERVER_SECRET) throw new ConvexError("Server authorization required."); }
function publicUser(user: any) { return { id: user.id, name: user.name, email: user.email, ...(user.passwordHash ? { passwordHash: user.passwordHash } : {}), plan: user.plan, createdAt: user.createdAt }; }

export const findByEmail = query({ args: { email: v.string(), serverSecret }, returns: v.union(userResult, v.null()), handler: async (ctx, args) => { authorize(args.serverSecret); const user = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email.toLowerCase())).unique(); return user ? publicUser(user) : null; } });
export const upsert = mutation({ args: { id: v.string(), name: v.string(), email: v.string(), passwordHash: v.optional(v.string()), serverSecret }, returns: userResult, handler: async (ctx, args) => { authorize(args.serverSecret); const email = args.email.toLowerCase(); const existing = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).unique(); if (existing) { await ctx.db.patch(existing._id, { name: args.name, ...(args.passwordHash ? { passwordHash: args.passwordHash } : {}) }); return publicUser((await ctx.db.get(existing._id))!); } const createdAt = Date.now(); const id = await ctx.db.insert("users", { id: args.id, name: args.name, email, ...(args.passwordHash ? { passwordHash: args.passwordHash } : {}), plan: "free", createdAt }); return publicUser((await ctx.db.get(id))!); } });
