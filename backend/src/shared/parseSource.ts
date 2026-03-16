/**
 * Extracts a service name from a URL path or full URL.
 *
 * Examples:
 *   "/webhooks/razorpay"                       → "razorpay"
 *   "https://api.razorpay.com/v1/payments"     → "razorpay"
 *   "https://api.stripe.com/v1/charges"        → "stripe"
 *   "/some/unknown/path"                       → "unknown"
 */
export const parseSource = (input: string): string => {
  // Path-based: "/webhooks/razorpay" → "razorpay"
  const pathMatch = input.match(/\/webhooks\/([a-zA-Z0-9_-]+)/);
  if (pathMatch) {
    return pathMatch[1].toLowerCase();
  }

  // URL-based: extract from hostname
  try {
    const url = new URL(input);
    const hostParts = url.hostname.split('.');

    // Look for "api.razorpay.com" → "razorpay"
    for (const part of hostParts) {
      const lower = part.toLowerCase();
      if (lower !== 'api' && lower !== 'www' && lower !== 'com' && lower !== 'io' && lower !== 'net' && lower !== 'org') {
        return lower;
      }
    }
  } catch {
    // Not a valid URL — fall through
  }

  return 'unknown';
};
