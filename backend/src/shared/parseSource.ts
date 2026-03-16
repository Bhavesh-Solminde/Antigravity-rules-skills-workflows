/**
 * Extracts a service name and event type from a URL path, full URL, headers, and payload.
 *
 * Examples:
 *   "/webhooks/razorpay"                       → "razorpay"
 *   "https://api.razorpay.com/v1/payments"     → "razorpay"
 *   "https://api.stripe.com/v1/charges"        → "stripe"
 *   "/some/unknown/path"                       → "unknown"
 */
export const parseSource = (
  input: string,
  headers: Record<string, any> = {},
  payload: any = {}
): { source: string; eventType: string } => {
  let source = 'unknown';
  let eventType = 'Unknown Event';

  // Path-based: "/webhooks/razorpay" → "razorpay"
  const pathMatch = input.match(/\/webhooks\/([a-zA-Z0-9_-]+)/);
  if (pathMatch) {
    source = pathMatch[1].toLowerCase();
  } else if (input && !input.includes('/') && !input.includes(':')) {
    // If it's a direct string like "stripe" from params
    source = input.toLowerCase();
  } else {
    // URL-based: extract from hostname
    try {
      const url = new URL(input);
      const hostParts = url.hostname.split('.');

      // Look for "api.razorpay.com" → "razorpay"
      for (const part of hostParts) {
        const lower = part.toLowerCase();
        if (lower !== 'api' && lower !== 'www' && lower !== 'com' && lower !== 'io' && lower !== 'net' && lower !== 'org' && lower !== 'localhost') {
          source = lower;
          break;
        }
      }
    } catch {
      // Not a valid URL — fall through
    }
  }

  // Attempt to extract event type from headers or payload
  if (headers['x-github-event']) {
    eventType = String(headers['x-github-event']);
  } else if (headers['stripe-event']) {
    eventType = String(headers['stripe-event']);
  } else if (payload && typeof payload === 'object') {
    if (typeof payload.type === 'string') {
      eventType = payload.type;
    } else if (typeof payload.event === 'string') {
      eventType = payload.event;
    } else if (typeof payload.action === 'string') {
      eventType = payload.action;
    } else if (typeof payload.event_type === 'string') {
      eventType = payload.event_type;
    }
  }

  return { source, eventType };
};
