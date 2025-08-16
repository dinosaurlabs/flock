import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEvent = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

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
    const eventId = await ctx.db.insert("events", {
      ...args,
      created_at: Date.now(),
    });
    return eventId;
  },
});

export const getEventByAccessCode = query({
  args: { accessCode: v.string() },
  handler: async (ctx, args) => {
    // For now, we'll use the ID as the access code
    // In production, you'd want a separate access_code field
    const events = await ctx.db.query("events").collect();
    return events.find(event => 
      event._id.toString().slice(0, 6).toUpperCase() === args.accessCode
    );
  },
});