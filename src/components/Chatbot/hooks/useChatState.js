import { useState, useRef, useEffect } from "react";
import { REQUIRED_INFO, hasRequiredInfo } from "../utils/eventUtils";

/**
 * Custom hook for managing chatbot state
 * @returns {Object} Chat state and methods
 */
export function useChatState() {
  const initialBotMessages = [
    {
      id: "init-1",
      text: "Hi! I'm your scheduling assistant. I can help you create a new event or join an existing one. Would you like to create an event or join with an access code?",
      sender: "bot",
    },
  ];

  const [messages, setMessages] = useState(initialBotMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventInfo, setEventInfo] = useState(REQUIRED_INFO);
  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "system",
      content:
        "You are a friendly scheduling assistant helping create or join events.",
    },
    { role: "assistant", content: initialBotMessages[0].text },
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track when eventInfo has all required fields
  useEffect(() => {
    if (hasRequiredInfo(eventInfo)) {
      // Log for debugging
      console.log("📅 All required event info collected:", eventInfo);

      // Dispatch a custom event that Home.jsx can listen for
      const event = new CustomEvent("eventInfoComplete", {
        detail: { eventInfo },
      });
      window.dispatchEvent(event);
    }
  }, [eventInfo]);

  // Generate a unique message ID
  const generateUniqueId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Add a user message
  const addUserMessage = (text) => {
    const userMessage = {
      id: generateUniqueId("user"),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Update conversation history
    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    return userMessage;
  };

  // Add a bot message
  const addBotMessage = (text, eventId = null) => {
    const botMessage = {
      id: generateUniqueId("bot"),
      text,
      sender: "bot",
      ...(eventId && { eventId }),
    };

    // Log for debugging when eventId is present
    if (eventId) {
      console.log(`📢 Bot message with eventId: ${eventId}`, botMessage);
    }

    setMessages((prev) => [...prev, botMessage]);

    // Update conversation history
    setConversationHistory((prev) => [
      ...prev,
      { role: "assistant", content: text },
    ]);

    return botMessage;
  };

  // Add a loading indicator
  const setLoadingState = (loading) => {
    setIsLoading(loading);
  };

  // Reset the chat state
  const resetChat = () => {
    setMessages(initialBotMessages);
    setEventInfo(REQUIRED_INFO);
    setConversationHistory([
      {
        role: "system",
        content:
          "You are a friendly scheduling assistant helping create or join events.",
      },
      { role: "assistant", content: initialBotMessages[0].text },
    ]);
  };

  return {
    messages,
    input,
    isLoading,
    eventInfo,
    conversationHistory,
    messagesEndRef,
    setInput,
    setEventInfo,
    setConversationHistory,
    addUserMessage,
    addBotMessage,
    setLoadingState,
    resetChat,
  };
}
