import { parse } from "chrono-node";

/**
 * Parse natural language date ranges
 * @param {string} text - Text containing date information
 * @param {Date} [referenceDate=new Date()] - Reference date for relative dates, defaults to current date
 * @returns {Object|null} Date range with start and end dates, or null if no dates found
 */
export function parseDateRange(text, referenceDate = new Date()) {
  // Log the reference date being used
  console.log("Using reference date:", referenceDate);

  // Use chrono-node to parse natural language date ranges with a reference date
  const results = parse(text, referenceDate);
  if (results.length === 0) return null;

  // If a range is detected
  const range = results.find((r) => r.start && r.end);
  if (range) {
    return {
      start: range.start.date().toISOString().split("T")[0],
      end: range.end.date().toISOString().split("T")[0],
    };
  }

  // If multiple single dates are detected, use the earliest and latest
  const dates = results.map((r) => r.start.date()).sort((a, b) => a - b);
  if (dates.length >= 2) {
    return {
      start: dates[0].toISOString().split("T")[0],
      end: dates[dates.length - 1].toISOString().split("T")[0],
    };
  }

  // If only one date, treat as single-day event
  if (dates.length === 1) {
    return {
      start: dates[0].toISOString().split("T")[0],
      end: dates[0].toISOString().split("T")[0],
    };
  }

  return null;
}
