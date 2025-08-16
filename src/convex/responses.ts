import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getResponsesByEvent = query({
  args: { event_id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("responses")
      .withIndex("by_event", (q) => q.eq("event_id", args.event_id))
      .order("asc")
      .collect();
  },
});

export const getResponseByEventAndName = query({
  args: { 
    event_id: v.id("events"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_event", (q) => q.eq("event_id", args.event_id))
      .collect();
    
    return responses.find(r => r.name === args.name);
  },
});

export const upsertResponse = mutation({
  args: {
    event_id: v.id("events"),
    name: v.string(),
    availability: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if response exists
    const existing = await ctx.db
      .query("responses")
      .withIndex("by_event", (q) => q.eq("event_id", args.event_id))
      .collect();
    
    const existingResponse = existing.find(r => r.name === args.name);
    
    if (existingResponse) {
      // Update existing
      await ctx.db.patch(existingResponse._id, {
        availability: args.availability,
      });
      return existingResponse._id;
    } else {
      // Create new
      const responseId = await ctx.db.insert("responses", {
        ...args,
        created_at: Date.now(),
      });
      return responseId;
    }
  },
});