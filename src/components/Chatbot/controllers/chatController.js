import { hasRequiredInfo } from "../utils/eventUtils";
import { generateSystemPrompt } from "../prompts/systemPrompts";

// Import based on environment variable
const useConvex = process.env.REACT_APP_USE_CONVEX === 'true';
const apiService = useConvex 
  ? require("../services/apiServiceConvex")
  : require("../services/apiService");

const { callOpenAI, createEvent, findEventByAccessCode } = apiService;

/**
 * Process the user's message and generate a response
 * @param {string} userMessage - User's message text
 * @param {Object} state - Current chat state
 * @param {Function} onEventCreated - Callback for when an event is created
 * @returns {Promise<void>}
 */
export async function processMessage(userMessage, state, onEventCreated) {
  const {
    eventInfo,
    conversationHistory,
    setLoadingState,
    addBotMessage,
    setEventInfo,
    setConversationHistory,
  } = state;

  // Get the current date for reference
  const currentDate = new Date();
  console.log("Current date:", currentDate.toISOString());

  try {
    setLoadingState(true);

    // Create the updated history with the user's message
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // Generate system prompt based on current event info
    const systemPrompt = generateSystemPrompt(eventInfo);

    // Call OpenAI for a response
    const data = await callOpenAI([systemPrompt, ...updatedHistory]);
    const botResponse = data.choices[0].message.content;

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(botResponse);
      const { message, updates, shouldCreateEvent, shouldJoinEvent, analysis } =
        parsedResponse;

      console.log("GPT Analysis:", analysis);

      // Log any date-related updates for debugging
      if (updates?.dateRange) {
        console.log("Date range from GPT:", updates.dateRange);
      }

      // Handle joining event with access code
      if (shouldJoinEvent && updates?.accessCode) {
        try {
          const { success, event } = await findEventByAccessCode(
            updates.accessCode
          );

          if (success && event) {
            addBotMessage(
              `Great! I found your event. Click the button below to join.`,
              event.id
            );
          } else {
            addBotMessage(
              "I couldn't find an event with that access code. Please check the code and try again, or let me know if you'd like to create a new event instead."
            );
          }
        } catch (error) {
          console.error("Error joining event:", error);
          addBotMessage(
            "Sorry, I encountered an error while trying to find the event. Please try again or let me know if you'd like to create a new event instead."
          );
        }
        setLoadingState(false);
        return;
      }

      // Update event info if we have updates
      if (updates) {
        const newEventInfo = { ...eventInfo };
        Object.keys(updates).forEach((key) => {
          if (
            updates[key] !== null &&
            (!eventInfo[key] || key === "description")
          ) {
            newEventInfo[key] = updates[key];
          }
        });
        setEventInfo(newEventInfo);

        // IMPORTANT: DO NOT automatically create the event
        // Instead, just update event info and let the card handle creation
        // Only create event if the message explicitly requests it
        if (
          shouldCreateEvent &&
          userMessage.toLowerCase().includes("yes") &&
          userMessage.toLowerCase().includes("create") &&
          hasRequiredInfo(newEventInfo)
        ) {
          await createEventFromInfo(
            newEventInfo,
            addBotMessage,
            onEventCreated,
            currentDate
          );
          setLoadingState(false);
          return;
        }
      }

      // Add bot message with the response (unless all info collected)
      if (!hasRequiredInfo(eventInfo) || !message.includes("create")) {
        addBotMessage(message);
      } else {
        // If we have all info, add an instruction to use the card
        addBotMessage(
          "Please review the event details and click CREATE FLOCK to confirm."
        );
      }

      // Update conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: botResponse },
      ]);
    } catch (error) {
      console.error("Error processing response:", error);
      addBotMessage(
        "I'm having trouble processing your request. Please try again in a moment."
      );
    }
  } catch (error) {
    console.error("Network or API Error:", error);
    addBotMessage(
      error.message.includes("API key")
        ? "I'm not properly configured yet. Please add your OpenAI API key to the .env file."
        : "I'm having trouble connecting. Please check your internet connection and try again."
    );
  } finally {
    setLoadingState(false);
  }
}

// Helper to parse hour strings like '8 AM', '5 PM', '08:00', '8'
function parseHourString(str) {
  str = str.trim();
  // Handle '8 AM', '5 PM'
  const ampmMatch = str.match(/^([0-9]{1,2})(?:\s*(:[0-9]{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return hour;
  }
  // Handle '08:00'
  if (str.includes(':')) {
    return parseInt(str.split(':')[0], 10);
  }
  // Handle '8'
  return parseInt(str, 10);
}

// Helper to pad numbers
function pad(n) {
  return n.toString().padStart(2, '0');
}

/**
 * Create an event from the collected information
 * @param {Object} eventInfo - Event information
 * @param {Function} addBotMessage - Function to add a bot message
 * @param {Function} onEventCreated - Callback when event is created
 * @param {Date} [currentDate=new Date()] - Current date for reference
 * @returns {Promise<void>}
 */
export async function createEventFromInfo(
  eventInfo,
  addBotMessage,
  onEventCreated,
  currentDate = new Date()
) {
  console.log("eventInfo before createEvent:", eventInfo);

  // Ensure times is a non-empty array
  let times = eventInfo.times;
  if (!Array.isArray(times) || !times.length) {
    // If timesThatWork is missing, null, or 'Flexible timing', default to full day
    let timeRange = eventInfo.timesThatWork;
    if (
      !timeRange ||
      typeof timeRange !== "string" ||
      timeRange.toLowerCase().includes("flexible")
    ) {
      timeRange = "0:00 - 24:00"; // full day
    }
    if (
      eventInfo.dateRange &&
      eventInfo.dateRange.start &&
      eventInfo.dateRange.end
    ) {
      times = generateTimesArray(eventInfo.dateRange, timeRange);
    }
  }
  if (!Array.isArray(times) || !times.length) {
    console.error("No times array found in eventInfo!", eventInfo);
    addBotMessage("No valid times found for this event. Please try again.");
    return;
  }

  // Map the fields to match database schema
  const eventData = {
    name: eventInfo.name,
    description: eventInfo.description || "No description provided",
    date_range: eventInfo.dateRange, // Mapping dateRange to date_range
    allow_anonymous:
      eventInfo.allowAnonymous === null ? false : eventInfo.allowAnonymous, // Mapping allowAnonymous to allow_anonymous
    times, // This is now guaranteed to be an array
  };

  // Log the event data for debugging
  console.log("Event data before API call:", eventData);

  try {
    const { success, error, eventId } = await createEvent(eventData);

    if (success && eventId) {
      const eventLink = `${window.location.origin}/event/${eventId}`;
      addBotMessage(
        `Perfect! I've created your event "${eventData.name}". Here's your event link:\n\n${eventLink}\n\nClick the button below to open the event page, or copy the link to share with participants.`,
        eventId
      );

      if (onEventCreated) {
        // Make sure to pass the eventId to the callback
        onEventCreated(eventId);
      }

      // Return the eventId for any promise handlers
      return { success: true, eventId };
    } else {
      throw error || new Error("Failed to create event");
    }
  } catch (error) {
    console.error("Error creating event:", error);
    addBotMessage(
      "I encountered an error while creating the event. Please try again."
    );
    return { success: false, error };
  }
}

function generateTimesArray(dateRange, timeRange) {
  if (
    !dateRange ||
    !timeRange ||
    typeof timeRange !== "string" ||
    timeRange.toLowerCase().includes("flexible")
  ) {
    console.error("Invalid or flexible timeRange for generateTimesArray:", timeRange);
    // Prompt user for a specific time range
    return null; // Use null to indicate special handling
  }
  // Accept both " - " and " to " as separators
  let parts = timeRange.split(" - ");
  if (parts.length !== 2) {
    parts = timeRange.split(" to ");
  }
  if (parts.length !== 2) {
    console.error("Unrecognized timeRange format:", timeRange);
    return [];
  }
  const [startHour, endHour] = parts;
  const startH = parseHourString(startHour);
  let endH = parseHourString(endHour);
  
  // Handle events that span midnight (e.g., 10 PM to 2 AM)
  // If end hour is less than start hour, it means it goes to the next day
  const spansMiddnight = endH <= startH;
  if (spansMiddnight && endH === 0) {
    endH = 24; // Treat "12 AM" as end of day when it spans midnight
  }
  
  const result = [];
  let current = new Date(dateRange.start);
  const last = new Date(dateRange.end);
  
  while (current <= last) {
    if (spansMiddnight) {
      // Add hours from start to midnight
      for (let hour = startH; hour < 24; hour++) {
        const iso = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}T${pad(hour)}:00:00`;
        result.push(iso);
      }
      // If we're not on the last day, add hours from midnight to end on next day
      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);
      if (nextDay <= last) {
        for (let hour = 0; hour < endH; hour++) {
          const iso = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}T${pad(hour)}:00:00`;
          result.push(iso);
        }
      }
    } else {
      // Normal case: hours within the same day
      for (let hour = startH; hour < endH; hour++) {
        const iso = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}T${pad(hour)}:00:00`;
        result.push(iso);
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
}
