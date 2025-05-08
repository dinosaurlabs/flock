import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "../components/Typography/Typography";
import Button from "../components/Button/Button";
import { supabase } from "../supabaseClient";

const HOURS = [
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
];

function getDatesInRange(start, end) {
  // Handle undefined or null start/end dates
  if (!start || !end) {
    const today = new Date().toISOString().split("T")[0];
    start = start || today;
    end = end || today;
    console.warn("Missing start or end date, using defaults:", { start, end });
  }

  const dates = [];
  let current = new Date(start);
  const last = new Date(end);

  // Handle invalid date parsing
  if (isNaN(current.getTime()) || isNaN(last.getTime())) {
    console.error("Invalid date format:", { start, end });
    // Return a single day (today) for invalid dates
    const today = new Date();
    return [today];
  }

  // Ensure end date is not before start date
  if (last < current) {
    console.warn("End date is before start date, swapping dates");
    [current, last] = [last, current];
  }

  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getAccessCode(id) {
  // Simple deterministic code for demo
  return id.slice(0, 6).toUpperCase();
}

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({}); // { '2024-06-01_8': true }
  const [weekStartIdx, setWeekStartIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

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
  const getSlotInfo = (date, hourIdx) => {
    const key = `${date.toISOString().split("T")[0]}_${hourIdx}`;
    const availableUsers = responses.filter(
      (resp) => resp.availability && resp.availability.includes(key)
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

        // Parse times_that_work from JSON string if it's a string
        if (
          eventData.times_that_work &&
          typeof eventData.times_that_work === "string"
        ) {
          try {
            eventData.times_that_work = JSON.parse(eventData.times_that_work);
          } catch (e) {
            console.error("Error parsing times_that_work:", e);
            eventData.times_that_work = [];
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

  const allDates = getDatesInRange(
    event.date_range.start,
    event.date_range.end
  );
  const weekDates = allDates.slice(weekStartIdx, weekStartIdx + 7);

  const handleCellClick = (date, hourIdx) => {
    const key = `${date.toISOString().split("T")[0]}_${hourIdx}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter your name.");
    const availability = Object.entries(selected)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    // Save to Supabase
    const { error } = await supabase.from("responses").insert([
      {
        event_id: id,
        name,
        availability,
      },
    ]);

    if (!error) {
      setSubmitted(true);
      // Save to localStorage
      localStorage.setItem(
        `event_response_${id}`,
        JSON.stringify({
          name,
          availability,
          submitted: true,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      alert("Error saving response!");
    }
  };

  const handleClearResponse = () => {
    if (window.confirm("Are you sure you want to clear your response?")) {
      localStorage.removeItem(`event_response_${id}`);
      setName("");
      setSelected({});
      setSubmitted(false);
    }
  };

  const handlePrevWeek = () => {
    setWeekStartIdx((idx) => Math.max(0, idx - 7));
  };
  const handleNextWeek = () => {
    setWeekStartIdx((idx) => Math.min(allDates.length - 7, idx + 7));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f8fa] py-12">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 w-full max-w-3xl border border-[#e5e7eb] flex flex-col gap-6">
        <div className="flex justify-between items-center mb-2">
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
            } text-white transition-colors duration-200`}
          />
        </div>
        <Typography textStyle="body-lg" className="mb-2">
          {allDates && allDates.length > 0 ? (
            <>
              {allDates[0].toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {" - "}
              {allDates[allDates.length - 1].toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </>
          ) : (
            "Date range not available"
          )}
        </Typography>
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <label className="block font-semibold mb-1">Name:</label>
            {submitted && (
              <Button
                text="Clear Response"
                buttonSize="sm"
                onClick={handleClearResponse}
                className="text-red-500 hover:text-red-600"
              />
            )}
          </div>
          <input
            className="w-full p-3 rounded-md border border-[#e5e7eb] bg-[#f6f8fa] dark:bg-surfaceContainer-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={submitted}
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold mb-1">
            Select Availability:
          </label>
          <div className="flex items-center gap-2 mb-2">
            <Button
              text="<"
              buttonSize="sm"
              onClick={handlePrevWeek}
              disabled={
                weekStartIdx === 0 || !weekDates || weekDates.length === 0
              }
            />
            <span className="font-semibold">
              {weekDates && weekDates.length > 0 ? (
                <>
                  {weekDates[0].toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {" - "}
                  {weekDates[weekDates.length - 1].toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </>
              ) : (
                "Week not available"
              )}
            </span>
            <Button
              text=">"
              buttonSize="sm"
              onClick={handleNextWeek}
              disabled={
                !weekDates ||
                weekDates.length === 0 ||
                weekStartIdx + 7 >= allDates.length
              }
            />
            <span className="ml-auto text-blue-500 cursor-pointer hover:underline">
              + Add Google Calendar
            </span>
            <Button
              text="SAVE AVAILABILITY"
              buttonSize="sm"
              onClick={handleSave}
              className="bg-blue-500 text-white"
              disabled={submitted}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20"></th>
                  {weekDates && weekDates.length > 0 ? (
                    weekDates.map((date) => (
                      <th
                        key={date.toISOString()}
                        className="text-center px-2 pb-2 font-semibold"
                      >
                        <div>
                          {date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {date
                            .toLocaleString("en-US", { weekday: "short" })
                            .toUpperCase()}
                        </div>
                      </th>
                    ))
                  ) : (
                    <th className="text-center px-2 pb-2">
                      No dates available
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour, hourIdx) => (
                  <tr key={hour}>
                    <td className="text-right pr-2 text-sm text-gray-500 font-medium">
                      {hour}
                    </td>
                    {weekDates && weekDates.length > 0 ? (
                      weekDates.map((date) => {
                        const key = `${
                          date.toISOString().split("T")[0]
                        }_${hourIdx}`;
                        const slotInfo = getSlotInfo(date, hourIdx);
                        const tooltipText =
                          slotInfo.users.length > 0
                            ? `Available: ${slotInfo.users.join(", ")}`
                            : "No one available";

                        return (
                          <td
                            key={key}
                            className={`border border-[#e5e7eb] w-12 h-8 cursor-pointer relative group
                              ${
                                submitted
                                  ? getHeatMapColor(slotInfo.percentage)
                                  : selected[key]
                                  ? "bg-blue-200"
                                  : "bg-white dark:bg-surfaceContainer-dark"
                              }`}
                            onClick={() =>
                              !submitted && handleCellClick(date, hourIdx)
                            }
                          >
                            {submitted && slotInfo.count > 0 && (
                              <span className="absolute text-xs text-center w-full">
                                {slotInfo.count}
                              </span>
                            )}
                            <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 left-1/2 transform -translate-x-1/2 -top-8 whitespace-nowrap">
                              {tooltipText}
                            </div>
                          </td>
                        );
                      })
                    ) : (
                      <td className="text-center border border-[#e5e7eb]">-</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <Typography textStyle="heading-md">Group Availability</Typography>
          {responses.length === 0 ? (
            <Typography textStyle="body-md" color="secondary">
              No responses yet.
            </Typography>
          ) : (
            <table className="w-full mt-4 border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Name</th>
                  {allDates.map((date) => (
                    <th key={date} className="border-b p-2 text-center">
                      {date.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((resp, idx) => (
                  <tr key={idx}>
                    <td className="border-b p-2">{resp.name}</td>
                    {allDates.map((date) => (
                      <td key={date} className="border-b p-2 text-center">
                        {resp.availability &&
                        resp.availability.some((slot) =>
                          slot.startsWith(date.toISOString().split("T")[0])
                        )
                          ? "✅"
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPage;
