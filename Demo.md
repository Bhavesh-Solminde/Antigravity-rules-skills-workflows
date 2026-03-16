# 🎬 DevProxy — Demo Guide
> How to use and demonstrate both **Webhook Interception** and **API Request Proxying**

---

## 🗂️ Table of Contents

1. [Pre-Demo Setup Checklist](#1-pre-demo-setup-checklist)
2. [Understanding the Two Modes](#2-understanding-the-two-modes)
3. [Demo A — Webhook Interception (Incoming Traffic)](#3-demo-a--webhook-interception-incoming-traffic)
4. [Demo B — API Request Proxying (Outgoing Traffic)](#4-demo-b--api-request-proxying-outgoing-traffic)
5. [Demo C — Request Replay](#5-demo-c--request-replay)
6. [Demo D — AI Debug Prompt Generator](#6-demo-d--ai-debug-prompt-generator)
7. [Full Hackathon Judge Demo Script](#7-full-hackathon-judge-demo-script)
8. [Simulating Requests Without Razorpay](#8-simulating-requests-without-razorpay)

---

## 1. Pre-Demo Setup Checklist

Before starting any demo, make sure all of this is running:

```bash
# Terminal 1 — Start MongoDB (if running locally)
mongod

# Terminal 2 — Start the backend
cd backend
npm run dev
# Should print: Server running on port 5000 | MongoDB connected

# Terminal 3 — Start the frontend
cd frontend
npm run dev
# Should print: Local: http://localhost:5173
```

Open your browser at: **http://localhost:5173**

You should see the DevProxy dashboard with:
- ✅ A green **"● Live"** connection status in the navbar (Socket.io connected)
- Two tabs at the top: **Webhooks** and **API Requests**
- Empty event lists with the "Waiting for incoming traffic..." message

---

## 2. Understanding the Two Modes

DevProxy captures traffic in **two directions**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   INCOMING (Webhook Mode)                                   │
│   External Service → DevProxy → Your Backend               │
│   e.g. Razorpay sends a payment.success webhook            │
│                                                             │
│   OUTGOING (API Request Mode)                               │
│   Your Backend → DevProxy → External API                   │
│   e.g. Your code calls Razorpay to create an order         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Think of DevProxy as a **CCTV camera** placed between your app and the outside world.  
It watches all traffic, records it, and lets you replay anything.

---

## 3. Demo A — Webhook Interception (Incoming Traffic)

### What this simulates
> Razorpay (or Stripe / GitHub) fires a webhook to notify your backend  
> of a payment, refund, or event. DevProxy catches it before it hits your backend.

---

### Step 1 — Open the Webhooks Tab

Click the **"Webhooks"** tab in the navbar.  
The event list on the left should be empty.

---

### Step 2 — Simulate a Webhook Using cURL

Open a new terminal and run this command:

```bash
curl -X POST http://localhost:5000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: test_sig_abc123" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_OFj3jRmSpv123",
          "amount": 50000,
          "currency": "INR",
          "status": "captured",
          "method": "upi",
          "email": "customer@example.com"
        }
      }
    }
  }'
```

---

### Step 3 — Watch the Dashboard Update in Real Time

Without refreshing the page, you will see:

- A new **EventCard** appear in the left panel instantly (Socket.io push)
- The card shows: `POST` badge · `razorpay` source · `200` status · response time in ms
- The **Stats bar** at the top updates: Total Events becomes 1

---

### Step 4 — Inspect the Event

Click the event card. The right panel shows:

| Section | What you see |
|---|---|
| **Overview** | Method, URL, Status, Response Time, Timestamp |
| **Request Headers** | Includes `X-Razorpay-Signature`, `Content-Type` |
| **Request Payload** | Full JSON body from Razorpay |

Click the **copy icon** on any JSON block to copy it to clipboard.

---

### Step 5 — Simulate a Failed Webhook

Now send a webhook that will cause a 400 error (e.g., malformed payload):

```bash
curl -X POST http://localhost:5000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.failed",
    "payload": null
  }'
```

You will see:
- A new card with a **red left border** indicating failure
- Status badge shows **400** in orange/red
- The Stats bar's "Failed Events" counter increments

---

## 4. Demo B — API Request Proxying (Outgoing Traffic)

### What this simulates
> Your backend code is making a call to Razorpay's API to create a payment order.  
> DevProxy intercepts this outgoing call, records everything, and forwards it.

---

### Step 1 — Open the API Requests Tab

Click the **"API Requests"** tab in the navbar.  
You will see the **ProxyRequestForm** at the top of the page.

---

### Step 2 — Fill in the Proxy Form

Fill the form with these details:

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Endpoint URL** | `https://jsonplaceholder.typicode.com/posts` |
| **Headers** | Key: `Content-Type` · Value: `application/json` |
| **Payload** | See below |

```json
{
  "title": "Test Payment Order",
  "body": "Amount: 50000 INR",
  "userId": 1
}
```

> 💡 We use `jsonplaceholder.typicode.com` as a safe public API for demo purposes.  
> In production, this would be `https://api.razorpay.com/v1/orders`

Click **"Send Request"**.

---

### Step 3 — Watch the Result

- A new EventCard appears in the list: `POST` · `jsonplaceholder.typicode.com` · `201 Created`
- Click the card to inspect:

| Section | What you see |
|---|---|
| **Overview** | Endpoint, method, status, latency |
| **Request Headers** | Headers your backend sent |
| **Request Payload** | The body that was sent |
| **Response Body** | Full response from the external API |

---

### Step 4 — Simulate a Failing Outgoing Request

Fill the form with an endpoint that returns an error:

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Endpoint URL** | `https://jsonplaceholder.typicode.com/posts/99999/comments` |
| **Payload** | `{ "amount": null, "currency": "INR" }` |

Click **"Send Request"**.

You will see a **red-bordered card** with a `404` or `400` status — simulating exactly what happens when your backend sends a bad request to Razorpay (e.g., missing amount field).

---

### Step 5 — Try Invalid JSON in the Form

Type this in the Payload field on purpose:

```
{ amount: null, currency }
```

The form will show an **inline error**: `"Invalid JSON — please fix the payload"` and block submission. This prevents bad requests from being sent.

---

## 5. Demo C — Request Replay

### What this demonstrates
> A previous request failed. You have fixed your code. Now you want to re-fire  
> the exact same request without setting up the webhook trigger again.

---

### Replay a Webhook

1. Click any **EventCard** in the Webhooks tab
2. In the right panel, click the **"Replay"** button
3. Watch a **brand new EventCard** appear at the top of the list with a fresh timestamp
4. The replayed event is saved as a new record in MongoDB — original is untouched

---

### Replay an API Request

1. Click any EventCard in the API Requests tab
2. Click **"Replay"** in the detail panel
3. DevProxy re-sends the exact same method + endpoint + headers + payload
4. New card appears with the new response (status may differ if you fixed the backend)

---

### Why this is powerful for judges

> "Without DevProxy, to re-test a failed Razorpay webhook, a developer would need  
> to go into the Razorpay dashboard, manually trigger a test webhook, wait for it  
> to arrive, and hope the logs are still there. With DevProxy, they click Replay —  
> it takes 1 second."

---

## 6. Demo D — AI Debug Prompt Generator

### What this demonstrates
> A request has failed. The developer doesn't know why. DevProxy generates  
> a ready-to-paste prompt for ChatGPT or Claude explaining the exact failure.

---

### Step 1 — Select a Failed Event

Click any red-bordered EventCard (either tab).

---

### Step 2 — Generate the Prompt

In the detail panel, click **"Generate AI Prompt"**.

A modal appears with a fully structured prompt that looks like this:

```
An API request failed.

Endpoint: POST https://api.razorpay.com/v1/orders
Service: razorpay
Method: POST

Payload:
{
  "amount": null,
  "currency": "INR"
}

Headers:
Authorization: Bearer ***
Content-Type: application/json

Response Status: 400
Response Body:
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "amount is not a valid integer"
  }
}
Response Time: 312ms

You are a Node.js backend expert. Identify the root cause of this failure
and suggest a precise fix with corrected code. Be specific about which field
or header is wrong and why.
```

---

### Step 3 — Copy and Use

Click **"Copy Prompt"** → paste into ChatGPT, Claude, or Gemini → get instant fix suggestions.

Notice that `Authorization: Bearer ***` is **masked automatically** — you never leak API keys.

---

## 7. Full Hackathon Judge Demo Script

Follow this exact sequence for a 5-minute live demo:

```
⏱ 0:00 — Open dashboard, show "● Live" status
⏱ 0:30 — Run cURL webhook command, show real-time card appear
⏱ 1:00 — Click event, walk through payload + headers panel
⏱ 1:45 — Run failed webhook cURL, show red card + failed badge
⏱ 2:15 — Switch to API Requests tab
⏱ 2:20 — Fill ProxyRequestForm, send a successful request, inspect response
⏱ 3:00 — Send a failing request (null amount), show red card
⏱ 3:30 — Click "Generate AI Prompt", show the modal, explain masking
⏱ 4:00 — Click "Replay" on the failed event, show new card appearing
⏱ 4:30 — Show Stats Summary: X total, Y failed, avg latency
⏱ 5:00 — "That's the full debugging lifecycle — capture, inspect, fix, replay."
```

---

## 8. Simulating Requests Without Razorpay

You do not need a real Razorpay or Stripe account to demo this.  
Use these free public APIs as stand-ins:

| Simulates | Use this endpoint | Expected result |
|---|---|---|
| Payment creation (success) | `POST https://jsonplaceholder.typicode.com/posts` | `201 Created` |
| Payment fetch (success) | `GET https://jsonplaceholder.typicode.com/posts/1` | `200 OK` |
| Bad request (failure) | `POST https://httpstat.us/400` | `400 Bad Request` |
| Server error (failure) | `POST https://httpstat.us/500` | `500 Internal Server Error` |
| Timeout simulation | `GET https://httpstat.us/200?sleep=3000` | `200` after 3s delay |
| Webhook from "Stripe" | `curl POST /api/webhooks/stripe` with any body | Captured as stripe source |
| Webhook from "GitHub" | `curl POST /api/webhooks/github` with any body | Captured as github source |

---

### Quick cURL Reference Card

```bash
# Successful Razorpay-style webhook
curl -X POST http://localhost:5000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: sig_abc123" \
  -d '{"event":"payment.captured","payload":{"amount":50000,"currency":"INR"}}'

# Failed Stripe-style webhook
curl -X POST http://localhost:5000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.failed","data":null}'

# GitHub push event webhook
curl -X POST http://localhost:5000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","pusher":{"name":"dev"}}'

# Simulate backend calling Razorpay (via proxy form or direct)
curl -X POST http://localhost:5000/api/api-requests/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "endpoint": "https://jsonplaceholder.typicode.com/posts",
    "headers": { "Content-Type": "application/json" },
    "payload": { "amount": 50000, "currency": "INR" }
  }'
```

---

> **Built for the hackathon.** DevProxy gives developers full visibility into  
> the black box between their app and external payment APIs.