import React from "react";
import Button from "../../Button/Button";

/**
 * Component for chat input and send button
 */
const ChatInput = ({ input, setInput, handleSend, isLoading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chatbot-footer">
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="chatbot-input-field"
          disabled={isLoading}
        />
        <Button
          text="Send"
          buttonSize="sm"
          onClick={handleSend}
          className="chatbot-send-button"
          color={isLoading ? "secondary" : "primary"}
        />
      </div>
    </div>
  );
};

export default ChatInput;
