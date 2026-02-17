export type FeedbackType = "thumbs_up" | "thumbs_down";
export type FeedbackReason =
  | "too_expensive"
  | "unrealistic_plan"
  | "poor_stay_options"
  | "not_my_style"
  | "other";

interface FeedbackMetadata {
  destination?: string;
  duration?: number;
  travelers?: number;
  reason?: FeedbackReason;
}

interface FeedbackPayload extends FeedbackMetadata {
  timestamp: string;
  feedback: FeedbackType;
  app: string;
}

const FEEDBACK_WEBHOOK_URL = import.meta.env.VITE_FEEDBACK_WEBHOOK_URL?.trim();
export const isFeedbackEnabled = Boolean(FEEDBACK_WEBHOOK_URL);

const postFeedback = async (endpoint: string, payload: string): Promise<void> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4000);

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

export const submitFeedback = async (
  feedback: FeedbackType,
  metadata: FeedbackMetadata = {},
): Promise<void> => {
  if (!isFeedbackEnabled || !FEEDBACK_WEBHOOK_URL) {
    throw new Error("Feedback webhook URL is not configured.");
  }

  const payload: FeedbackPayload = {
    app: "chalo",
    feedback,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  const body = JSON.stringify(payload);

  // sendBeacon keeps UI snappy and is resilient during navigation.
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const beaconPayload = new Blob([body], { type: "text/plain;charset=UTF-8" });
    const queued = navigator.sendBeacon(FEEDBACK_WEBHOOK_URL, beaconPayload);
    if (queued) return;
  }

  await postFeedback(FEEDBACK_WEBHOOK_URL, body);
};
