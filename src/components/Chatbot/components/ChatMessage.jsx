import React from "react";
import Typography from "../../Typography/Typography";
import Button from "../../Button/Button";
import { useNavigate } from "react-router-dom";

/**
 * Component for rendering individual chat messages
 */
const ChatMessage = ({ message }) => {
  const navigate = useNavigate();

  const handleOpenEvent = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div
      className={`message ${
        message.sender === "user" ? "user-message" : "bot-message"
      }`}
    >
      <Typography textStyle="body-md">{message.text}</Typography>
      {message.eventId && (
        <div className="mt-2">
          <Button
            text="Open Event Page"
            buttonSize="md"
            onClick={() => handleOpenEvent(message.eventId)}
            className="text-white bg-blue-500 hover:bg-blue-600"
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
