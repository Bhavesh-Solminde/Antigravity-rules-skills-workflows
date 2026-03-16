DevProxy — API & Webhook Debugger
=================================

A real-time API traffic interceptor and webhook debugger built for developers integrating payment gateways (Stripe, Razorpay, PayPal, etc.). Think of it as a self-hosted Proxyman/Webhooksite with a built-in AI debugger powered by Google Gemini.

--------------------------------------------------------------------------------

TABLE OF CONTENTS

1. Features
2. Architecture Overview
3. Tech Stack
4. Project Structure
5. Getting Started
6. Environment Variables
7. How It Works
8. API Reference
9. Frontend Architecture
10. Scripts

--------------------------------------------------------------------------------

1. FEATURES

* Webhook Interception: Capture incoming webhooks from Stripe, Razorpay, PayPal, etc. Forward them to your local backend and log every detail.
* Automatic HTTP Capture: Silently log every outgoing HTTP call your backend makes.
* Manual API Dispatch: Fire custom API requests (GET/POST/PUT/DELETE) via a slide-over drawer form and see the full response.
* AI Debugger: One-click AI analysis of any failed request — streams a real-time diagnosis from Google Gemini 2.0 Flash.
* Real-Time Dashboard: All events appear instantly via Socket.io — no polling, no refresh.
* Replay & Delete: Replay any logged webhook or API request, or delete it from the log.
* Smart Filtering: Filter by source/service, error-only mode, configurable result limit.
* Light / Dark Mode: Full theme toggle with localStorage persistence.


--------------------------------------------------------------------------------

2. ARCHITECTURE OVERVIEW

┌─────────────────────────────────────────────────────────────────────┐
│                        DevProxy Backend                             │
│                                                                     │
│  ┌──────────────┐   ┌───────────────────┐   ┌──────────────────┐    │
│  │ Webhook      │   │ API Request       │   │ AI Debug         │    │
│  │ Controller   │   │ Controller        │   │ Controller       │    │
│  │              │   │                   │   │ (Gemini SSE)     │    │
│  └──────┬───────┘   └────────┬──────────┘   └────────┬─────────┘    │
│         │                    │                       │              │
│         ▼                    ▼                       ▼              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     MongoDB (Mongoose)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                    │                                      │
│         ▼                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Socket.io Server                         │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                   │
│  ┌──────────────────────────────┘                                   │
│  │  Proxy Interceptor (monkey-patches http/https.request)           │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ WebSocket + REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DevProxy Frontend                            │
│                                                                     │
│  ┌─────────┐  ┌───────────┐  ┌──────────────┐  ┌───────────────┐    │
│  │ Navbar  │  │ Stats     │  │ EventList    │  │ EventDetail   │    │
│  │ (Theme) │  │ Summary   │  │ (EventCards) │  │ Panel         │    │
│  └─────────┘  └───────────┘  └──────────────┘  └───────────────┘    │
│                                                                     │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐   │
│  │ ManualDispatch   │  │ DebugPromptModal (Gemini AI Stream)    │   │
│  │ Drawer           │  │                                        │   │
│  └──────────────────┘  └────────────────────────────────────────┘   │
│                                                                     │
│  State: Zustand stores (webhookStore, apiRequestStore, uiStore)     │
└─────────────────────────────────────────────────────────────────────┘


--------------------------------------------------------------------------------

3. TECH STACK

BACKEND:
* Node.js + Express
* TypeScript
* MongoDB + Mongoose
* Socket.io
* Axios
* @google/generative-ai (Gemini 2.0 Flash)

FRONTEND:
* React 19 + Vite
* TypeScript
* TailwindCSS v4
* Zustand
* Socket.io Client
* react-markdown + remark-gfm + react-syntax-highlighter
* Lucide React
* date-fns
* react-hot-toast


--------------------------------------------------------------------------------

4. PROJECT STRUCTURE

devproxy/
├── backend/
│   ├── src/
│   │   ├── server.ts                  (Entry point)
│   │   ├── app.ts                     (Express app config)
│   │   ├── env.ts                     (Environment variables)
│   │   ├── middleware/
│   │   │   └── proxyInterceptor.ts    (Monkey-patches http/https.request)
│   │   ├── modules/
│   │   │   ├── webhooks/              (Webhook controllers, routes, models)
│   │   │   ├── api-requests/          (API request controllers, routes, models)
│   │   │   └── ai-debug/              (Gemini prompt generation + streaming)
│   │   └── shared/                    (Socket.io, DB, errors, utils)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    (Router + ThemeProvider)
│   │   ├── index.css                  (Theme CSS variables)
│   │   ├── pages/                     (DashboardPage, NotFoundPage)
│   │   ├── components/                (Navbar, EventCards, Modals, Forms)
│   │   ├── store/                     (Zustand stores)
│   │   ├── hooks/                     (useSocket, useTheme, etc.)
│   │   └── types/                     (TypeScript interfaces)
│   └── package.json
│
└── README.md


--------------------------------------------------------------------------------

5. GETTING STARTED

Prerequisites:
- Node.js >= 18
- MongoDB
- npm

Setup:
1. Clone the Repository
2. Install Dependencies in both `backend` and `frontend` folders using `npm install` (use `--legacy-peer-deps` for frontend).
3. Create a `.env` inside `backend/`.
4. Run `npm run dev` in both folders.


--------------------------------------------------------------------------------

6. ENVIRONMENT VARIABLES

Create `.env` in the backend format:

PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/devproxy
FRONTEND_ORIGIN=http://localhost:5173
BACKEND_TARGET_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key_here


--------------------------------------------------------------------------------

7. HOW IT WORKS

A. Webhook Interception (POST /api/webhooks/:source)
Point your payment provider to this devproxy endpoint. It logs the webhook, forwards it to TARGET_URL, captures the response, and broadcasts to UI via Socket.io.

B. Automatic HTTP Traffic Capture
At server startup, Node's native HTTP functions are monkey-patched. Every outgoing HTTP call your backend makes is automatically intercepted, logged with source "auto", and displayed in the frontend dashboard. Localhost and MongoDB requests are excluded.

C. Manual API Dispatch
Click "+ Manual Dispatch" in the UI to open a slide-over form. Set Method, URL, Headers, and JSON. The request proxies through the backend, logs alongside automatic requests, and gets a blue "MANUAL" badge.

D. AI Debugger (Gemini)
Click "AI Debug" on any failed event. The backend creates a prompt with all request/response details, calls Gemini 2.0 Flash, and streams the output (Server-Sent Events) back to the frontend markdown viewer. Requires GEMINI_API_KEY.

E. Real-Time Updates (Socket.io)
Everything is live. No refreshing needed for new webhooks or API requests.

F. Light / Dark Mode
Toggle via the Sun/Moon icon. Preference persists to localStorage.


--------------------------------------------------------------------------------

8. API REFERENCE

WEBHOOKS:
* GET    /api/webhooks           - List all webhooks
* GET    /api/webhooks/:id       - Get a single webhook
* POST   /api/webhooks/:source   - Intercept and forward
* POST   /api/webhooks/:id/replay- Replay a webhook
* DELETE /api/webhooks/:id       - Delete a webhook

API REQUESTS:
* GET    /api/api-requests           - List all API requests
* GET    /api/api-requests/:id       - Get a single API request
* POST   /api/api-requests/proxy     - Proxy a manual API request
* POST   /api/api-requests/:id/replay- Replay an API request
* DELETE /api/api-requests/:id       - Delete an API request

AI DEBUG:
* POST   /api/ai-debug/prompt    - Generate a debug prompt text
* POST   /api/ai-debug/stream    - Stream AI analysis via SSE


--------------------------------------------------------------------------------

9. FRONTEND ARCHITECTURE

Stores (Zustand):
- webhookStore: Webhook CRUD & view state
- apiRequestStore: API Request CRUD & view state
- uiStore: Layout toggles, Active tab, Debug Modal state

Hooks:
- useSocket: Manages Socket.io connection and listeners
- useDebugPrompt: Formats event payload to pass into modal
- useTheme: Toggles custom CSS variables defined in index.css

Key Components:
- DashboardPage / DashboardLayout: Core UI skeleton
- EventDetailPanel: Deep dive into JSON headers/body
- DebugPromptModal: Rendering of streaming Gemini response
- JsonViewer: Syntax-highlighted payload viewer


--------------------------------------------------------------------------------

10. SCRIPTS

Backend:
* npm run dev   : Run hot-reloading dev server
* npm run build : Compile TS to dist/
* npm start     : Run node dist/server.js

Frontend:
* npm run dev   : Run Vite server
* npm run build : Build for production
* npm run lint  : ESLint
