import React from "react";
import ChatMessage from "./ChatMessage";

/**
 * Component for rendering the list of chat messages
 */
const ChatMessageList = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <div className="chatbot-messages">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="message bot-message typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
