import { convex } from "../../../convexClient";
import { api } from "../../../convex/_generated/api";

/**
 * Create a new event in the database using Convex
 * @param {Object} eventData - Event data to store
 * @returns {Promise<Object>} Result of the operation
 */
export async function createEvent(eventData) {
  try {
    // Format the data for Convex (don't use the provided ID, let Convex generate one)
    const formattedData = {
      name: eventData.name,
      date_range: eventData.date_range,
      times: eventData.times || [],
    };

    console.log("Sending data to Convex:", formattedData);

    // Create event in Convex - this returns the new Convex ID
    const convexEventId = await convex.mutation(api.events.createEvent, formattedData);

    console.log("Event created with Convex ID:", convexEventId);

    // Return the Convex-generated ID, not the old one
    return { success: true, eventId: convexEventId, data: { id: convexEventId } };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error };
  }
}

/**
 * Find an event by its access code
 * @param {string} accessCode - The access code to search for
 * @returns {Promise<Object>} The event if found
 */
export async function findEventByAccessCode(accessCode) {
  try {
    const event = await convex.query(api.events.getEventByAccessCode, {
      accessCode: accessCode.toUpperCase(),
    });

    return { success: true, event };
  } catch (error) {
    console.error("Error finding event:", error);
    return { success: false, error };
  }
}

/**
 * Call OpenAI API for chat completion
 * @param {Array} messages - Conversation history
 * @returns {Promise<Object>} API response
 */
export async function callOpenAI(messages, retryOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = retryOptions;
  let retryCount = 0;

  const makeRequest = async () => {
    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OpenAI API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env file and restart the development server."
        );
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 250,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (
        retryCount < maxRetries &&
        (error.message.includes("network") ||
          error.message.includes("failed to fetch") ||
          error.message.includes("timeout"))
      ) {
        retryCount++;
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * retryCount)
        );
        return makeRequest();
      }
      throw error;
    }
  };

  return makeRequest();
}