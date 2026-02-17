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
   - `VITE_BACKEND_URL=http://localhost:8787`
   - `VITE_FEEDBACK_WEBHOOK_URL=your_feedback_webhook_url` (optional)
   - `VITE_ANALYTICS_WEBHOOK_URL=your_analytics_webhook_url` (optional)
3. Start backend proxy (terminal 1):
   `npm run dev:server`
4. Start frontend (terminal 2):
   `npm run dev`

## Architecture Summary

- Gemini calls are proxied through `server/index.mjs` so API keys stay server-side.
- Frontend sends only trip input to `/api/generate-plan`.
- Feedback and analytics are sent as lightweight webhook events (`sendBeacon` + `fetch` fallback).

## Google Sheets Integration (Feedback + Analytics)

Recommended setup: Google Apps Script Web App.

### 1) Create Google Sheet tabs

Create two tabs:

1. `feedback` with headers:
   - `timestamp`
   - `feedback`
   - `reason`
   - `destination`
   - `duration`
   - `app`

2. `events` with headers:
   - `timestamp`
   - `event`
   - `destination`
   - `duration`
   - `tripType`
   - `travelers`
   - `app`

### 2) Create Apps Script

Open Extensions -> Apps Script and paste:

```javascript
function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (payload.feedback) {
    const feedbackSheet = ss.getSheetByName('feedback');
    feedbackSheet.appendRow([
      payload.timestamp || new Date().toISOString(),
      payload.feedback || '',
      payload.reason || '',
      payload.destination || '',
      payload.duration || '',
      payload.app || 'chalo'
    ]);
  } else if (payload.event) {
    const eventSheet = ss.getSheetByName('events');
    eventSheet.appendRow([
      payload.timestamp || new Date().toISOString(),
      payload.event || '',
      payload.destination || '',
      payload.duration || '',
      payload.tripType || '',
      payload.travelers || '',
      payload.app || 'chalo'
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON); 
}
```

### 3) Deploy Web App

1. Deploy -> New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Copy the Web App URL

Set one or both:

`VITE_FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/.../exec`
`VITE_ANALYTICS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec`

You can also use the same URL for both variables.

## Notes

- Feedback supports thumbs up/down and optional reason chips for negative feedback.
- Itinerary generation adds guardrails for incomplete AI output (day count, fallback data, URL normalization).
- Keep `GEMINI_API_KEY` only on the server, never in `VITE_*` variables.
