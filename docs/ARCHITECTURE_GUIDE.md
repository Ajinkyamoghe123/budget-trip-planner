# Chalo Architecture Guide (Non-Technical Friendly)

This document explains how your app works today in plain language.

## 1) What this product does

Chalo helps a user:
1. Enter trip preferences (cities, days, budget, style, etc.)
2. Generate a full travel plan (stays, transport, day-by-day plan, costs, local tips)
3. Rate the generated plan (stars + comment) so you can improve quality

## 2) Big-picture system design

The system has 3 parts:

1. Frontend app (what users see)
   - Built with React + Vite
   - Runs in browser
   - Files: `App.tsx`, `components/*`, `services/*`

2. Backend proxy server (security layer)
   - Small Node server
   - Calls Gemini safely with server-side API key
   - File: `server/index.mjs`

3. Optional data sinks (for business analytics)
   - Google Form for rating/comment feedback
   - Google Sheets webhook for event tracking
   - Config via env vars

## 3) User journey flow

1. User opens app at frontend (port 3000)
2. User fills form and clicks `Generate Itinerary`
3. Frontend sends input to backend endpoint:
   - `POST /api/generate-plan`
4. Backend builds prompt and calls Gemini
5. Backend returns AI text + sources
6. Frontend normalizes/validates output
7. Itinerary renders in cards
8. User can submit feedback (1-5 stars + comment)
9. Feedback goes to Google Form; analytics events can go to webhook

## 4) Current file map (what each file owns)

### Core app
- `App.tsx`
  - Page shell and main screen states
  - Handles submit/reset/generation lifecycle
  - Loading/error UI
  - Analytics event triggers (start/success/fail/reset)

- `components/InputForm.tsx`
  - User input form
  - Budget feasibility warning logic
  - Inputs include month, transport, pace, must-do, avoid

- `components/PlanDisplay.tsx`
  - Final itinerary/details page
  - Day cards + expand/collapse + quick nav
  - Feedback UI (stars + comment box)

### Services
- `services/geminiService.ts`
  - Calls backend `/api/generate-plan`
  - Parses and normalizes AI response
  - Adds fallback values if response is incomplete

- `services/feedbackService.ts`
  - Sends user feedback to Google Form
  - Uses `POST` with `mode: "no-cors"` and form entry IDs

- `services/analyticsService.ts`
  - Sends product events to webhook
  - Used for basic business metrics

### Backend
- `server/index.mjs`
  - Loads `.env`
  - Uses `GEMINI_API_KEY` (or fallback `VITE_GEMINI_API_KEY`)
  - Exposes `/api/generate-plan` and `/health`

### Config
- `vite.config.ts`
  - Frontend dev server config
  - Proxies `/api` to backend

- `types.ts`
  - Shared data contracts for form + itinerary

## 5) Environment variables

Use `.env` (example in `.env.example`):

- `GEMINI_API_KEY` (required, server-side)
- `PORT` (optional, backend port)
- `CORS_ORIGIN` (optional)
- `VITE_BACKEND_URL` (frontend -> backend URL)
- `VITE_GOOGLE_FORM_ACTION_URL` (optional)
- `VITE_GOOGLE_FORM_RATING_ENTRY_ID` (optional)
- `VITE_GOOGLE_FORM_FEEDBACK_ENTRY_ID` (optional)
- `VITE_ANALYTICS_WEBHOOK_URL` (optional)

Important: Keep Gemini key server-side only for production.

## 6) How to run locally

1. `npm install`
2. Start backend:
   - `npm run dev:server`
3. Start frontend:
   - `npm run dev`
4. Open app on `http://localhost:3000`

## 7) Business data currently collected

### Feedback events
- rating (1 to 5)
- feedback comment text
- Timestamp
- Stored in your Google Form responses sheet

### Product analytics events
- generation_started
- generation_succeeded
- generation_failed
- itinerary_viewed
- plan_reset
- feedback_submitted

This gives you a first-level KPI dashboard in Google Sheets.

## 8) Reliability + guardrails already added

1. Day count is forced to match selected duration
2. Missing itinerary activities get fallback items
3. Duplicate activity strings are removed
4. Booking links are normalized
5. Missing cost breakdown gets fallback distribution

## 9) Known limitations right now

1. Backend is minimal (no auth, no rate limiting yet)
2. Webhook security is basic
3. Analytics is event-level only (no cohort/reporting layer)
4. No user accounts/history yet

## 10) Recommended next architecture upgrades

### Phase 1 (stability)
1. Add backend rate limiting
2. Add request validation schema
3. Add retries/circuit handling for AI failures

### Phase 2 (business intelligence)
1. Move from Sheets to DB + BI dashboard
2. Add session IDs and funnel metrics
3. Add experiment flags (A/B testing)

### Phase 3 (product moat)
1. User accounts + saved itineraries
2. Personalization memory
3. Supplier integrations (booking APIs)

## 11) Troubleshooting checklist

### If itinerary generation returns 500
1. Check backend is running (`npm run dev:server`)
2. Check `.env` has `GEMINI_API_KEY`
3. Check frontend has `VITE_BACKEND_URL` pointing to backend
4. Check backend logs for exact error

### If feedback is not saved
1. Verify `VITE_GOOGLE_FORM_ACTION_URL`
2. Verify rating entry ID env value
3. Verify feedback entry ID env value

---

If you want, I can create a one-page visual architecture diagram (PNG/SVG) next for investor and team presentations.
