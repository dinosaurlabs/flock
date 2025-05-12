import React from "react";
import Button from "./Button/Button";
import { formatDateDisplay } from '../utils/dateUtils';

/**
 * EventSummaryCard component displays a summary of the event details
 * with a button to create the event
 * @param {Object} props - Component props
 * @param {Object} props.eventInfo - Event info object
 * @param {Function} props.onCreate - Function to call when create button is clicked
 */
const EventSummaryCard = ({ eventInfo, onCreate }) => {
  // Fallbacks for missing info
  const safeTitle = eventInfo?.name || "Your Event";

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const safeDateRange =
    typeof eventInfo?.dateRange === "object" && eventInfo?.dateRange !== null
      ? `${formatDateDisplay(eventInfo.dateRange.start)} - ${formatDateDisplay(eventInfo.dateRange.end)}`
      : eventInfo?.dateRange || "Not set";
  const safeTimeRange =
    typeof eventInfo?.timesThatWork === "object" && eventInfo?.timesThatWork !== null
      ? `${eventInfo.timesThatWork.start} to ${eventInfo.timesThatWork.end}`
      : eventInfo?.timesThatWork || "Not set";

  return (
    <div className="flex flex-col w-full max-w-[320px] gap-6 p-4 text-left rounded-[15px] border border-border dark:border-border-dark bg-surfaceContainer dark:bg-surfaceContainer-dark">
      <div className="flex flex-col gap-2">
      <h3 className="mb-1 text-lg font-medium text-onSurface dark:text-onSurface-dark">
        {safeTitle}
      </h3>
      <div className="flex flex-col gap-1">
      <div className="text-sm text-secondary dark:text-secondary-dark">
        <span className="font-medium">Dates:</span> {safeDateRange}
      </div>
      <div className="text-sm text-secondary dark:text-secondary-dark">
        <span className="font-medium">Times:</span> {safeTimeRange}
        </div>
        </div>
      </div>
      <Button onClick={onCreate} text="CREATE FLOCK"/>
    </div>
  );
};

export default EventSummaryCard;
