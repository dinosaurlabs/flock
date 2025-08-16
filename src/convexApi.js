// This file provides access to Convex API functions
// We use dynamic imports to work around Create React App's import restrictions

export const api = {
  events: {
    getEvent: "events:getEvent",
    createEvent: "events:createEvent", 
    getEventByAccessCode: "events:getEventByAccessCode",
  },
  responses: {
    getResponsesByEvent: "responses:getResponsesByEvent",
    getResponseByEventAndName: "responses:getResponseByEventAndName",
    upsertResponse: "responses:upsertResponse",
  },
};