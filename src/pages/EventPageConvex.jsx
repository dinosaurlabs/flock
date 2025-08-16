import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { parseDateUTC, formatDateShort } from "../utils/dateUtils";

function getAccessCode(id) {
  // Generate 5-character access code from ID
  if (!id) return 'XXXXX';
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Use the ID to generate a consistent code
  for (let i = 0; i < 5; i++) {
    // Get character from ID, handle both hex and regular characters
    const char = id[i * 2] || id[i] || 'X';
    const charCode = char.charCodeAt(0);
    const index = charCode % chars.length;
    code += chars[index];
  }
  
  return code;
}

// Utility for formatting time in AM/PM
function formatTimeAMPM(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper to pad numbers
function pad(n) {
  return n.toString().padStart(2, "0");
}


const EventPageConvex = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({}); // { '2024-06-01_8': true }
  const [weekStartIdx, setWeekStartIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'
  const [editMode, setEditMode] = useState(false);

  // Check if this is a valid Convex ID (they start with 'j' and are longer)
  const isValidConvexId = id && id.length > 20 && /^[a-z0-9]+$/.test(id);
  
  // Convex queries and mutations - only run if we have a valid ID
  const event = useQuery(
    api.events.getEvent, 
    isValidConvexId ? { id } : "skip"
  );
  const responses = useQuery(
    api.responses.getResponsesByEvent, 
    isValidConvexId ? { event_id: id } : "skip"
  ) || [];
  const upsertResponse = useMutation(api.responses.upsertResponse);

  // Load user's previous response from localStorage
  useEffect(() => {
    if (id) {
      const storedResponse = localStorage.getItem(`event_response_${id}`);
      if (storedResponse) {
        const {
          name: storedName,
          availability,
          submitted: wasSubmitted,
        } = JSON.parse(storedResponse);
        setName(storedName);
        setSelected(
          availability.reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        setSubmitted(wasSubmitted);
      }
    }
  }, [id]);

  // Calculate availability counts for heat map
  const getSlotInfo = (iso) => {
    if (!iso) return { count: 0, users: [], percentage: 0 };
    const availableUsers = responses.filter(
      (resp) => resp.availability && resp.availability.includes(iso)
    );
    return {
      count: availableUsers.length,
      users: availableUsers.map((u) => u.name),
      percentage:
        responses.length > 0 ? availableUsers.length / responses.length : 0,
    };
  };

  // Get background color based on availability percentage
  const getHeatMapColor = (percentage) => {
    if (percentage === 0) return "bg-white dark:bg-surfaceContainer-dark";
    if (percentage <= 0.25) return "bg-blue-100";
    if (percentage <= 0.5) return "bg-blue-200";
    if (percentage <= 0.75) return "bg-blue-300";
    return "bg-blue-400";
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCopyCode = async () => {
    const code = event?.access_code || getAccessCode(id);
    try {
      await navigator.clipboard.writeText(code);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (!isValidConvexId) {
    return (
      <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Invalid Event ID</h2>
          <p className="text-gray-600">Please create a new event using the chatbot.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008dde]"></div>
          <p className="mt-2 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  // Generate appropriate time slots based on event configuration
  let eventTimes = event.times;
  
  // If event has specific times but they're not 15-minute intervals, regenerate
  if (Array.isArray(eventTimes) && eventTimes.length > 0) {
    // Check if we need to expand to 15-minute intervals
    const uniqueTimes = new Set(eventTimes.map(t => t.split("T")[1].slice(0, 5)));
    const needsExpansion = uniqueTimes.size < 20; // If less than 20 unique times, expand to 15-min intervals
    
    if (needsExpansion) {
      // Get the hour range from existing times
      const hours = eventTimes.map(t => parseInt(t.split("T")[1].slice(0, 2)));
      const startHour = Math.min(...hours);
      const endHour = Math.max(...hours) + 1;
      
      // Regenerate with 15-minute intervals for the detected hour range
      eventTimes = [];
      if (event.date_range && event.date_range.start && event.date_range.end) {
        let current = parseDateUTC(event.date_range.start);
        const last = parseDateUTC(event.date_range.end);
        while (current <= last) {
          for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
              const iso = `${current.getUTCFullYear()}-${pad(
                current.getUTCMonth() + 1
              )}-${pad(current.getUTCDate())}T${pad(hour)}:${pad(minute)}:00`;
              eventTimes.push(iso);
            }
          }
          current.setUTCDate(current.getUTCDate() + 1);
        }
      }
    }
  } else {
    // No times specified, use default 8 AM to 8 PM
    if (event.date_range && event.date_range.start && event.date_range.end) {
      eventTimes = [];
      let current = parseDateUTC(event.date_range.start);
      const last = parseDateUTC(event.date_range.end);
      while (current <= last) {
        // Generate times from 8 AM to 8 PM in 15-minute intervals
        for (let hour = 8; hour < 20; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const iso = `${current.getUTCFullYear()}-${pad(
              current.getUTCMonth() + 1
            )}-${pad(current.getUTCDate())}T${pad(hour)}:${pad(minute)}:00`;
            eventTimes.push(iso);
          }
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      eventTimes = [];
    }
  }

  // Group times by date
  const timesByDate = (eventTimes || []).reduce((acc, iso) => {
    const [date] = iso.split("T");
    if (!acc[date]) acc[date] = [];
    acc[date].push(iso);
    return acc;
  }, {});
  const allDates = Object.keys(timesByDate).sort();
  const visibleDates = allDates.slice(weekStartIdx, weekStartIdx + 7);
  
  // Get all unique times (HH:MM) across all dates
  const allTimes = Array.from(
    new Set(
      Object.values(timesByDate)
        .flat()
        .map((iso) => iso.split("T")[1].slice(0, 5))
    )
  ).sort();
  
  console.log("Event times from DB:", event.times);
  console.log("Generated event times:", eventTimes?.slice(0, 10));

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter your name.");
    const availability = Object.entries(selected)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    try {
      await upsertResponse({
        event_id: id,
        name,
        availability,
      });
      
      setSubmitted(true);
      setEditMode(false);
      localStorage.setItem(
        `event_response_${id}`,
        JSON.stringify({
          name,
          availability,
          submitted: true,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error saving response:", error);
      alert("Error saving response!");
    }
  };


  return (
    <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-[10px] p-8 shadow-sm"
        >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[48px] font-bold text-black mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Join Creators
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[16px] text-gray-600" style={{ fontFamily: 'Cabin, sans-serif' }}>Access Code:</span>
              <span className="text-[16px] font-bold text-[#008dde]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {event.access_code || getAccessCode(id)}
              </span>
              <button
                onClick={handleCopyCode}
                className="ml-2 px-3 py-1 text-xs bg-[#008dde] text-white rounded hover:bg-[#0077c2] transition-colors"
              >
                {showCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-[16px] font-medium text-gray-700 mb-2" style={{ fontFamily: 'Cabin, sans-serif' }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={submitted && !editMode}
            className="w-full p-3 bg-[#f5f8fa] rounded-[8px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008dde] focus:border-transparent transition-all disabled:opacity-50"
            style={{ fontFamily: 'Cabin, sans-serif' }}
          />
        </div>
        {/* Availability Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Select Your Availability
            </h2>
            <div className="flex items-center gap-2">
              {/* Week Navigation */}
              {allDates.length > 7 && (
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={() => setWeekStartIdx(Math.max(0, weekStartIdx - 7))}
                    disabled={weekStartIdx === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-600">
                    Week {Math.floor(weekStartIdx / 7) + 1} of {Math.ceil(allDates.length / 7)}
                  </span>
                  <button
                    onClick={() => setWeekStartIdx(Math.min(allDates.length - 7, weekStartIdx + 7))}
                    disabled={weekStartIdx + 7 >= allDates.length}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  if (!submitted) {
                    handleSave();
                  } else if (!editMode) {
                    setEditMode(true);
                  } else {
                    handleSave();
                  }
                }}
                className={`px-6 py-2 rounded-[8px] font-medium transition-all ${
                  !submitted || editMode
                    ? "bg-[#008dde] text-white hover:bg-[#0077c2]"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {!submitted ? "Save" : editMode ? "Save Changes" : "Edit"}
              </button>
            </div>
          </div>
          {/* Availability Grid */}
          <div className="overflow-x-auto">
            <div className="flex gap-2">
              {/* Time column */}
              <div className="flex flex-col pt-10 pr-2">
                {allTimes.map((time, index) => {
                  // Only show label for times on the hour
                  const showLabel = time.endsWith(':00');
                  return (
                    <div key={time} className="h-5 flex items-center justify-end">
                      {showLabel && (
                        <span className="text-[12px] text-[#6e6e6e] whitespace-nowrap" style={{ fontFamily: 'Cabin, sans-serif' }}>
                          {formatTimeAMPM(`2020-01-01T${time}`)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Date columns */}
              <div className="flex flex-1">
                {visibleDates.map((date, dateIndex) => {
                  const isFirstColumn = dateIndex === 0;
                  const isLastColumn = dateIndex === visibleDates.length - 1;
                  
                  return (
                    <div key={date} className="flex-1 flex flex-col gap-2">
                      {/* Date header */}
                      <div className="text-center">
                        <div className="text-[12px] text-[#6e6e6e]" style={{ fontFamily: 'Cabin, sans-serif' }}>
                          {formatDateShort(date)}
                        </div>
                        <div className="text-[16px] font-medium text-[#1b1b1b]" style={{ fontFamily: 'Cabin, sans-serif' }}>
                          {new Date(date).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Time slots */}
                      <div 
                        className={`flex flex-col border border-[#d2d2d2] ${
                          isFirstColumn ? 'rounded-l-[6px]' : ''
                        } ${
                          isLastColumn ? 'rounded-r-[6px]' : 'border-r-0'
                        }`}
                      >
                        {allTimes.map((time, timeIndex) => {
                          const iso = (timesByDate[date] || []).find(
                            (iso) => iso.split("T")[1].slice(0, 5) === time
                          );
                          const key = iso;
                          const slotInfo = getSlotInfo(iso);
                          const isSelected = selected[key];
                          
                          // Determine if this row should have dashed or solid border
                          const isDashedRow = timeIndex % 2 === 0;
                          
                          // Determine background color - always use blue for selections
                          let bgColor = "bg-[#f5f8fa]";
                          if (isSelected) {
                            bgColor = "bg-[#008dde] bg-opacity-20";
                          } else if (!submitted || editMode) {
                            bgColor = "bg-[#f5f8fa] hover:bg-gray-100";
                          }
                          
                          return (
                            <div
                              key={time}
                              className={`h-5 relative cursor-pointer transition-all duration-150 group ${bgColor} ${
                                timeIndex > 0 ? (isDashedRow ? 'border-t border-[#6e6e6e] border-dashed' : 'border-t border-[#d2d2d2]') : ''
                              }`}
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
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                                  {slotInfo.count}
                                </div>
                              )}
                              {slotInfo.users.length > 0 && (
                                <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                  {slotInfo.users.join(", ")}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          {submitted && !editMode && (
            <div className="flex gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#008dde] bg-opacity-20 rounded border border-gray-300"></div>
                <span className="text-gray-600" style={{ fontFamily: 'Cabin, sans-serif' }}>Available</span>
              </div>
              <div className="text-gray-600" style={{ fontFamily: 'Cabin, sans-serif' }}>
                {responses.length} {responses.length === 1 ? 'response' : 'responses'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPageConvex;