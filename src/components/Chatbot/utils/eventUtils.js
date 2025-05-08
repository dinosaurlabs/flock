/**
 * Generate a random event ID
 * @returns {string} Random alphanumeric ID
 */
export function generateEventId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Create the default required information object for events
 */
export const REQUIRED_INFO = {
  name: null,
  description: null,
  dateRange: null,
  allowAnonymous: null,
  timesThatWork: null,
};

/**
 * Check if all required fields for event creation are present
 * @param {Object} info - Event information object
 * @returns {boolean} True if all required fields are present
 */
export function hasRequiredInfo(info) {
  return (
    info.name !== null && info.dateRange !== null && info.timesThatWork !== null
  );
}

/**
 * Extract access code from event ID
 * @param {string} id - Event ID
 * @returns {string} Access code
 */
export function getAccessCode(id) {
  return id.slice(0, 6).toUpperCase();
}
