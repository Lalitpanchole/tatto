export const DEFAULT_PRICING = { '3H': 90, '4H': 120, '6H': 150, '8H': 220 };

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Gets the pricing object for a specific day.
 * If pricing is legacy (single object), returns that object.
 * If pricing is per-day, returns the price for the specific day.
 */
export const getPricingForDay = (pricingObj, date = new Date()) => {
  if (!pricingObj || typeof pricingObj !== 'object') {
    return DEFAULT_PRICING;
  }

  let dayName;
  if (typeof date === 'string' || typeof date === 'number') {
    dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  } else if (date instanceof Date) {
    dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Case 1: Day-based format (has 'Monday', 'Tuesday', etc.)
  if (pricingObj[dayName] && typeof pricingObj[dayName] === 'object') {
    return pricingObj[dayName];
  }

  // Case 2: Old legacy format (e.g. contains '3H' directly)
  if (pricingObj['3H'] !== undefined && typeof pricingObj['3H'] !== 'object') {
    return pricingObj;
  }

  // Case 3: Day-based format but day is missing, fallback to any available day or default
  for (const day of DAYS_OF_WEEK) {
    if (pricingObj[day] && typeof pricingObj[day] === 'object') {
      return pricingObj[day];
    }
  }

  return DEFAULT_PRICING;
};

/**
 * Initializes a day-based pricing object if it's currently legacy.
 */
export const initializeDayBasedPricing = (pricingObj) => {
  if (!pricingObj || typeof pricingObj !== 'object') {
    pricingObj = DEFAULT_PRICING;
  }

  // Check if it's already day-based (has at least one day of the week as a key)
  const hasDayKeys = DAYS_OF_WEEK.some(day => pricingObj[day] !== undefined);

  const dayBased = {};
  if (hasDayKeys) {
    // Find a fallback price (the first available day's pricing) in case some days are missing
    let fallbackPrice = DEFAULT_PRICING;
    for (const day of DAYS_OF_WEEK) {
      if (pricingObj[day] && typeof pricingObj[day] === 'object') {
        fallbackPrice = pricingObj[day];
        break;
      }
    }
    
    // Ensure every day has a proper pricing object without nesting issues
    for (const day of DAYS_OF_WEEK) {
      if (pricingObj[day] && typeof pricingObj[day] === 'object') {
        dayBased[day] = { ...pricingObj[day] };
      } else {
        dayBased[day] = { ...fallbackPrice };
      }
    }
  } else {
    // Legacy format or single default object (e.g. { '3H': 100 })
    for (const day of DAYS_OF_WEEK) {
      dayBased[day] = { ...pricingObj };
    }
  }

  return dayBased;
};
