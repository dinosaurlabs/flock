import React, { useState, useEffect } from "react";
import Button from "../components/Button/Button";
import Dropdown from "../components/Dropdown/Dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "../components/Typography/Typography";

const CreateFlock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const aiEvent =
    location.state?.aiEvent ||
    JSON.parse(localStorage.getItem("aiCreatedEvent") || "null");

  // Initialize with AI data if available
  const [flockName, setFlockName] = useState(aiEvent?.title || "");
  const [flockDescription, setFlockDescription] = useState(
    aiEvent?.description || ""
  );
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [hourAvailability, setHourAvailability] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDates, setSelectedDates] = useState(aiEvent?.dates || []);
  const [participantsCount, setParticipantsCount] = useState(
    aiEvent?.participants || 2
  );
  const [showAIBanner, setShowAIBanner] = useState(!!aiEvent);

  // Clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem("aiCreatedEvent");
    };
  }, []);

  const generateTimesThatWork = (dates, startTime, endTime, hourAvailability) => {
    const result = [];
    if (!dates.length) return result;
    dates.forEach(dateStr => {
      if (hourAvailability) {
        // 24 hour: 0 to 23
        for (let hour = 0; hour < 24; hour++) {
          const iso = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00Z`).toISOString();
          result.push(iso);
        }
      } else if (startTime && endTime) {
        // e.g. startTime = '00:00', endTime = '03:00' for 12am-3am
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = parseInt(endTime.split(':')[0], 10);
        for (let hour = startHour; hour < endHour; hour++) {
          const iso = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00Z`).toISOString();
          result.push(iso);
        }
      }
    });
    return result;
  };

  const handleSubmitFlockName = (e) => {
    e.preventDefault();
    const timesThatWork = generateTimesThatWork(selectedDates, startTime, endTime, hourAvailability);
    console.log({
      flockName,
      flockDescription,
      startTime,
      endTime,
      allowAnonymous,
      hourAvailability,
      selectedDates,
      participantsCount,
      times: timesThatWork,
    });
    // In a real app, you would save the flock and navigate to the next page
    alert("Flock created successfully!");
    // Navigate to a success page or back to home
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleRemoveDate = (index) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen flex flex-col gap-6 px-6 text-black pb-28 pt-28 bg-surface dark:bg-surface-dark dark:text-white">
      {showAIBanner && (
        <div className="w-full p-4 bg-primary-light bg-opacity-10 rounded-xl flex flex-col gap-2 mb-4">
          <Typography textStyle="heading-md" color="primary-light">
            AI-Generated Event
          </Typography>
          <Typography textStyle="body-md">
            This event was created from your conversation with our AI assistant.
            You can customize the details below.
          </Typography>
          <Button
            text="Dismiss"
            buttonSize="sm"
            color="secondary"
            onClick={() => setShowAIBanner(false)}
            className="self-end"
          />
        </div>
      )}

      <div className="flex justify-evenly space-x-16">
        <form onSubmit={handleSubmitFlockName} className="space-y-4 w-1/2">
          {/* Flock Name */}
          <div className="flex flex-col gap-3">
            <label className="font-sans title-sm">Flock Name:</label>
            <input
              type="text"
              placeholder="Flock Name"
              value={flockName}
              onChange={(e) => setFlockName(e.target.value)}
              className="p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
            />

            {/* Flock Description */}
            <label className="font-sans title-sm mt-4">Description:</label>
            <textarea
              placeholder="Describe your event"
              value={flockDescription}
              onChange={(e) => setFlockDescription(e.target.value)}
              className="p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark h-24"
            />

            {/* Allow Anonymous Attendees */}
            <div className="flex gap-3 mt-4">
              <label className="flex gap-3 text-secondary">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={() => setAllowAnonymous(!allowAnonymous)}
                  className="p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark w-5 h-5"
                />
                Allow anonymous attendees
              </label>
            </div>
          </div>

          {/* Selected Dates */}
          {selectedDates.length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              <label className="font-sans title-sm">AI-Suggested Dates:</label>
              <div className="flex flex-col gap-2">
                {selectedDates.map((date, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
                  >
                    <span>{formatDate(date)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(index)}
                      className="text-error"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Number of Participants */}
          <div className="flex flex-col gap-3 mt-4">
            <label className="font-sans title-sm">
              Number of Participants:
            </label>
            <input
              type="number"
              min="1"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(parseInt(e.target.value))}
              className="p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
            />
          </div>

          {/* Submit */}
          <Button type="submit" text="Create Your Flock" />
        </form>

        <div className="w-1/2">
          <form className="w-full">
            {/* Times that Work */}
            <div className="w-full flex flex-col w-full gap-3">
              <label className="font-sans title-sm">Times that work:</label>
              <div className="flex gap-3">
                <select
                  name="Start Time"
                  className="w-1/2 p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="" disabled>
                    Start Time
                  </option>
                  <option value="9:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
                <select
                  name="End Time"
                  className="w-1/2 p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  <option value="" disabled>
                    End Time
                  </option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                </select>
              </div>
              {/* 24 hour availability */}
              <div className="flex gap-3">
                <label className="flex gap-3 text-secondary">
                  <input
                    type="checkbox"
                    checked={hourAvailability}
                    onChange={() => setHourAvailability(!hourAvailability)}
                    className="p-2 font-sans border:rounded-full bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark w-5 h-5"
                  />
                  24 Hour Availability
                </label>
              </div>
            </div>

            {/* Add more sections for creating a flock */}
            <div className="flex flex-col gap-3 mt-6">
              <label className="font-sans title-sm">Add Date:</label>
              <input
                type="date"
                className="p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDates([...selectedDates, e.target.value]);
                    e.target.value = ""; // Reset after adding
                  }
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFlock;
