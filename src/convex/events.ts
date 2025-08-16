import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEvent = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Helper function to generate a unique access code
function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createEvent = mutation({
  args: {
    name: v.string(),
    date_range: v.object({
      start: v.string(),
      end: v.string(),
    }),
    times: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Generate a unique access code
    let accessCode = generateAccessCode();
    
    // Check if code already exists (unlikely but possible)
    let existing = await ctx.db
      .query("events")
      .withIndex("by_access_code", q => q.eq("access_code", accessCode))
      .first();
    
    // Keep generating until we get a unique one
    while (existing) {
      accessCode = generateAccessCode();
      existing = await ctx.db
        .query("events")
        .withIndex("by_access_code", q => q.eq("access_code", accessCode))
        .first();
    }
    
    const eventId = await ctx.db.insert("events", {
      ...args,
      access_code: accessCode,
      created_at: Date.now(),
    });
    return eventId;
  },
});

export const getEventByAccessCode = query({
  args: { accessCode: v.string() },
  handler: async (ctx, args) => {
    // Look up event by access code using the index
    const event = await ctx.db
      .query("events")
      .withIndex("by_access_code", q => q.eq("access_code", args.accessCode.toUpperCase()))
      .first();
    return event;
  },
});