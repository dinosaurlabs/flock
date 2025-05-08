import { supabase } from "../../../supabaseClient";

/**
 * Create a new event in the database
 * @param {Object} eventData - Event data to store
 * @returns {Promise<Object>} Result of the operation
 */
export async function createEvent(eventData) {
  try {
    // Ensure the data is formatted correctly for Supabase
    // Check if date_range is already a string, if not stringify it
    const date_range =
      typeof eventData.date_range === "string"
        ? eventData.date_range
        : JSON.stringify(eventData.date_range);

    const times_that_work = Array.isArray(eventData.times_that_work)
      ? JSON.stringify(eventData.times_that_work)
      : eventData.times_that_work || "[]";

    const formattedData = {
      id: eventData.id,
      name: eventData.name,
      description: eventData.description,
      date_range: date_range,
      allow_anonymous: Boolean(eventData.allow_anonymous),
      times_that_work: times_that_work,
    };

    // Log the formatted data for debugging
    console.log("Sending data to Supabase:", formattedData);

    // Send the data to Supabase
    const { data, error } = await supabase
      .from("events")
      .insert([formattedData])
      .select();

    if (error) throw error;

    return { success: true, eventId: eventData.id, data };
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
    const { data: events, error } = await supabase.from("events").select("id");

    if (error) throw error;

    // Find the event where the access code matches
    const event = events.find((e) => {
      const generatedCode = e.id.slice(0, 6).toUpperCase();
      return generatedCode === accessCode.toUpperCase();
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
