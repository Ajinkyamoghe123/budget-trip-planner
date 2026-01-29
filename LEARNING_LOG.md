
# 🧠 Chalo App: Technical Learning Log

## Current Tech Stack
- **Framework:** React.js (Component-based UI)
- **Styling:** Tailwind CSS (Utility-first design)
- **AI Engine:** Google Gemini 3 Flash (High-speed LLM)
- **Data Source:** Google Search Grounding (Live web data)
- **State Management:** React Hooks (useState, useEffect)
- **Persistence:** LocalStorage (Device-level memory)

## Key Concepts Explained
1. **JSON (The Bridge):** The format used to send data between the AI and the UI. It looks like a dictionary: `{ "key": "value" }`.
2. **Grounding:** The process of connecting an AI to a reliable, live data source (Google Search) to prevent "hallucinations" (fake info).
3. **Stateless vs. Stateful:** 
   - *Stateless:* The server doesn't remember you (Current).
   - *Stateful:* The server knows who you are via a Database (Future).
4. **Environment Variables:** `process.env.API_KEY` is a secret way to store passwords/keys so they aren't visible in the public code.

## Why this stack?
- **Speed:** Gemini Flash + React is the fastest way to get an answer to a user.
- **Cost:** Uses free tiers for hosting and AI, making the business highly profitable from Day 1.
- **Scalability:** Built with modular components, meaning we can add "Hotel Booking" or "Flight Comparison" as separate blocks later without breaking the app.
