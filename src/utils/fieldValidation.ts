/**
 * Validates and formats integer input
 * Removes decimals and non-numeric characters, allows negative numbers
 */
export const validateIntegerInput = (text: string): string => {
  // Only allow integers (no decimals or other characters)
  const integerOnly = text.replace(/[^0-9-]/g, '');
  // Ensure minus sign only appears at the start
  const validInteger = integerOnly.replace(/(?!^)-/g, '');
  return validInteger;
};

/**
 * Validates and formats float input during typing
 * Allows up to 3 decimal places, handles negative numbers
 */
export const validateFloatInput = (text: string): string => {
  // Remove non-numeric characters except decimal point and minus
  let cleaned = text.replace(/[^0-9.-]/g, '');
  // Ensure minus sign only at start
  cleaned = cleaned.replace(/(?!^)-/g, '');
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  // Limit to 3 decimal places
  if (parts.length === 2 && parts[1].length > 3) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 3);
  }
  return cleaned;
};

/**
 * Formats float value to exactly 3 decimal places
 * Called when user finishes editing (onBlur)
 */
export const formatFloatToFixed = (value: string): string => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    return numValue.toFixed(3);
  }
  return value;
};
