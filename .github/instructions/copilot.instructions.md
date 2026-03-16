# DevProxy — GitHub Copilot Instructions

## What This Project Is

DevProxy is a full-stack **API & Webhook Debugger** — a middleware proxy tool
for developers debugging payment integrations (Razorpay, Stripe, etc.).

It sits between payment providers and the developer's own backend server:

```
WEBHOOK FLOW:
Razorpay/Stripe → DevProxy Backend → Developer's Backend
                        ↓
                  MongoDB (log)
                        ↓
                  Socket.io → React Frontend (live UI)

API REQUEST FLOW:
Developer's Backend → DevProxy Backend → Razorpay/Stripe API
                             ↓
                       MongoDB (log)
                             ↓
                       Socket.io → React Frontend (live UI)
```

---

## Monorepo Structure

```
root/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── webhooks/         ← webhook intercept + forward
│       │   ├── api-requests/     ← outbound API proxy
│       │   └── ai-debug/         ← AI prompt generator
│       ├── shared/
│       │   ├── socket.ts         ← singleton Socket.io instance
│       │   ├── asyncHandler.ts   ← wraps async route handlers
│       │   ├── errorMiddleware.ts← global error handler
│       │   └── parseSource.ts    ← extracts service name from URL
│       ├── app.ts                ← Express config
│       ├── server.ts             ← entry point
│       └── env.ts                ← env validation
└── frontend/
    └── src/
        ├── components/           ← UI components
        ├── store/                ← Zustand slices
        ├── hooks/                ← useSocket, useDebugPrompt
        ├── pages/                ← DashboardPage, NotFoundPage
        ├── layouts/              ← DashboardLayout
        ├── types/                ← shared TypeScript interfaces
        └── lib/
            └── axios.ts          ← Axios instance with interceptors
```

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.io
- **HTTP client:** axios (for forwarding requests)
- **ID generation:** uuid (uuidv4)
- **Entry:** server.ts → app.ts

### Frontend
- **Bundler:** Vite
- **Framework:** React + TypeScript
- **Styling:** TailwindCSS v4 ONLY — never use v3 syntax or @apply
- **State:** Zustand
- **HTTP:** Axios (never call axios directly from components — always through Zustand actions)
- **Real-time:** socket.io-client
- **Icons:** lucide-react ONLY
- **Dates:** date-fns ONLY — never use Date.toLocaleString()
- **Toasts:** react-hot-toast

---

## Critical Rules — Always Follow These

### TypeScript
- NEVER use `any` type — use `unknown` and narrow properly
- ALL Mongoose queries must be typed with the interface generic
- ALL frontend interfaces must match backend interfaces exactly

### Backend
- ALL async route handlers must be wrapped in `asyncHandler()`
- ALL controllers must have try/catch — no unhandled promise rejections
- Socket.io instance must ONLY come from `getIO()` in `shared/socket.ts` — never create a new instance
- Authorization header values must ALWAYS be masked as `"Bearer ***"` in AI debug prompts
- `BACKEND_TARGET_URL` is the developer's own backend server — all intercepted webhooks are forwarded here

### Frontend
- Components must NEVER call axios directly — always through Zustand store actions
- JSON payloads must always be safely parsed with try/catch before display
- TailwindCSS v4 only — no v3 syntax, no @apply in component files

---

## Key Concepts

### BACKEND_TARGET_URL
This is the developer's OWN backend server (e.g. `http://localhost:3000`).
When DevProxy intercepts a webhook from Razorpay, it:
1. Logs it to MongoDB
2. Emits it to the frontend via Socket.io
3. Forwards it to BACKEND_TARGET_URL so the developer's app still works

### parseSource(input)
Utility in `shared/parseSource.ts` that extracts the service name:
- `/webhooks/razorpay` → `"razorpay"`
- `https://api.razorpay.com/v1/payments` → `"razorpay"`
- Fallback → `"unknown"`

### Socket Events
Only two events are emitted:
- `"new_webhook"` — payload: WebhookEvent document
- `"new_api_request"` — payload: ApiRequest document

### failed flag
- WebhookEvent: `failed = responseStatus >= 400` (based on developer's backend response)
- ApiRequest: `failed = responseStatus >= 400` (based on Razorpay/Stripe response)

### Replay behaviour
- Webhook replay: always uses `method: POST` (hardcoded), forwards to BACKEND_TARGET_URL
- API request replay: uses `original.method` exactly, forwards to original endpoint
- Both: create a BRAND NEW MongoDB document with new UUID and new timestamp
- Both: still save a record even if the target is down (status 502, failed: true)

---

## MongoDB Models

### WebhookEvent
```typescript
interface IWebhookEvent {
  id: string                        // uuidv4
  source: string                    // "razorpay" | "stripe" etc
  method: string                    // HTTP method
  url: string                       // full request URL
  headers: Record<string, string>
  payload: Record<string, unknown> | string
  status: number                    // status from developer's backend
  responseTime: number              // ms
  timestamp: Date
  failed: boolean                   // status >= 400
}
```

### ApiRequest
```typescript
interface IApiRequest {
  id: string                        // uuidv4
  method: string
  endpoint: string                  // full Razorpay/Stripe API URL
  requestHeaders: Record<string, string>
  requestPayload: Record<string, unknown> | string
  responseStatus: number            // status from Razorpay/Stripe
  responseBody: Record<string, unknown> | string
  responseTime: number              // ms
  timestamp: Date
  failed: boolean                   // responseStatus >= 400
  service: string                   // parsed from hostname
}
```

---

## API Routes

### Webhooks
```
POST   /api/webhooks/:source         → interceptWebhook
GET    /api/webhooks                 → getAllWebhooks (?source=&failed=&limit=)
GET    /api/webhooks/:id             → getWebhookById
POST   /api/webhooks/:id/replay      → replayWebhook
DELETE /api/webhooks/:id             → deleteWebhook
```

### API Requests
```
POST   /api/api-requests/proxy       → proxyApiRequest
GET    /api/api-requests             → getAllApiRequests (?service=&failed=&limit=)
GET    /api/api-requests/:id         → getApiRequestById
POST   /api/api-requests/:id/replay  → replayApiRequest
DELETE /api/api-requests/:id         → deleteApiRequest
```

### AI Debug
```
POST   /api/ai-debug/prompt          → generateDebugPrompt
```

### Health
```
GET    /health                       → { status: "ok" }
```

---

## Zustand Stores

### webhookStore
```
State:   webhooks[], selectedWebhook, loading, filters
Actions: fetchWebhooks, selectWebhook, addWebhook,
         replayWebhook, deleteWebhook, clearSelected, setFilters
```

### apiRequestStore
```
State:   apiRequests[], selectedRequest, loading, filters
Actions: fetchApiRequests, selectRequest, addApiRequest,
         sendProxyRequest, replayApiRequest, deleteApiRequest,
         clearSelected, setFilters
```

### uiStore
```
State:   activeTab, sidebarOpen, debugPrompt, debugPromptLoading
Actions: setActiveTab, toggleSidebar,
         generateDebugPrompt, clearDebugPrompt
```

---

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/api-debugger
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
BACKEND_TARGET_URL=http://localhost:3000   ← developer's own backend
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## Component Hierarchy (Frontend)

```
App.tsx (Router)
└── DashboardPage
    └── DashboardLayout
        ├── Navbar
        │   └── ConnectionStatus   ← pulsing dot, reads useSocket
        ├── StatsSummary           ← 4 stat cards from store
        ├── FilterBar              ← calls setFilters on store
        ├── EventList              ← scrollable list of EventCards
        │   └── EventCard
        │       ├── MethodBadge
        │       ├── StatusBadge
        │       └── TimestampDisplay
        ├── EventDetailPanel       ← right panel, selected event
        │   └── JsonViewer         ← collapsible JSON blocks
        ├── ProxyRequestForm       ← api-requests tab only
        └── DebugPromptModal       ← conditional overlay
```

---

## How to Add a New Feature

1. **Backend module** → create in `src/modules/<name>/`
   - `<name>.model.ts` — Mongoose schema
   - `<name>.controller.ts` — wrap all handlers in `asyncHandler()`
   - `<name>.routes.ts` — Express router
2. **Mount route** → add `app.use("/api", newRoutes)` in `app.ts`
3. **Frontend store** → add Zustand slice in `store/`
4. **Frontend component** → add in `components/`, style with TailwindCSS v4
5. **Types** → add interfaces to `types/index.ts`
6. **Socket events** → only emit from controllers via `getIO().emit()`

---

## Common Mistakes to Avoid

- Never create a new Socket.io instance — always use `getIO()` from `shared/socket.ts`
- Never use `any` type — Copilot will suggest it, always reject it
- Never call axios from a React component — route it through the Zustand store
- Never use TailwindCSS v3 syntax or `@apply` — this project uses v4
- Never use `Date.toLocaleString()` — always use `date-fns` format functions
- Never expose raw Authorization header values in AI prompts — always mask as `"Bearer ***"`
- Never update the original MongoDB document on replay — always create a new one