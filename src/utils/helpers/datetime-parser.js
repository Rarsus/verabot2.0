/**
 * Datetime Parser Utility
 * Parses various datetime formats into ISO 8601 strings for reminder system
 */

/**
 * Parse relative time expressions (e.g., "1 day", "2 hours", "30 minutes")
 * @param {string} input - Relative time expression
 * @returns {Date|null} Date object or null if not a relative time format
 */
function parseRelativeTime(input) {
  const trimmed = input.trim().toLowerCase();

  // Match patterns like "1 day", "2 hours", "30 minutes", "1 week", "3 months"
  const relativePattern =
    /^(\d+)\s*(minute|minutes|min|hour|hours|hr|hrs|h|day|days|d|week|weeks|w|month|months|mo|year|years|yr|yrs|y)$/i;
  const match = trimmed.match(relativePattern);

  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const now = new Date();

  // Add time based on unit
  if (unit.startsWith('minute') || unit === 'min') {
    now.setMinutes(now.getMinutes() + value);
  } else if (unit.startsWith('hour') || unit === 'hr' || unit === 'h') {
    now.setHours(now.getHours() + value);
  } else if (unit.startsWith('day') || unit === 'd') {
    now.setDate(now.getDate() + value);
  } else if (unit.startsWith('week') || unit === 'w') {
    now.setDate(now.getDate() + value * 7);
  } else if (unit.startsWith('month') || unit === 'mo') {
    now.setMonth(now.getMonth() + value);
  } else if (unit.startsWith('year') || unit === 'yr' || unit === 'y') {
    now.setFullYear(now.getFullYear() + value);
  }

  return now;
}

/**
 * Parse natural language dates (e.g., "tomorrow", "next Monday", "next week")
 * @param {string} input - Natural language date expression
 * @returns {Date|null} Date object or null if not a natural language format
 */
function parseNaturalDate(input) {
  const trimmed = input.trim().toLowerCase();
  const now = new Date();

  // Tomorrow
  if (trimmed === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
    return tomorrow;
  }

  // Next week
  if (trimmed === 'next week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0); // Default to 9 AM Monday
    return nextWeek;
  }

  // End of month
  if (trimmed === 'end of month' || trimmed === 'eom') {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(17, 0, 0, 0); // Default to 5 PM
    return endOfMonth;
  }

  // Next [day of week]
  const nextDayPattern =
    /^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)$/i;
  const dayMatch = trimmed.match(nextDayPattern);
  if (dayMatch) {
    const dayNames = {
      monday: 1,
      mon: 1,
      tuesday: 2,
      tue: 2,
      wednesday: 3,
      wed: 3,
      thursday: 4,
      thu: 4,
      friday: 5,
      fri: 5,
      saturday: 6,
      sat: 6,
      sunday: 0,
      sun: 0,
    };

    const targetDay = dayNames[dayMatch[1].toLowerCase()];
    const currentDay = now.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Move to next week
    }

    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + daysToAdd);
    nextDay.setHours(9, 0, 0, 0); // Default to 9 AM
    return nextDay;
  }

  return null;
}

/**
 * Parse time-only formats (e.g., "15:30", "3:30 PM")
 * @param {string} input - Time expression
 * @returns {Date|null} Date object or null if not a time-only format
 */
function parseTimeOnly(input) {
  const trimmed = input.trim();

  // 24-hour format: HH:MM or H:MM
  const time24Pattern = /^(\d{1,2}):(\d{2})$/;
  const match24 = trimmed.match(time24Pattern);

  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const now = new Date();
      const targetTime = new Date(now);
      targetTime.setHours(hours, minutes, 0, 0);

      // If time has already passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      return targetTime;
    }
  }

  // 12-hour format: H:MM AM/PM or HH:MM AM/PM
  const time12Pattern = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i;
  const match12 = trimmed.match(time12Pattern);

  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3].toLowerCase();

    if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes < 60) {
      // Convert to 24-hour format
      if (meridiem === 'pm' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      const now = new Date();
      const targetTime = new Date(now);
      targetTime.setHours(hours, minutes, 0, 0);

      // If time has already passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      return targetTime;
    }
  }

  return null;
}

/**
 * Parse date-only formats (e.g., "2025-12-31", "12/31/2025", "Dec 31, 2025")
 * @param {string} input - Date expression
 * @returns {Date|null} Date object or null if not a date-only format
 */
function parseDateOnly(input) {
  const trimmed = input.trim();

  // Check if input doesn't contain time indicators
  if (/\d{2}:\d{2}/.test(trimmed) || /T\d{2}/.test(trimmed)) {
    return null; // This has a time component, not date-only
  }

  // Try parsing with Date constructor
  const date = new Date(trimmed);

  // Check if it's a valid date
  if (!isNaN(date.getTime())) {
    // Set to 9 AM local time for date-only inputs
    date.setHours(9, 0, 0, 0);
    return date;
  }

  return null;
}

/**
 * Parse combined date + time formats (e.g., "2025-12-31 15:30", "tomorrow at 3 PM")
 * @param {string} input - Combined date and time expression
 * @returns {Date|null} Date object or null if not a combined format
 */
function parseCombinedDateTime(input) {
  const trimmed = input.trim().toLowerCase();

  // Pattern: "tomorrow at TIME", "next monday at TIME"
  const naturalWithTimePattern =
    /^(tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|week))\s+at\s+(.+)$/i;
  const naturalMatch = trimmed.match(naturalWithTimePattern);

  if (naturalMatch) {
    const dateStr = naturalMatch[1];
    const timeStr = naturalMatch[2];

    const date = parseNaturalDate(dateStr);
    const time = parseTimeOnly(timeStr);

    if (date && time) {
      // Combine date and time
      date.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return date;
    }
  }

  // Pattern: "DATE TIME" (space-separated)
  // eslint-disable-next-line security/detect-unsafe-regex
  const dateTimePattern = /^(.+?)\s+(\d{1,2}:\d{2}(?:\s*(?:am|pm))?)$/i;
  const dateTimeMatch = trimmed.match(dateTimePattern);

  if (dateTimeMatch) {
    const dateStr = dateTimeMatch[1];
    const timeStr = dateTimeMatch[2];

    const date = parseDateOnly(dateStr);
    const time = parseTimeOnly(timeStr);

    if (date && time) {
      // Combine date and time
      date.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return date;
    }
  }

  return null;
}

/**
 * Main datetime parser function
 * Parses various datetime formats and returns ISO date strings
 *
 * Supported formats:
 * - Relative time: "1 day", "2 hours", "30 minutes", "1 week", "3 months"
 * - ISO format: "2025-12-31T15:30:00Z" (existing, maintains compatibility)
 * - Date only: "2025-12-31" or "12/31/2025" or "Dec 31, 2025" (assumes 9 AM)
 * - Time only: "15:30" or "3:30 PM" (assumes next occurrence)
 * - Natural dates: "tomorrow", "next Monday", "next week", "end of month"
 * - Combined: "2025-12-31 15:30", "tomorrow at 3 PM", "next Monday at 9 AM"
 *
 * @param {string} input - Datetime string in various formats
 * @returns {Object} { valid: boolean, isoString?: string, error?: string }
 */
function parseDateTime(input) {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      error: 'Date/time is required and must be a string',
    };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Date/time cannot be empty',
    };
  }

  let parsedDate = null;

  // Try parsing in order of specificity
  // 1. Try combined date + time formats first (most specific)
  parsedDate = parseCombinedDateTime(trimmed);

  // 2. Try relative time
  if (!parsedDate) {
    parsedDate = parseRelativeTime(trimmed);
  }

  // 3. Try natural language dates
  if (!parsedDate) {
    parsedDate = parseNaturalDate(trimmed);
  }

  // 4. Try time-only formats
  if (!parsedDate) {
    parsedDate = parseTimeOnly(trimmed);
  }

  // 5. Try date-only formats
  if (!parsedDate) {
    parsedDate = parseDateOnly(trimmed);
  }

  // 6. Try standard Date constructor (handles ISO and many other formats)
  if (!parsedDate) {
    const standardDate = new Date(trimmed);
    if (!isNaN(standardDate.getTime())) {
      parsedDate = standardDate;
    }
  }

  // Validate result
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return {
      valid: false,
      error:
        'Invalid date/time format. Supported formats: ISO dates, relative time (e.g., "1 day"), natural language (e.g., "tomorrow"), time (e.g., "3:30 PM"), or combinations (e.g., "tomorrow at 3 PM")',
    };
  }

  // Check if date is in the past (allow 1 minute grace period for tests and clock differences)
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  if (parsedDate < oneMinuteAgo) {
    return {
      valid: false,
      error: 'Date/time cannot be in the past',
    };
  }

  return {
    valid: true,
    isoString: parsedDate.toISOString(),
  };
}

module.exports = {
  parseDateTime,
  // Export internal functions for testing
  parseRelativeTime,
  parseNaturalDate,
  parseTimeOnly,
  parseDateOnly,
  parseCombinedDateTime,
};
