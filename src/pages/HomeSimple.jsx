import React, { useRef, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import "../App.css";
import "../components/Chatbot/Chatbot.css";
import { useChatState } from "../components/Chatbot/hooks/useChatState";
import {
  processMessage,
  createEventFromInfo,
} from "../components/Chatbot/controllers/chatController";
import { hasRequiredInfo } from "../components/Chatbot/utils/eventUtils";
import EventSummaryCard from "../components/EventSummaryCard";

function HomeSimple() {
  const chatState = useChatState();
  const {
    messages,
    input: inputText,
    eventInfo,
    messagesEndRef,
    setInput: setInputText,
    addUserMessage,
    addBotMessage,
  } = chatState;

  const [showCard, setShowCard] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (hasRequiredInfo(eventInfo) && !showCard) {
      setShowCard(true);
    }
  }, [eventInfo, showCard]);

  useEffect(() => {
    const handleEventInfoComplete = () => {
      setShowCard(true);
    };
    window.addEventListener("eventInfoComplete", handleEventInfoComplete);
    return () => {
      window.removeEventListener("eventInfoComplete", handleEventInfoComplete);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 1 && !hasAskedQuestion) {
      setHasAskedQuestion(true);
    }
  }, [messages, hasAskedQuestion]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagesEndRef]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText("");

    if (message.toLowerCase().includes("create") && showCard) {
      handleCreateEvent();
      return;
    }

    addUserMessage(message);
    await processMessage(message, chatState, (eventId) => {
      if (eventId) {
        setTimeout(() => {
          window.location.href = `/event/${eventId}`;
        }, 2000);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateEvent = async () => {
    if (!eventInfo || !hasRequiredInfo(eventInfo)) {
      addBotMessage("I need more information before creating the event.");
      return;
    }

    addBotMessage("Creating your event...");
    await createEventFromInfo(eventInfo, addBotMessage, (eventId) => {
      if (eventId) {
        setTimeout(() => {
          window.location.href = `/event/${eventId}`;
        }, 2000);
      }
    });
  };

  const handleConfirmEvent = () => {
    handleCreateEvent();
    setShowCard(false);
  };

  const handleCancelEvent = () => {
    setShowCard(false);
    addBotMessage("Event creation cancelled. How can I help you modify the details?");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Clean Header */}
      <div className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Schedule Your Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tell me about your event and I'll help you organize it
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Chat Messages */}
        <div className="space-y-4 mb-8">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.eventLink && (
                  <a
                    href={`/event/${msg.eventLink}`}
                    className="inline-flex items-center gap-1 mt-2 text-sm underline hover:no-underline"
                  >
                    Open Event <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Event Confirmation Card */}
        {showCard && eventInfo && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <EventSummaryCard
              eventInfo={eventInfo}
              onConfirm={handleConfirmEvent}
              onCancel={handleCancelEvent}
            />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              ref={textareaRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !hasAskedQuestion
                  ? "Describe your event (e.g., 'Team lunch next Friday 12-2pm')"
                  : "Type your message..."
              }
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeSimple;