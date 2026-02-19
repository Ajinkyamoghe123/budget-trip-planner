type AnalyticsEventName =
  | "generation_started"
  | "generation_succeeded"
  | "generation_failed"
  | "itinerary_viewed"
  | "plan_reset"
  | "feedback_submitted";

interface AnalyticsPayload {
  event: AnalyticsEventName;
  timestamp: string;
  app: string;
  [key: string]: unknown;
}

const ANALYTICS_WEBHOOK_URL =
  import.meta.env.VITE_ANALYTICS_WEBHOOK_URL?.trim() ||
  import.meta.env.VITE_FEEDBACK_WEBHOOK_URL?.trim();

const postEvent = async (endpoint: string, payload: string): Promise<void> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);

  try {
    await fetch(endpoint, {
      method: "POST",
      body: payload,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      mode: "cors",
      keepalive: true,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

export const trackEvent = async (
  event: AnalyticsEventName,
  metadata: Record<string, unknown> = {},
): Promise<void> => {
  if (!ANALYTICS_WEBHOOK_URL) return;

  const payload: AnalyticsPayload = {
    app: "chalo",
    event,
    timestamp: new Date().toISOString(),
    ...metadata,
  };
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
    const queued = navigator.sendBeacon(ANALYTICS_WEBHOOK_URL, blob);
    if (queued) return;
  }

  await postEvent(ANALYTICS_WEBHOOK_URL, body);
};
