import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { parseDateUTC, formatDateShort } from "../utils/dateUtils";
import { Calendar, Users, Check, Edit2, ChevronLeft, ChevronRight, Copy, User } from "lucide-react";

function formatTimeAMPM(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

const EventPageClean = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({});
  const [weekStartIdx, setWeekStartIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Check if this is a valid Convex ID
  const isValidConvexId = id && id.length > 20 && /^[a-z0-9]+$/.test(id);
  
  // Convex queries and mutations
  const event = useQuery(
    api.events.getEvent, 
    isValidConvexId ? { id } : "skip"
  );
  const responses = useQuery(
    api.responses.getResponsesByEvent, 
    isValidConvexId ? { event_id: id } : "skip"
  ) || [];
  const upsertResponse = useMutation(api.responses.upsertResponse);

  // Load previous response from localStorage
  useEffect(() => {
    if (id) {
      const storedResponse = localStorage.getItem(`event_response_${id}`);
      if (storedResponse) {
        const { name: storedName, availability, submitted: wasSubmitted } = JSON.parse(storedResponse);
        setName(storedName);
        setSelected(availability.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        setSubmitted(wasSubmitted);
      }
    }
  }, [id]);

  // Calculate availability info
  const getSlotInfo = (iso) => {
    if (!iso) return { count: 0, users: [], percentage: 0 };
    const availableUsers = responses.filter(
      (resp) => resp.availability && resp.availability.includes(iso)
    );
    return {
      count: availableUsers.length,
      users: availableUsers.map((u) => u.name),
      percentage: responses.length > 0 ? availableUsers.length / responses.length : 0,
    };
  };

  // Heat map colors
  const getHeatMapColor = (percentage, isSelected) => {
    if (!submitted || editMode) {
      return isSelected ? "bg-blue-500 shadow-inner" : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700";
    }
    if (percentage === 0) return "bg-gray-50 dark:bg-gray-800";
    if (percentage <= 0.25) return "bg-green-100 dark:bg-green-900/30";
    if (percentage <= 0.5) return "bg-green-200 dark:bg-green-800/40";
    if (percentage <= 0.75) return "bg-green-300 dark:bg-green-700/50";
    return "bg-green-400 dark:bg-green-600/60";
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    const availability = Object.entries(selected)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    try {
      await upsertResponse({ event_id: id, name, availability });
      setSubmitted(true);
      setEditMode(false);
      localStorage.setItem(
        `event_response_${id}`,
        JSON.stringify({ name, availability, submitted: true, timestamp: new Date().toISOString() })
      );
    } catch (error) {
      console.error("Error saving response:", error);
      alert("Error saving response!");
    }
  };

  if (!isValidConvexId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Event ID</h2>
          <p className="text-gray-600 dark:text-gray-300">Please create a new event using the chatbot.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    );
  }

  // Generate times
  let eventTimes = event.times;
  if (!Array.isArray(eventTimes) || !eventTimes.length) {
    if (event.date_range && event.date_range.start && event.date_range.end) {
      eventTimes = [];
      let current = parseDateUTC(event.date_range.start);
      const last = parseDateUTC(event.date_range.end);
      while (current <= last) {
        for (let hour = 0; hour < 24; hour++) {
          const iso = `${current.getUTCFullYear()}-${pad(current.getUTCMonth() + 1)}-${pad(current.getUTCDate())}T${pad(hour)}:00:00`;
          eventTimes.push(iso);
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      eventTimes = [];
    }
  }

  const timesByDate = (eventTimes || []).reduce((acc, iso) => {
    const [date] = iso.split("T");
    if (!acc[date]) acc[date] = [];
    acc[date].push(iso);
    return acc;
  }, {});
  
  const allDates = Object.keys(timesByDate).sort();
  const visibleDates = allDates.slice(weekStartIdx, weekStartIdx + 7);
  const allTimes = Array.from(
    new Set(Object.values(timesByDate).flat().map((iso) => iso.split("T")[1].slice(0, 5)))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {event.name || "Event"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateShort(event.date_range.start)} - {formatDateShort(event.date_range.end)}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {responses.length} {responses.length === 1 ? "participant" : "participants"}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copySuccess ? "Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* Name Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4" />
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={submitted && !editMode}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
            <button
              onClick={() => {
                if (!submitted) handleSave();
                else if (!editMode) setEditMode(true);
                else handleSave();
              }}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 ${
                !submitted || editMode
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              {!submitted ? (
                <>
                  <Check className="h-4 w-4" />
                  Save Availability
                </>
              ) : editMode ? (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Availability Grid Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Your Availability
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekStartIdx(Math.max(0, weekStartIdx - 7))}
                disabled={weekStartIdx === 0}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                Week of {visibleDates[0] && formatDateShort(visibleDates[0])}
              </span>
              <button
                onClick={() => setWeekStartIdx(Math.min(allDates.length - 7, weekStartIdx + 7))}
                disabled={weekStartIdx + 7 >= allDates.length}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-20"></th>
                  {visibleDates.map((date) => (
                    <th key={date} className="px-1 pb-3 text-center">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDateShort(date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTimes.map((time) => (
                  <tr key={time}>
                    <td className="py-1 pr-3 text-xs font-medium text-right text-gray-500 dark:text-gray-400">
                      {formatTimeAMPM(`2020-01-01T${time}`)}
                    </td>
                    {visibleDates.map((date) => {
                      const iso = (timesByDate[date] || []).find(
                        (iso) => iso.split("T")[1].slice(0, 5) === time
                      );
                      const key = iso;
                      const slotInfo = getSlotInfo(iso);
                      const isSelected = selected[key];
                      
                      return (
                        <td key={date + time} className="p-0.5">
                          <div
                            className={`h-8 rounded-lg cursor-pointer transition-all duration-200 relative group ${
                              getHeatMapColor(slotInfo.percentage, isSelected)
                            } ${hoveredSlot === key ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
                            onMouseEnter={() => setHoveredSlot(key)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            onMouseDown={() => {
                              if (submitted && !editMode) return;
                              setIsDragging(true);
                              setDragMode(selected[key] ? "deselect" : "select");
                              setSelected((prev) => ({ ...prev, [key]: !selected[key] }));
                            }}
                            onMouseEnter={() => {
                              if (!isDragging || (submitted && !editMode)) return;
                              setSelected((prev) => ({ ...prev, [key]: dragMode === "select" }));
                            }}
                          >
                            {submitted && !editMode && slotInfo.count > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                {slotInfo.count}
                              </div>
                            )}
                            {hoveredSlot === key && slotInfo.users.length > 0 && (
                              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                                <div className="font-medium mb-1">Available:</div>
                                {slotInfo.users.join(", ")}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Your selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Some available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Most available</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EventPageClean;