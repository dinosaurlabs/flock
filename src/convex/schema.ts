import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    date_range: v.object({
      start: v.string(),
      end: v.string(),
    }),
    times: v.optional(v.array(v.string())),
    access_code: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_access_code", ["access_code"]),
  
  responses: defineTable({
    event_id: v.id("events"),
    name: v.string(),
    availability: v.array(v.string()),
    created_at: v.number(),
  }).index("by_event", ["event_id"]),
});