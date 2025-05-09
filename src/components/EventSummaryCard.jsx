import React from "react";

/**
 * EventSummaryCard component displays a summary of the event details
 * with a button to create the event
 * @param {Object} props - Component props
 * @param {string} props.title - Event title/name
 * @param {string} props.dateRange - Formatted date range (e.g., "May 27 - May 28")
 * @param {string} props.timeRange - Formatted time range (e.g., "5pm to 8pm")
 * @param {Function} props.onCreateClick - Function to call when create button is clicked
 */
const EventSummaryCard = ({ title, dateRange, timeRange, onCreateClick }) => {
  // Ensure we have string values for all props
  const safeTitle = typeof title === "string" ? title : "Your Event";
  const safeDateRange =
    typeof dateRange === "string" ? dateRange : "Scheduled date";
  const safeTimeRange =
    typeof timeRange === "string" ? timeRange : "Flexible timing";

  return (
    <div className="bg-surfaceContainer dark:bg-surfaceContainer-dark rounded-lg shadow-md p-4 w-full max-w-sm text-left">
      <h3 className="text-lg font-medium text-onSurface dark:text-onSurface-dark mb-1">
        {safeTitle}
      </h3>
      <div className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-1">
        <span className="font-medium">Dates:</span> {safeDateRange}
      </div>
      <div className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-3">
        <span className="font-medium">Times:</span> {safeTimeRange}
      </div>
      <button
        onClick={onCreateClick}
        className="w-full py-3 px-4 bg-primary dark:bg-primary-dark text-onPrimary dark:text-onPrimary-dark rounded-full font-medium uppercase text-center hover:bg-primary/90 active:bg-primary/80 transition-colors cursor-pointer flex items-center justify-center"
      >
        <span className="mr-1">CREATE FLOCK</span>
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
  );
};

export default EventSummaryCard;
