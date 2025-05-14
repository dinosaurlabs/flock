import React from "react";
import { useNavigate } from "react-router-dom";
import Typography from "../Typography/Typography";
import "./Chatbot.css";

// Components
import ChatInput from "./components/ChatInput";
import ChatMessageList from "./components/ChatMessageList";

// Hooks
import { useChatState } from "./hooks/useChatState";

// Controllers
import { processMessage } from "./controllers/chatController";

// Utils
import { REQUIRED_INFO } from "./utils/eventUtils";

/**
 * Main Chatbot component that manages the entire chat interface
 */
function Chatbot() {
  const { messages, eventInfo, setLoadingState } = useChatState();

  /**
   * Handle sending a message
   */
  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    // Add user message
    addUserMessage(input);
    setInput("");

    // Process the message with the chat controller
    await processMessage(input, chatState, (eventId) => {
      // Reset event info for potential new event after creating one
      setEventInfo(REQUIRED_INFO);
    });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <Typography textStyle="body-lg" color="primary-light">
          Flock AI Scheduler
        </Typography>
      </div>

      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Chatbot;
