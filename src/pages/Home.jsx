// src/pages/Home.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FlockLogo from "../components/SVGs/logos/FlockLogo";
import { ArrowUpRight } from "lucide-react";
import "../App.css";
import "../components/Chatbot/Chatbot.css";
import PabloWave from "../components/SVGs/Pablo/PabloWave";
import { useChatState } from "../components/Chatbot/hooks/useChatState";
import {
  processMessage,
  createEventFromInfo,
} from "../components/Chatbot/controllers/chatController";
import {
  REQUIRED_INFO,
  hasRequiredInfo,
} from "../components/Chatbot/utils/eventUtils";
import bgBlob from "../assets/images/background-image.png"; // make sure this path is correct
import EventSummaryCard from "../components/EventSummaryCard";
import { formatDateDisplay } from '../utils/dateUtils';

function Home() {
  // Initialize chat state with the useChatState hook
  const chatState = useChatState();
  const {
    messages,
    input: inputText,
    isLoading,
    eventInfo,
    messagesEndRef,
    setInput: setInputText,
    setEventInfo,
    addUserMessage,
    addBotMessage,
    setLoadingState,
  } = chatState;

  // State to track if we should show the confirmation card
  const [showCard, setShowCard] = useState(false);

  // State to track if the user has asked a question (to show chatbot UI)
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);

  const textareaRef = useRef(null);

  // For debugging - log when event info changes
  useEffect(() => {
    console.log("Current eventInfo:", eventInfo);
    console.log("Has required info:", hasRequiredInfo(eventInfo));

    // Show the card when we have all required info
    if (hasRequiredInfo(eventInfo) && !showCard) {
      console.log("All required info collected, showing card", eventInfo);
      setShowCard(true);
    }
  }, [eventInfo, showCard]);

  // Listen for the custom event that signals all event info is complete
  useEffect(() => {
    const handleEventInfoComplete = () => {
      console.log("Event info complete event received!");
      setShowCard(true);
    };

    // Add event listener
    window.addEventListener("eventInfoComplete", handleEventInfoComplete);

    // Cleanup
    return () => {
      window.removeEventListener("eventInfoComplete", handleEventInfoComplete);
    };
  }, []);

  // Track when user has asked a question
  useEffect(() => {
    if (messages.length > 1 && !hasAskedQuestion) {
      setHasAskedQuestion(true);
    }
  }, [messages, hasAskedQuestion]);

  // Scroll to bottom on new message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message to AI
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText("");

    // Check if this is a "create event" confirmation
    if (message.toLowerCase().includes("create") && showCard) {
      handleCreateEvent();
      return;
    }

    // Add user message
    addUserMessage(message);

    // Process the message with the chat controller
    await processMessage(message, chatState, (eventId) => {
      // Only reset after explicit creation via card button
      if (eventId) {
        setEventInfo(REQUIRED_INFO);
        setShowCard(false);
      }
    });
  };

  // Handle creating an event directly via the card button
  const handleCreateEvent = async () => {
    // Hide the confirmation card
    setShowCard(false);

    // Format date and time for the message
    const formattedDate = getFormattedDateRange();
    const formattedTime = getFormattedTimeRange();

    // Show confirmation message
    addBotMessage(
      `All set! I will create the ${eventInfo.name} event for ${formattedDate}, with ${formattedTime}.`
    );

    // Create the event directly using the event info
    await createEventFromInfo(
      eventInfo,
      addBotMessage,
      (eventId) => {
        // Reset event info after creation
        setEventInfo(REQUIRED_INFO);

        // Navigate to the event page
        if (eventId) {
          const eventUrl = `/event/${eventId}`;
          console.log("Navigating to event:", eventUrl);
          window.location.href = eventUrl;
        }
      },
      new Date()
    );
  };

  // Enter key handler
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // inline style for the blob
  const blobStyle = {
    position: "absolute",
    top: "0%",
    left: "0%",
    width: "100%",
    height: "100%",
    backgroundImage: `url(${bgBlob})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center bottom",
    backgroundSize: "contain",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
  };

  // Format date range for display
  const getFormattedDateRange = () => {
    if (!eventInfo.dateRange) return "";
    if (
      typeof eventInfo.dateRange === "object" &&
      eventInfo.dateRange.start &&
      eventInfo.dateRange.end
    ) {
      return `${formatDateDisplay(eventInfo.dateRange.start)} - ${formatDateDisplay(eventInfo.dateRange.end)}`;
    }
    return eventInfo.dateRange;
  };

  // Format time range for display
  const getFormattedTimeRange = () => {
    if (!eventInfo.timesThatWork) return "Flexible timing";

    // Handle if timesThatWork is an object with start and end properties
    if (
      typeof eventInfo.timesThatWork === "object" &&
      eventInfo.timesThatWork.start &&
      eventInfo.timesThatWork.end
    ) {
      return `${eventInfo.timesThatWork.start} to ${eventInfo.timesThatWork.end}`;
    }

    // Handle if timesThatWork is already a string
    return eventInfo.timesThatWork;
  };

  // Find the latest bot message with an eventId
  const joinEventMessage = useMemo(() => {
    return messages
      .filter((msg) => msg.sender === "bot" && msg.eventId)
      .slice(-1)[0];
  }, [messages]);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      {/* ——— the blob behind everything ——— */}
      <div style={blobStyle} aria-hidden="true" />

      {/* ——— your hero content ——— */}
      <main className="relative z-0 flex flex-col items-center justify-center flex-1 px-6 -mt-10">
        <div className="flex flex-col items-center gap-9">
          {/* Show hero only if no user questions yet */}
          {!hasAskedQuestion ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex items-center space-x-8">
                  <PabloWave className="w-14 h-14 -rotate-12" />
                  <h1 className="text-5xl font-medium text-center text-black font-display dark:text-white">
                    Events take flight on{" "}
                    <span className="font-bold text-primary">Flock</span>
                  </h1>
                  <PabloWave className="transform w-14 h-14 -scale-x-100 rotate-12" />
                </div>
                <p className="text-lg font-medium text-center text-secondary">
                  Create or join a flock without all the hassle.
                </p>
              </div>
              {/* Original hero input box */}
              <div className="w-full min-w-[350px]">
                <div className="flex flex-col w-full min-w-[350px] gap-2 p-2 border bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark rounded-2xl focus-within:ring-1 focus-within:border-onSurface dark:focus-within:border-onSurface-dark">
                  <textarea
                    ref={textareaRef}
                    value={inputText || ""}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full overflow-y-auto custom-scrollbar bg-surfaceContainer dark:bg-surfaceContainer-dark p-2 text-onSurface resize-none focus:outline-none max-h-[150px]"
                    rows={3}
                    placeholder="Describe the event you are trying to schedule or copy and paste your code!"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSend}
                      className={`p-1 rounded-xl ${
                        inputText.trim()
                          ? "bg-primary dark:bg-primary-dark text-onPrimary dark:text-onPrimary-dark"
                          : "bg-border dark:bg-border-dark text-secondary"
                      }`}
                    >
                      <ArrowUpRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Chat area replaces hero when user has asked a question
            <div className="w-full max-w-xl min-w-[850px] mx-auto flex flex-col h-[70vh] relative">
              <div className="flex flex-col flex-1 h-0 gap-4 overflow-y-auto bg-transparent">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[70%] min-w-[50px] px-3 py-3 rounded-[20px] whitespace-pre-line text-base font-medium
                      ${msg.sender === "user"
                        ? "self-end bg-surfaceContainer border border-border dark:border-border-dark dark:bg-surfaceContainer-dark text-onSurface dark:text-onSurface-dark"
                        : "self-start  text-onSurface"}
                    `}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Confirmation card and button */}
              {showCard && (
                <div className="flex flex-col items-start w-full my-4">
                  <EventSummaryCard eventInfo={eventInfo} onCreate={handleCreateEvent} />
                </div>
              )}
              {joinEventMessage && (
                <div className="flex flex-col items-start w-full my-4">
                  <div className="bg-surfaceContainer dark:bg-surfaceContainer-dark rounded-xl p-4 border border-border dark:border-border-dark shadow">
                    <div className="mb-2 font-semibold text-lg text-onSurface dark:text-onSurface-dark">
                      {joinEventMessage.text}
                    </div>
                    <button
                      onClick={() => window.location.href = `/event/${joinEventMessage.eventId}`}
                      className="px-6 py-2 bg-primary text-white rounded-xl shadow font-bold hover:bg-primary-dark transition"
                    >
                      Join Event
                    </button>
                  </div>
                </div>
              )}
              {/* Chat input at the bottom */}
              <div className="fixed z-20 flex flex-col w-full gap-1 p-2 mt-2 -translate-x-1/2 border bg-surfaceContainer dark:bg-surfaceContainer-dark max-w-[40%] border-border dark:border-border-dark rounded-2xl focus-within:ring-1 focus-within:border-onSurface dark:focus-within:border-onSurface-dark bottom-8 left-1/2">
                <textarea
                  ref={textareaRef}
                  value={inputText || ""}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full overflow-y-auto custom-scrollbar bg-surfaceContainer dark:bg-surfaceContainer-dark p-2 text-onSurface resize-none focus:outline-none max-h-[50px]"
                  rows={2}
                  placeholder="Describe the event you are trying to schedule or copy and paste your code!"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSend}
                    className={`p-1 rounded-xl ${
                      inputText.trim()
                        ? "bg-primary dark:bg-primary-dark text-onPrimary dark:text-onPrimary-dark"
                        : "bg-border dark:bg-border-dark text-secondary"
                    }`}
                  >
                    <ArrowUpRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
