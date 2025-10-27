/**
 * Utility functions for handling data display and formatting
 */

/**
 * Checks if a value should be considered "empty" or null for display purposes.
 * This includes null, undefined, empty strings, and the string "null".
 */
export function isEmptyValue(value: unknown): boolean {
  return value === null || 
         value === undefined || 
         value === "" || 
         value === "null";
}

/**
 * Safely converts a value to string, handling null/"null" values gracefully.
 * Returns empty string for empty values, otherwise returns the string representation.
 */
export function safeToString(value: unknown): string {
  if (isEmptyValue(value)) {
    return "";
  }
  return value?.toString() || "";
}

/**
 * Formats a value for display in UI components.
 * Returns empty string for null/empty values, or a dash for fallback display.
 */
export function formatDisplayValue(value: unknown, fallback: string = "-"): string {
  const stringValue = safeToString(value);
  return stringValue || fallback;
}

/**
 * Counts meaningful fields in a COA record, excluding empty values and metadata fields.
 */
export function countMeaningfulFields(record: Record<string, unknown>): number {
  return Object.keys(record).filter(key => {
    const value = record[key];
    return key !== 'file' && 
           key !== 'id' && 
           !isEmptyValue(value);
  }).length;
}
