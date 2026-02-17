const GOOGLE_FORM_ACTION_URL =
  import.meta.env.VITE_GOOGLE_FORM_ACTION_URL?.trim() ||
  "https://docs.google.com/forms/d/e/1FAIpQLSe-73KszVqhOUN9cC4AAL7jgz9xpBboyGJruKCWzIAmxOpxpg/formResponse";

// Keep these configurable so you can switch forms without code changes.
const GOOGLE_FORM_RATING_ENTRY_ID =
  import.meta.env.VITE_GOOGLE_FORM_RATING_ENTRY_ID?.trim() || "1327086518";
const GOOGLE_FORM_FEEDBACK_ENTRY_ID =
  import.meta.env.VITE_GOOGLE_FORM_FEEDBACK_ENTRY_ID?.trim() || "897945779";

export const isFeedbackEnabled = Boolean(
  GOOGLE_FORM_ACTION_URL && GOOGLE_FORM_RATING_ENTRY_ID && GOOGLE_FORM_FEEDBACK_ENTRY_ID,
);

export const submitFeedback = async (rating: number, feedback: string): Promise<void> => {
  if (!isFeedbackEnabled) {
    throw new Error("Google Form feedback is not configured.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const body = new URLSearchParams();
  body.append(`entry.${GOOGLE_FORM_RATING_ENTRY_ID}`, String(rating));
  body.append(`entry.${GOOGLE_FORM_FEEDBACK_ENTRY_ID}`, feedback.trim());

  // no-cors is required for direct browser submissions to Google Forms.
  await fetch(GOOGLE_FORM_ACTION_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: body.toString(),
  });
};
