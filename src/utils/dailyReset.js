// Daily reset utility for game stats
// Resets completed categories at midnight Central Time

/**
 * Gets the next midnight in Central Time
 * @returns {Date} Next midnight Central Time
 */
export function getNextMidnightCentral() {
  const now = new Date();

  // Create date for next midnight in Central Time
  // Central Time is UTC-6 (CST) or UTC-5 (CDT)
  const centralOffset = getCentralTimeOffset();

  // Get current time in Central
  const centralTime = new Date(now.getTime() + centralOffset * 60 * 60 * 1000);

  // Set to next midnight
  const nextMidnight = new Date(centralTime);
  nextMidnight.setHours(24, 0, 0, 0); // Set to midnight of next day

  // Convert back to local time
  return new Date(nextMidnight.getTime() - centralOffset * 60 * 60 * 1000);
}

/**
 * Gets the Central Time offset from UTC
 * @returns {number} Offset in hours (negative number)
 */
function getCentralTimeOffset() {
  const now = new Date();
  const year = now.getFullYear();

  // DST rules for US Central Time:
  // Starts second Sunday in March, ends first Sunday in November
  const dstStart = getNthSundayOfMonth(year, 2, 2); // Second Sunday of March
  const dstEnd = getNthSundayOfMonth(year, 10, 0); // First Sunday of November

  // Check if we're in DST period
  const isDST = now >= dstStart && now < dstEnd;

  return isDST ? -5 : -6; // CDT is UTC-5, CST is UTC-6
}

/**
 * Gets the nth occurrence of a specific day in a month
 * @param {number} year
 * @param {number} month (0-11)
 * @param {number} dayOfWeek (0=Sunday, 1=Monday, etc.)
 * @param {number} n Which occurrence (0=first, 1=second, etc.)
 * @returns {Date}
 */
function getNthSundayOfMonth(year, month, n) {
  const firstDay = new Date(year, month, 1);
  const firstSunday = new Date(firstDay);

  // Find first Sunday of the month
  const daysToAdd = (7 - firstDay.getDay()) % 7;
  firstSunday.setDate(1 + daysToAdd);

  // Add weeks to get the nth Sunday
  firstSunday.setDate(firstSunday.getDate() + (n * 7));

  return firstSunday;
}

/**
 * Checks if stats should be reset (if it's past midnight Central Time)
 * @param {string|null} lastResetDate - ISO string of last reset date
 * @returns {boolean} True if reset is needed
 */
export function shouldResetStats(lastResetDate) {
  if (!lastResetDate) return true; // First time, reset needed

  const lastReset = new Date(lastResetDate);
  const now = new Date();

  // Get today's midnight in Central Time
  const centralOffset = getCentralTimeOffset();
  const centralTime = new Date(now.getTime() + centralOffset * 60 * 60 * 1000);

  const todayMidnightCentral = new Date(centralTime);
  todayMidnightCentral.setHours(0, 0, 0, 0);

  // Convert back to local time
  const todayMidnight = new Date(todayMidnightCentral.getTime() - centralOffset * 60 * 60 * 1000);

  return lastReset < todayMidnight;
}

/**
 * Gets the current date string for storing reset timestamps
 * @returns {string} ISO string of current date
 */
export function getCurrentDateString() {
  return new Date().toISOString();
}

/**
 * Debug function to manually reset stats
 * Temporarily enabled for production testing
 */
export function debugResetStats() {
  // Temporarily enabled for production testing
  // if (import.meta.env.DEV) {
    localStorage.removeItem('gameState');
    localStorage.removeItem('reactDaily_lastReset');
    console.log('🔧 DEBUG: Game stats manually reset');
    window.location.reload(); // Reload to apply changes
  // } else {
  //   console.warn('Debug reset is only available in development mode');
  // }
}

/**
 * Debug function to set a fake "yesterday" reset time for testing
 * Only available in development mode
 */
export function debugSetYesterdayReset() {
  if (import.meta.env.DEV) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    localStorage.setItem('reactDaily_lastReset', yesterday.toISOString());
    console.log('🔧 DEBUG: Reset time set to yesterday for testing');
  } else {
    console.warn('Debug functions are only available in development mode');
  }
}

// Make debug functions available globally in development
if (import.meta.env.DEV) {
  window.debugResetStats = debugResetStats;
  window.debugSetYesterdayReset = debugSetYesterdayReset;
  console.log('🔧 DEBUG: Daily reset functions available:');
  console.log('  - debugResetStats(): Manually reset all game stats');
  console.log('  - debugSetYesterdayReset(): Set reset time to yesterday for testing');
}