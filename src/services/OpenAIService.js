// OpenAI API service
// Note: In a production app, API calls should be made through a backend server
// to keep your API key secure. This is just for demonstration purposes.

const OPENAI_API_KEY =
  "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";

export const OpenAIService = {
  async generateResponse(messages) {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: formatMessages(messages),
            temperature: 0.7,
            max_tokens: 150,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  },

  async processEventScheduling(messages) {
    try {
      // Call the real OpenAI API and return the message
      const aiMessage = await this.generateResponse(messages);
      // For now, just return the message as the bot's response
      return {
        message: aiMessage,
        eventData: null, // You can add event extraction logic here if needed
      };
    } catch (error) {
      console.error("Error processing event scheduling:", error);
      return {
        message: "Sorry, I encountered an error. Please try again.",
        eventData: null,
      };
    }
  },
};

// Helper function to format messages for the OpenAI API
const formatMessages = (messages) => {
  return messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text,
  }));
};

// Simulate AI response for demonstration
const simulateAIResponse = (messages) => {
  // Extract the latest user message
  const userMessages = messages.filter((msg) => msg.sender === "user");
  const latestUserMessage =
    userMessages[userMessages.length - 1]?.text.toLowerCase() || "";

  if (
    latestUserMessage.includes("meeting") ||
    latestUserMessage.includes("event")
  ) {
    return "Great! When would you like to schedule this event? Please provide some potential dates.";
  } else if (
    latestUserMessage.includes("tomorrow") ||
    latestUserMessage.includes("next week") ||
    latestUserMessage.match(/\d+\/\d+/)
  ) {
    return "Got it. How many people will be attending? Would you like to add any specific requirements?";
  } else if (
    latestUserMessage.includes("people") ||
    latestUserMessage.includes("participants")
  ) {
    return "Thanks! What's the purpose or title of this event?";
  } else {
    return "I'm here to help you schedule events. Tell me more about what you're planning!";
  }
};

// Extract event details from conversation
const extractEventDetails = (messages, latestUserMessage) => {
  // In a real implementation, this would use NLP techniques or the OpenAI API
  // to extract structured data from the conversation

  // For demonstration, we'll use some simple rules:
  const conversation = messages.map((msg) => msg.text.toLowerCase()).join(" ");
  let eventData = null;

  // Check if we have enough information to create an event
  if (messages.length > 4) {
    // Simple detection of event type
    const isMeeting = conversation.includes("meeting");
    const isProject = conversation.includes("project");
    const isTeam = conversation.includes("team");

    // Extract participants count if mentioned
    const participantsMatch = conversation.match(
      /(\d+)\s*(people|participants|attendees)/
    );
    const participants = participantsMatch
      ? parseInt(participantsMatch[1])
      : Math.floor(Math.random() * 10) + 2;

    // Generate a title based on keywords
    let title = "";
    if (isTeam) title += "Team ";
    if (isProject) title += "Project ";
    title += isMeeting ? "Meeting" : "Event";

    // Generate random dates if not explicitly mentioned
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i + Math.floor(Math.random() * 10));
      dates.push(futureDate.toISOString().split("T")[0]);
    }

    eventData = {
      type: isMeeting ? "meeting" : "event",
      title,
      description:
        "Event created based on your conversation with the AI assistant",
      dates,
      participants,
    };
  }

  return {
    message: eventData
      ? "I've processed your requirements. I can create a scheduling page for your event now."
      : "Tell me more about the event you're planning.",
    eventData,
  };
};

export default OpenAIService;
