import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "../components/Typography/Typography";
import Button from "../components/Button/Button";
import { supabase } from "../supabaseClient";
import { parseDateUTC, formatDateShort } from "../utils/dateUtils";
import bgBlob from "../assets/images/background-image.png";

function getAccessCode(id) {
  // Simple deterministic code for demo
  return id.slice(0, 6).toUpperCase();
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

const blobStyle = {
  position: "absolute",
  top: "0%",
  left: "0%",
  width: "100%",
  height: "100%",
  opacity: 0.5,
  backgroundImage: `url(${bgBlob})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center bottom",
  backgroundSize: "contain",
  pointerEvents: "none",
  userSelect: "none",
  zIndex: 0,
};

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({}); // { '2024-06-01_8': true }
  const [weekStartIdx, setWeekStartIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'
  const [editMode, setEditMode] = useState(false);

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

  // Fetch event and responses from Supabase
  useEffect(() => {
    async function fetchData() {
      // Fetch event
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventData) {
        // Parse date_range from JSON string if it's a string
        if (eventData.date_range && typeof eventData.date_range === "string") {
          try {
            eventData.date_range = JSON.parse(eventData.date_range);
          } catch (e) {
            console.error("Error parsing date_range:", e);
            // Provide a fallback date range
            eventData.date_range = {
              start: new Date().toISOString().split("T")[0],
              end: new Date().toISOString().split("T")[0],
            };
          }
        }

        // Parse times from JSON string if it's a string
        if (eventData.times && typeof eventData.times === "string") {
          try {
            eventData.times = JSON.parse(eventData.times);
          } catch (e) {
            console.error("Error parsing times:", e);
            eventData.times = [];
          }
        }
      }
      setEvent(eventData);

      // Fetch responses
      const { data: respData } = await supabase
        .from("responses")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: true });
      setResponses(respData || []);
    }
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel("responses")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `event_id=eq.${id}`,
        },
        (payload) => {
          setResponses((prev) => [...prev, payload.new]);

          // If this is the current user's response, update localStorage
          const storedResponse = localStorage.getItem(`event_response_${id}`);
          if (storedResponse) {
            const { name: storedName } = JSON.parse(storedResponse);
            if (storedName === payload.new.name) {
              localStorage.setItem(
                `event_response_${id}`,
                JSON.stringify({
                  name: payload.new.name,
                  availability: payload.new.availability,
                  submitted: true,
                  timestamp: new Date().toISOString(),
                })
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

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
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (!event) {
    return <div className="p-8">Event not found.</div>;
  }

  // If event.times is null or empty, generate 24-hour times for the date range
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

  // Group times by date
  const timesByDate = (eventTimes || []).reduce((acc, iso) => {
    const [date] = iso.split("T");
    if (!acc[date]) acc[date] = [];
    acc[date].push(iso);
    return acc;
  }, {});
  const allDates = Object.keys(timesByDate).sort();
  // Get all unique times (HH:MM) across all dates
  const allTimes = Array.from(
    new Set(
      Object.values(timesByDate)
        .flat()
        .map((iso) => iso.split("T")[1].slice(0, 5))
    )
  ).sort();

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter your name.");
    const availability = Object.entries(selected)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    // Check if a response from this user already exists
    const { data: existing } = await supabase
      .from("responses")
      .select("id")
      .eq("event_id", id)
      .eq("name", name)
      .single();

    if (existing && existing.id) {
      // Update existing response
      const { error } = await supabase
        .from("responses")
        .update({ availability })
        .eq("id", existing.id);
      if (!error) {
        setSubmitted(true);
        setEditMode(false);
        setSelected(
          availability.reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        localStorage.setItem(
          `event_response_${id}`,
          JSON.stringify({
            name,
            availability,
            submitted: true,
            timestamp: new Date().toISOString(),
          })
        );
        fetchResponses();
      } else {
        alert("Error updating response!");
      }
    } else {
      // Insert new response
      const { error } = await supabase.from("responses").insert([
        {
          event_id: id,
          name,
          availability,
        },
      ]);
      if (!error) {
        setSubmitted(true);
        setEditMode(false);
        setSelected(
          availability.reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        localStorage.setItem(
          `event_response_${id}`,
          JSON.stringify({
            name,
            availability,
            submitted: true,
            timestamp: new Date().toISOString(),
          })
        );
        fetchResponses();
      } else {
        alert("Error saving response!");
      }
    }
  };

  const handlePrevWeek = () => {
    setWeekStartIdx((idx) => Math.max(0, idx - 7));
  };
  const handleNextWeek = () => {
    setWeekStartIdx((idx) => Math.min(allDates.length - 7, idx + 7));
  };

  const fetchResponses = async () => {
    const { data: respData } = await supabase
      .from("responses")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: true });
    setResponses(respData || []);
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      <div style={blobStyle} aria-hidden="true" />
      <div className="absolute inset-0 z-10 flex items-center justify-center min-h-screen select-none">
        <div className="flex flex-col w-full max-w-3xl gap-6 p-8 border shadow-lg bg-surfaceContainer dark:bg-surfaceContainer rounded-2xl border-border dark:border-border-dark">
          <div className="flex items-center justify-between mb-2">
            <Typography textStyle="display-md" color="primary-light">
              Join {event.name || "Event"}
            </Typography>
            <Button
              text={copySuccess ? "Copied!" : "Copy Access Code"}
              buttonSize="sm"
              onClick={handleCopyCode}
              className={`${
                copySuccess
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-onPrimary dark:text-onPrimary-dark transition-colors duration-200`}
            />
          </div>
          <Typography
            textStyle="body-lg"
            className="mb-2 text-onSurface dark:text-onSurface-dark"
          >
            {event.date_range && event.date_range.start && event.date_range.end
              ? `${formatDateShort(event.date_range.start)} - ${formatDateShort(
                  event.date_range.end
                )}`
              : "Date range not available"}
          </Typography>
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <label className="block mb-1 font-semibold text-onSurface dark:text-onSurface-dark">
                Name:
              </label>
              {submitted && null}
            </div>
            <input
              className="w-full p-3 border rounded-md border-border dark:border-border-dark bg-surfaceContainer dark:bg-surfaceContainer-dark text-onSurface dark:text-onSurface-dark"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={submitted}
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-semibold text-onSurface dark:text-onSurface-dark">
              Save Availability:
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Button
                text="<"
                buttonSize="sm"
                onClick={handlePrevWeek}
                disabled={
                  weekStartIdx === 0 || !allDates || allDates.length === 0
                }
              />
              <span className="font-semibold text-onSurface dark:text-onSurface-dark">
                {event.date_range &&
                event.date_range.start &&
                event.date_range.end
                  ? `${formatDateShort(
                      event.date_range.start
                    )} - ${formatDateShort(event.date_range.end)}`
                  : "Week not available"}
              </span>
              <Button
                text=">"
                buttonSize="sm"
                onClick={handleNextWeek}
                disabled={
                  !allDates ||
                  allDates.length === 0 ||
                  weekStartIdx + 7 >= allDates.length
                }
              />
              <span className="ml-auto cursor-pointer text-primary dark:text-primary-dark hover:underline">
                + Add Google Calendar
              </span>
              <Button
                text={!submitted ? "SAVE" : editMode ? "SAVE" : "EDIT"}
                buttonSize="sm"
                onClick={() => {
                  if (!submitted) {
                    handleSave();
                  } else if (!editMode) {
                    setTimeout(() => setEditMode(true), 0);
                  } else {
                    handleSave();
                  }
                }}
                className="text-onPrimary dark:text-onPrimary-dark bg-primary dark:bg-primary-dark"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    {allDates.map((date) => (
                      <th
                        key={date}
                        className="px-2 pb-2 font-semibold text-center text-onSurface dark:text-onSurface-dark"
                      >
                        <div>{formatDateShort(date)}</div>
                        <div className="text-xs text-secondary dark:text-secondary-dark">
                          {new Date(date)
                            .toLocaleDateString("en-US", { weekday: "short" })
                            .toUpperCase()}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTimes.map((time) => (
                    <tr className="rounded-2xl" key={time}>
                      <td className="pr-2 text-sm font-medium text-right text-secondary dark:text-secondary-dark rounded-2xl">
                        {formatTimeAMPM(`2020-01-01T${time}`)}
                      </td>
                      {allDates.map((date) => {
                        // Find the ISO string for this date/time
                        const iso = (timesByDate[date] || []).find(
                          (iso) => iso.split("T")[1].slice(0, 5) === time
                        );
                        const key = iso;
                        const slotInfo = getSlotInfo(iso);
                        const tooltipText =
                          slotInfo.users.length > 0
                            ? `Available: ${slotInfo.users.join(", ")}`
                            : "No one available";
                        return (
                          <td
                            key={date + time}
                            className={`border border-border dark:border-border-dark w-12 h-8 cursor-pointer relative group
                              ${
                                !submitted || editMode
                                  ? selected[key]
                                    ? "bg-blue-200"
                                    : "bg-white dark:bg-surfaceContainer-dark"
                                  : getHeatMapColor(slotInfo.percentage)
                              }`}
                            onMouseDown={() => {
                              if (submitted && !editMode) return;
                              setIsDragging(true);
                              setDragMode(
                                selected[key] ? "deselect" : "select"
                              );
                              setSelected((prev) => ({
                                ...prev,
                                [key]: !selected[key],
                              }));
                            }}
                            onMouseEnter={() => {
                              if (!isDragging || (submitted && !editMode))
                                return;
                              setSelected((prev) => ({
                                ...prev,
                                [key]: dragMode === "select" ? true : false,
                              }));
                            }}
                            onMouseUp={() => {
                              setIsDragging(false);
                              setDragMode(null);
                            }}
                          >
                            <div className="absolute z-10 hidden px-2 py-1 text-xs transform -translate-x-1/2 rounded text-onPrimary dark:text-onPrimary-dark bg-primary dark:bg-primary-dark group-hover:block left-1/2 -top-8 whitespace-nowrap">
                              {tooltipText}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
