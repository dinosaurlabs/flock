import { callOpenAI } from "../services/apiService";
import { createEvent, findEventByAccessCode } from "../services/apiService";
import { generateEventId, hasRequiredInfo } from "../utils/eventUtils";
import { generateSystemPrompt } from "../prompts/systemPrompts";

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
  console.log("Creating event with reference date:", currentDate.toISOString());

  const eventId = generateEventId();
  // Map the fields to match Supabase schema
  const eventData = {
    id: eventId,
    name: eventInfo.name,
    description: eventInfo.description || "No description provided",
    date_range: eventInfo.dateRange, // Mapping dateRange to date_range
    allow_anonymous:
      eventInfo.allowAnonymous === null ? false : eventInfo.allowAnonymous, // Mapping allowAnonymous to allow_anonymous
    times_that_work: eventInfo.timesThatWork, // Mapping timesThatWork to times_that_work
  };

  // Log the event data for debugging
  console.log("Event data before API call:", eventData);

  try {
    const { success, error } = await createEvent(eventData);

    if (success) {
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
      throw error;
    }
  } catch (error) {
    console.error("Error creating event:", error);
    addBotMessage(
      "I encountered an error while creating the event. Please try again."
    );
    return { success: false, error };
  }
}
