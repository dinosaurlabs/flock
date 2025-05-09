// src/pages/Home.jsx
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FlockLogo from "../components/SVGs/logos/FlockLogo";
import { ArrowUpRight } from "lucide-react";
import "../App.css";
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

    // Handle if dateRange is an object with start and end properties
    if (
      typeof eventInfo.dateRange === "object" &&
      eventInfo.dateRange.start &&
      eventInfo.dateRange.end
    ) {
      return `${eventInfo.dateRange.start} - ${eventInfo.dateRange.end}`;
    }

    // Handle if dateRange is already a string
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

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      {/* ——— the blob behind everything ——— */}
      <div style={blobStyle} aria-hidden="true" />

      {/* ——— your hero content ——— */}
      <main className="relative z-0 flex flex-col items-center justify-center flex-1 px-6 -mt-20">
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
            <div className="w-full max-w-xl min-w-[850px] mx-auto flex flex-col flex-1 h-[70vh] relative overflow-hidden">
              <div className="flex flex-col flex-1 gap-2 pb-32 overflow-y-auto bg-transparent">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl px-4 py-2 max-w-[80%] text-base whitespace-pre-line ${
                      msg.sender === "user"
                        ? "self-end bg-primary text-onPrimary"
                        : "self-start bg-surfaceContainer dark:bg-surfaceContainer-dark text-onSurface dark:text-onSurface-dark border border-border dark:border-border-dark"
                    }`}
                  >
                    {msg.text}

                    {/* Show Join button if the message has an eventId */}
                    {msg.eventId && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            (window.location.href = `/event/${msg.eventId}`)
                          }
                          className="flex items-center justify-center w-full px-4 py-3 font-medium text-center uppercase transition-colors rounded-full cursor-pointer bg-primary dark:bg-primary-dark text-onPrimary dark:text-onPrimary-dark hover:bg-primary/90 active:bg-primary/80"
                        >
                          <span className="mr-1">JOIN EVENT</span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 17L17 7M17 7H7M17 7V17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Show event summary card when all required info is available */}
                {showCard && hasRequiredInfo(eventInfo) && (
                  <div className="self-start w-full max-w-sm my-4 ml-4">
                    <EventSummaryCard
                      title={eventInfo.name || "Your Event"}
                      dateRange={getFormattedDateRange()}
                      timeRange={getFormattedTimeRange()}
                      onCreateClick={handleCreateEvent}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
              {/* Chat input at the bottom */}
              <div className="flex flex-col w-full gap-2 p-2 border bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark rounded-2xl focus-within:ring-1 focus-within:border-onSurface dark:focus-within:border-onSurface-dark mt-2 fixed bottom-8 left-1/2 -translate-x-1/2 max-w-xl min-w-[350px] z-20">
                <textarea
                  ref={textareaRef}
                  value={inputText || ""}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full overflow-y-auto custom-scrollbar bg-surfaceContainer dark:bg-surfaceContainer-dark p-2 text-onSurface resize-none focus:outline-none max-h-[100px]"
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
