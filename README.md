<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io" />
  <img src="https://img.shields.io/badge/Gemini-2.0_Flash-8E75B2?logo=google" />
</p>

# DevProxy — API & Webhook Debugger

A real-time **API traffic interceptor** and **webhook debugger** built for developers integrating payment gateways (Stripe, Razorpay, PayPal, etc.). Think of it as a self-hosted Proxyman/Webhooksite with a built-in AI debugger powered by **Google Gemini**.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
  - [Webhook Interception](#1-webhook-interception)
  - [Automatic HTTP Traffic Capture](#2-automatic-http-traffic-capture)
  - [Manual API Dispatch](#3-manual-api-dispatch)
  - [AI Debugger](#4-ai-debugger-gemini)
  - [Real-Time Updates](#5-real-time-updates-socketio)
  - [Light / Dark Mode](#6-light--dark-mode)
- [API Reference](#api-reference)
- [Frontend Architecture](#frontend-architecture)
- [Scripts](#scripts)

---

## Features

| Feature | Description |
|---|---|
| **Webhook Interception** | Capture incoming webhooks from Stripe, Razorpay, PayPal, etc. Forward them to your local backend and log every detail. |
| **Automatic HTTP Capture** | Monkey-patches Node's `http.request` / `https.request` to silently log **every outgoing HTTP call** your backend makes. |
| **Manual API Dispatch** | Fire custom API requests (GET/POST/PUT/DELETE) via a slide-over drawer form and see the full response. |
| **AI Debugger** | One-click AI analysis of any failed request — streams a real-time diagnosis from **Google Gemini 2.0 Flash** with markdown + syntax-highlighted code suggestions. |
| **Real-Time Dashboard** | All events appear instantly via **Socket.io** — no polling, no refresh. |
| **Replay & Delete** | Replay any logged webhook or API request, or delete it from the log. |
| **Smart Filtering** | Filter by source/service, error-only mode, configurable result limit. |
| **Light / Dark Mode** | Full theme toggle with localStorage persistence. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DevProxy Backend                             │
│                                                                     │
│  ┌──────────────┐   ┌───────────────────┐   ┌──────────────────┐   │
│  │  Webhook      │   │  API Request      │   │  AI Debug        │   │
│  │  Controller   │   │  Controller       │   │  Controller      │   │
│  │              │   │                   │   │  (Gemini SSE)    │   │
│  └──────┬───────┘   └────────┬──────────┘   └────────┬─────────┘   │
│         │                    │                       │              │
│         ▼                    ▼                       ▼              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     MongoDB (Mongoose)                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                    │                                      │
│         ▼                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Socket.io Server                          │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                   │
│  ┌──────────────────────────────┘                                   │
│  │  Proxy Interceptor (monkey-patches http/https.request)          │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ WebSocket + REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DevProxy Frontend                            │
│                                                                     │
│  ┌─────────┐  ┌───────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Navbar   │  │ StatsSummary│ │ EventList    │  │ EventDetail   │  │
│  │ (Theme)  │  │            │  │ (EventCards) │  │ Panel         │  │
│  └─────────┘  └───────────┘  └──────────────┘  └───────────────┘  │
│                                                                     │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐  │
│  │ ManualDispatch    │  │ DebugPromptModal (Gemini AI Stream)   │  │
│  │ Drawer            │  │                                        │  │
│  └──────────────────┘  └────────────────────────────────────────┘  │
│                                                                     │
│  State: Zustand stores (webhookStore, apiRequestStore, uiStore)    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | HTTP server & REST API |
| **TypeScript** | Strict typing across the entire codebase |
| **MongoDB + Mongoose** | Persistent storage for all intercepted events |
| **Socket.io** | Real-time event broadcasting to clients |
| **Axios** | Forwarding webhooks to upstream backends |
| **@google/generative-ai** | Gemini 2.0 Flash for AI-powered debugging |
| **uuid** | Unique ID generation for each event |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + Vite** | UI framework & dev server |
| **TypeScript** | Strict component typing |
| **TailwindCSS v4** | Utility-first styling with dark mode |
| **Zustand** | Lightweight global state management |
| **Socket.io Client** | Real-time event subscription |
| **react-markdown + remark-gfm** | Rendering AI analysis as rich markdown |
| **react-syntax-highlighter** | Syntax highlighting in AI responses & JSON viewer |
| **Lucide React** | Icon library |
| **date-fns** | Human-readable timestamp formatting |
| **react-hot-toast** | Toast notifications |

---

## Project Structure

```
devproxy/
├── backend/
│   ├── src/
│   │   ├── server.ts                  # Entry point — HTTP + Socket.io + DB
│   │   ├── app.ts                     # Express app config, CORS, routes
│   │   ├── env.ts                     # Centralized environment variables
│   │   ├── middleware/
│   │   │   └── proxyInterceptor.ts    # Monkey-patches http/https.request
│   │   ├── modules/
│   │   │   ├── webhooks/
│   │   │   │   ├── webhooks.model.ts       # IWebhookEvent schema
│   │   │   │   ├── webhooks.controller.ts  # Intercept, list, replay, delete
│   │   │   │   └── webhooks.routes.ts      # Route definitions
│   │   │   ├── api-requests/
│   │   │   │   ├── api-requests.model.ts       # IApiRequest schema (+ source field)
│   │   │   │   ├── api-requests.controller.ts  # Proxy, list, replay, delete
│   │   │   │   └── api-requests.routes.ts      # Route definitions
│   │   │   └── ai-debug/
│   │   │       ├── ai-debug.controller.ts  # Prompt generation + Gemini SSE stream
│   │   │       └── ai-debug.routes.ts      # /prompt and /stream routes
│   │   └── shared/
│   │       ├── socket.ts              # Socket.io initialization
│   │       ├── parseSource.ts         # Source/service detection utility
│   │       ├── lib/db.ts              # MongoDB connection
│   │       ├── errorMiddleware.ts     # Global error handler
│   │       └── utils/
│   │           ├── asyncHandler.ts    # Async route wrapper
│   │           ├── ApiResponse.ts     # Standardized success response
│   │           └── ApiError.ts        # Standardized error class
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Router + ThemeProvider + Toaster
│   │   ├── index.css                  # Theme CSS variables + scrollbar
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx      # Main layout (stats + filters + list + detail)
│   │   │   └── NotFoundPage.tsx       # 404 page
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx    # Navbar + Outlet + DebugPromptModal
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Logo, tab switcher, theme toggle
│   │   │   ├── ConnectionStatus.tsx   # Socket.io online/offline indicator
│   │   │   ├── StatsSummary.tsx       # Stats cards (total, errors, latency)
│   │   │   ├── FilterBar.tsx          # Search, error filter, + Manual Dispatch
│   │   │   ├── EventList.tsx          # Scrollable event list
│   │   │   ├── EventCard.tsx          # Single event card (AUTO/MANUAL badges)
│   │   │   ├── EventDetailPanel.tsx   # Full event inspector (headers, payload, actions)
│   │   │   ├── JsonViewer.tsx         # Syntax-highlighted JSON (theme-aware)
│   │   │   ├── DebugPromptModal.tsx   # AI analysis modal (SSE + markdown)
│   │   │   ├── ManualDispatchDrawer.tsx # Slide-over drawer for manual requests
│   │   │   ├── ProxyRequestForm.tsx   # Manual dispatch form (method, URL, headers, body)
│   │   │   ├── SourceIcon.tsx         # Service icon resolver
│   │   │   ├── StatusBadge.tsx        # HTTP status badge
│   │   │   └── TimestampDisplay.tsx   # Relative timestamp display
│   │   ├── store/
│   │   │   ├── webhookStore.ts        # Webhook CRUD state
│   │   │   ├── apiRequestStore.ts     # API request CRUD state
│   │   │   └── uiStore.ts            # UI state (tabs, debug modal)
│   │   ├── hooks/
│   │   │   ├── useSocket.ts           # Socket.io connection + event listeners
│   │   │   ├── useDebugPrompt.ts      # AI debug modal hook
│   │   │   └── ThemeContext.tsx        # Dark/light mode context + localStorage
│   │   ├── lib/
│   │   │   ├── axios.ts               # Configured axios client
│   │   │   └── utils.ts               # cn() utility (clsx + tailwind-merge)
│   │   └── types/
│   │       └── index.ts               # TypeScript interfaces
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or cloud — e.g. MongoDB Atlas)
- **npm** (no yarn/pnpm)

### 1. Clone the Repository

```bash
git clone https://github.com/Bhavesh-Solminde/Antigravity-rules-skills-workflows.git
cd Antigravity-rules-skills-workflows
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/devproxy
FRONTEND_ORIGIN=http://localhost:5173
BACKEND_TARGET_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key_here
```

> See [Environment Variables](#environment-variables) for details on each variable.

### 4. Start Dev Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The frontend will be available at **http://localhost:5173** and the backend at **http://localhost:5000**.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | Environment mode (default: `development`) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `FRONTEND_ORIGIN` | **Yes** | Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `BACKEND_TARGET_URL` | **Yes** | Your upstream backend URL where webhooks are forwarded |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI debugging. Without it, the AI debug endpoint returns 501. |

---

## How It Works

### 1. Webhook Interception

**Endpoint:** `POST /api/webhooks/:source`

When a payment provider (Stripe, Razorpay, etc.) sends a webhook:

1. DevProxy **receives** the webhook at its own URL
2. **Logs** the full request (method, URL, headers, payload) to MongoDB
3. **Forwards** the webhook to your actual backend at `BACKEND_TARGET_URL`
4. **Captures** the response status + latency from your backend
5. **Broadcasts** the event via Socket.io to all connected clients
6. **Returns** your backend's response to the payment provider

The `parseSource` utility auto-detects the provider (Stripe, Razorpay, PayPal, Cashfree, PhonePe) from URL patterns, headers, and payload signatures.

**Usage:** Point your payment provider's webhook URL to `http://your-devproxy-host/api/webhooks/stripe` instead of directly to your backend.

---

### 2. Automatic HTTP Traffic Capture

**File:** `backend/src/middleware/proxyInterceptor.ts`

At server startup, DevProxy monkey-patches Node's native `http.request()` and `https.request()` functions. This means **every outgoing HTTP call** your backend makes is automatically intercepted and logged — no code changes needed in your app.

**What gets captured:**
- Request method, URL, headers, body
- Response status, body, latency
- Auto-detected service name

**What gets excluded (to prevent noise):**
- `localhost` / `127.0.0.1` traffic
- MongoDB connections
- Socket.io internal traffic
- Gemini API calls

Each auto-captured event is tagged with `source: "auto"` and displays a grey **AUTO** badge in the UI. Manually dispatched requests show a blue **MANUAL** badge.

---

### 3. Manual API Dispatch

Click the **"+ Manual Dispatch"** button in the filter bar to open a slide-over drawer. From there you can:

- Select **HTTP method** (GET, POST, PUT, DELETE, PATCH)
- Enter the **target URL**
- Add custom **headers** (key-value pairs)
- Provide a **JSON body** payload
- Click **Dispatch** to send the request

The request is proxied through DevProxy, which logs the full request/response cycle and displays it in the event list in real-time.

---

### 4. AI Debugger (Gemini)

When you select a failed event (4xx/5xx status), click the **"AI Debug"** button to trigger a real-time analysis:

1. DevProxy constructs a structured prompt with the event's method, URL, headers, payload, response status, and response body
2. Sends it to **Google Gemini 2.0 Flash** via the `@google/generative-ai` SDK
3. **Streams** the response back to the frontend using **Server-Sent Events (SSE)**
4. The frontend renders the response in real-time as **rich markdown** with syntax-highlighted code blocks

The modal shows:
- A **context summary** bar (method, URL, status code)
- The **streaming AI analysis** below with markdown rendering
- A **Re-analyze** button to regenerate the analysis

> **Requires** `GEMINI_API_KEY` in your `.env` file. Without it, the endpoint returns a 501 error.

---

### 5. Real-Time Updates (Socket.io)

DevProxy uses Socket.io to push events to all connected clients instantly:

| Event Name | Payload | Description |
|---|---|---|
| `new_webhook` | `WebhookEvent` object | Emitted when a new webhook is intercepted |
| `new_api_request` | `ApiRequest` object | Emitted when a new API request (manual or auto) is logged |

The frontend's `useSocket` hook listens for these events and updates the Zustand stores, which triggers automatic re-renders. A toast notification appears for each new event.

---

### 6. Light / Dark Mode

DevProxy includes a full **light/dark mode toggle**:

- Default: **Dark mode**
- Click the **Sun/Moon icon** in the navbar to toggle
- Preference is persisted to **localStorage** (`devproxy-theme` key)
- Tailwind's `dark:` variant + CSS custom properties handle all theme switching
- The `JsonViewer` component uses theme-aware syntax highlighting (VS Code dark / GitHub light)

---

## API Reference

### Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/webhooks` | List all webhooks. Query: `?source=stripe&failed=true&limit=50` |
| `GET` | `/api/webhooks/:id` | Get a single webhook by UUID |
| `POST` | `/api/webhooks/:source` | Intercept and forward a webhook |
| `POST` | `/api/webhooks/:id/replay` | Replay a stored webhook to your backend |
| `DELETE` | `/api/webhooks/:id` | Delete a webhook log entry |

### API Requests

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/api-requests` | List all API requests. Query: `?service=httpbin&failed=true&limit=50` |
| `GET` | `/api/api-requests/:id` | Get a single API request by UUID |
| `POST` | `/api/api-requests/proxy` | Proxy a manual API request |
| `POST` | `/api/api-requests/:id/replay` | Replay a stored API request |
| `DELETE` | `/api/api-requests/:id` | Delete an API request log entry |

### AI Debug

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai-debug/prompt` | Generate a debug prompt (returns text) |
| `POST` | `/api/ai-debug/stream` | Stream AI analysis via SSE |

Both accept: `{ "type": "webhook" | "api_request", "eventId": "uuid" }`

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check with uptime |

---

## Frontend Architecture

### State Management (Zustand)

| Store | Responsibility |
|---|---|
| `webhookStore` | CRUD operations for webhook events, filtering, selection |
| `apiRequestStore` | CRUD operations for API request events, filtering, selection |
| `uiStore` | Active tab, sidebar state, AI debug modal state |

### Custom Hooks

| Hook | Purpose |
|---|---|
| `useSocket()` | Manages Socket.io connection, listens for real-time events |
| `useDebugPrompt()` | Controls AI debug modal (open/close with event data) |
| `useTheme()` | Provides `theme` and `toggleTheme` from ThemeContext |

### Key Components

| Component | Description |
|---|---|
| `DashboardPage` | Main page — assembles stats, filters, event list, detail panel |
| `EventCard` | Compact card for each event (source icon, URL, status, badges) |
| `EventDetailPanel` | Full event inspector with headers, payload, action buttons |
| `DebugPromptModal` | AI analysis modal with SSE streaming + markdown rendering |
| `ManualDispatchDrawer` | Slide-over form for manual API dispatch |
| `JsonViewer` | Theme-aware JSON display with syntax highlighting and copy |
| `FilterBar` | Search, error filter, limit, and "+ Manual Dispatch" button |
| `StatsSummary` | Total events, error rate, avg latency, last event time |

---

## Scripts

### Backend

```bash
npm run dev      # Start dev server with hot-reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled production build
```

### Frontend

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

<p align="center">
  <sub>Built with ❤️ using TypeScript, React, Express, MongoDB, Socket.io, and Google Gemini.</sub>
</p>
