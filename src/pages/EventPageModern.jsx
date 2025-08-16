import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { parseDateUTC, formatDateShort } from "../utils/dateUtils";
import { Calendar, Clock, Users, Copy, Check, Edit3, Save, ChevronLeft, ChevronRight, User } from "lucide-react";
import { cn } from "../lib/utils";

function getAccessCode(id) {
  return id.slice(0, 6).toUpperCase();
}

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

const EventPageModern = () => {
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

  const getHeatMapColor = (percentage) => {
    if (percentage === 0) return "";
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

  const handleCopyCode = async () => {
    const code = getAccessCode(id);
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleCopyLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!isValidConvexId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Event ID</CardTitle>
            <CardDescription>
              This appears to be an old event ID from Supabase.
              Please create a new event using the chatbot.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  // Generate times if not provided
  let eventTimes = event.times;
  if (!Array.isArray(eventTimes) || !eventTimes.length) {
    if (event.date_range && event.date_range.start && event.date_range.end) {
      eventTimes = [];
      let current = parseDateUTC(event.date_range.start);
      const last = parseDateUTC(event.date_range.end);
      while (current <= last) {
        for (let hour = 0; hour < 24; hour++) {
          const iso = `${current.getUTCFullYear()}-${pad(
            current.getUTCMonth() + 1
          )}-${pad(current.getUTCDate())}T${pad(hour)}:00:00`;
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
  const allTimes = Array.from(
    new Set(
      Object.values(timesByDate)
        .flat()
        .map((iso) => iso.split("T")[1].slice(0, 5))
    )
  ).sort();

  const visibleDates = allDates.slice(weekStartIdx, weekStartIdx + 7);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2 text-white">
                  {event.name || "Event"}
                </CardTitle>
                <CardDescription className="text-blue-100 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDateShort(event.date_range.start)} - {formatDateShort(event.date_range.end)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {responses.length} participants
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">Copy Link</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* User Input */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    submitted && !editMode 
                      ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" 
                      : "bg-white dark:bg-gray-900"
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={submitted && !editMode}
                />
              </div>
              <Button
                onClick={() => {
                  if (!submitted) {
                    handleSave();
                  } else if (!editMode) {
                    setEditMode(true);
                  } else {
                    handleSave();
                  }
                }}
                className={cn(
                  "px-6",
                  !submitted || editMode
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    : "bg-gray-500 hover:bg-gray-600"
                )}
              >
                {!submitted ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Availability
                  </>
                ) : editMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Availability Grid */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Select Your Availability</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setWeekStartIdx(Math.max(0, weekStartIdx - 7))}
                  disabled={weekStartIdx === 0}
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 font-medium">
                  Week of {visibleDates[0] && formatDateShort(visibleDates[0])}
                </span>
                <Button
                  onClick={() => setWeekStartIdx(Math.min(allDates.length - 7, weekStartIdx + 7))}
                  disabled={weekStartIdx + 7 >= allDates.length}
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-20 text-left text-sm font-medium text-gray-500"></th>
                    {visibleDates.map((date) => (
                      <th key={date} className="px-1 pb-4 text-center min-w-[80px]">
                        <div className="font-semibold">{formatDateShort(date)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTimes.map((time) => (
                    <tr key={time}>
                      <td className="py-1 pr-4 text-sm text-gray-500 text-right">
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
                          <td key={date + time} className="p-1">
                            <div
                              className={cn(
                                "h-8 rounded cursor-pointer transition-all relative group",
                                "border border-gray-200 dark:border-gray-700",
                                !submitted || editMode
                                  ? isSelected
                                    ? "bg-blue-500 dark:bg-blue-600 border-blue-600"
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  : getHeatMapColor(slotInfo.percentage),
                                hoveredSlot === key && "ring-2 ring-blue-400"
                              )}
                              onMouseEnter={() => setHoveredSlot(key)}
                              onMouseLeave={() => setHoveredSlot(null)}
                              onMouseDown={() => {
                                if (submitted && !editMode) return;
                                setIsDragging(true);
                                setDragMode(selected[key] ? "deselect" : "select");
                                setSelected((prev) => ({
                                  ...prev,
                                  [key]: !selected[key],
                                }));
                              }}
                              onMouseEnter={() => {
                                if (!isDragging || (submitted && !editMode)) return;
                                setSelected((prev) => ({
                                  ...prev,
                                  [key]: dragMode === "select",
                                }));
                              }}
                            >
                              {submitted && !editMode && slotInfo.count > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                  {slotInfo.count}
                                </div>
                              )}
                              {hoveredSlot === key && slotInfo.users.length > 0 && (
                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                  {slotInfo.users.join(", ")}
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
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Your availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Some available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>Most available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPageModern;