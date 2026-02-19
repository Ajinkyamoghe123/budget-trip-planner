# Chalo Travel Planner

## Documentation

- Architecture guide (non-technical): `docs/ARCHITECTURE_GUIDE.md`
- Company documentation playbook: `docs/DOCUMENTATION_PLAYBOOK.md`

## Run Locally

Prerequisites: Node.js 18+

1. Install dependencies:
   `npm install`
2. Configure environment in `.env`:
   - `GEMINI_API_KEY=your_server_side_gemini_key`
     or `VITE_GEMINI_API_KEY=...` (temporary compatibility)
   - `VITE_BACKEND_URL=http://localhost:8787` (optional for local only)
   - `VITE_GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/d/e/<FORM_ID>/formResponse` (optional)
   - `VITE_GOOGLE_FORM_RATING_ENTRY_ID=<RATING_ENTRY_ID>` (optional)
   - `VITE_GOOGLE_FORM_FEEDBACK_ENTRY_ID=<FEEDBACK_ENTRY_ID>` (optional)
   - `VITE_ANALYTICS_WEBHOOK_URL=your_analytics_webhook_url` (optional)
3. Start backend proxy (terminal 1):
   `npm run dev:server`
4. Start frontend (terminal 2):
   `npm run dev`

## Architecture Summary

- Gemini calls are proxied through `server/index.mjs` so API keys stay server-side.
- Frontend sends only trip input to `/api/generate-plan`.
- Feedback is submitted directly to Google Form using `POST + no-cors`.
- Analytics events are sent to webhook (`sendBeacon` + `fetch` fallback).

## Feedback with Google Form

Use your form response endpoint:

1. `VITE_GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/d/e/<FORM_ID>/formResponse`
2. `VITE_GOOGLE_FORM_RATING_ENTRY_ID=<RATING_ENTRY_ID>`
3. `VITE_GOOGLE_FORM_FEEDBACK_ENTRY_ID=<FEEDBACK_ENTRY_ID>`

Current app expects:
- rating (1-5 stars)
- feedback comment (text)

## Optional: Google Sheets Analytics via Apps Script

If you want tracking events in Sheets, configure `VITE_ANALYTICS_WEBHOOK_URL` with an Apps Script Web App URL.

## Notes

- Feedback uses direct Google Form submission with `mode: "no-cors"`.
- Itinerary generation adds guardrails for incomplete AI output (day count, fallback data, URL normalization).
- Keep `GEMINI_API_KEY` only on the server, never in `VITE_*` variables.

## Deploy On Vercel

1. Add environment variable:
   - `GEMINI_API_KEY=your_server_side_gemini_key`
2. Do not set `VITE_BACKEND_URL` to localhost on Vercel.
3. Redeploy after adding env vars.

Expected production API path:
- Frontend calls same-origin `POST /api/generate-plan`
- Vercel serves it from `api/generate-plan.ts`
