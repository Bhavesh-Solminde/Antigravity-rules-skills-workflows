const http = require('http');
const express = require('express');
const cors = require('cors');

// ─────────────────────────────────────────────────────────────────────────────
// simulate_api_traffic.js
//
// A standalone Express server on port 4000 that makes outgoing API requests
// to REAL external APIs on the internet —  routed through DevProxy (port 3000).
//
// DevProxy intercepts each request, saves full request/response details to
// MongoDB, emits via Socket.io, and then forwards to the actual external API.
//
// Flow:  This Server (4000) → DevProxy (3000) → External API → Response
// ─────────────────────────────────────────────────────────────────────────────

const PORT = 4000;
const DEVPROXY_URL = 'http://localhost:3000/api/api-requests/proxy';

const app = express();
app.use(cors());
app.use(express.json());

// ── Define realistic external API call scenarios ────────────────────────────

const scenarios = [
  // --- Payment Gateway: Stripe ---
  {
    service: 'stripe',
    method: 'POST',
    endpoint: 'https://api.stripe.com/v1/payment_intents',
    headers: {
      'Authorization': 'Bearer sk_test_mock_stripe_key',
      'Stripe-Version': '2023-10-16',
    },
    generatePayload: () => ({
      amount: Math.floor(Math.random() * 100000),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { order_id: `ord_${Math.random().toString(36).substring(7)}` },
    }),
  },
  {
    service: 'stripe',
    method: 'GET',
    endpoint: `https://api.stripe.com/v1/charges/ch_${Math.random().toString(36).substring(7)}`,
    headers: {
      'Authorization': 'Bearer sk_test_mock_stripe_key',
    },
    generatePayload: () => ({}),
  },

  // --- Payment Gateway: Razorpay ---
  {
    service: 'razorpay',
    method: 'POST',
    endpoint: 'https://api.razorpay.com/v1/orders',
    headers: {
      'Authorization': 'Basic bW9ja19rZXk6bW9ja19zZWNyZXQ=',
      'X-Razorpay-Account': 'acc_12345',
    },
    generatePayload: () => ({
      amount: Math.floor(Math.random() * 50000),
      currency: 'INR',
      receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
      notes: { description: 'Order for product XYZ' },
    }),
  },
  {
    service: 'razorpay',
    method: 'POST',
    endpoint: 'https://api.razorpay.com/v1/refunds',
    headers: {
      'Authorization': 'Basic bW9ja19rZXk6bW9ja19zZWNyZXQ=',
    },
    generatePayload: () => ({
      payment_id: `pay_${Math.random().toString(36).substring(7)}`,
      amount: Math.floor(Math.random() * 10000),
      notes: { reason: 'Customer requested refund' },
    }),
  },

  // --- Messaging: Twilio ---
  {
    service: 'twilio',
    method: 'POST',
    endpoint: 'https://api.twilio.com/2010-04-01/Accounts/ACmock/Messages.json',
    headers: {
      'Authorization': 'Basic QUNtb2NrOm1vY2tfdG9rZW4=',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    generatePayload: () => ({
      To: '+919876543210',
      From: '+15005550006',
      Body: `OTP: ${Math.floor(100000 + Math.random() * 900000)}`,
    }),
  },

  // --- Email: SendGrid ---
  {
    service: 'sendgrid',
    method: 'POST',
    endpoint: 'https://api.sendgrid.com/v3/mail/send',
    headers: {
      'Authorization': 'Bearer SG.mock_sendgrid_api_key',
    },
    generatePayload: () => ({
      personalizations: [{ to: [{ email: 'test@example.com' }] }],
      from: { email: 'noreply@myapp.com' },
      subject: 'Your order confirmation',
      content: [{ type: 'text/plain', value: `Order #${Math.floor(Math.random() * 9999)} confirmed!` }],
    }),
  },

  // --- CRM: HubSpot ---
  {
    service: 'hubspot',
    method: 'POST',
    endpoint: 'https://api.hubapi.com/crm/v3/objects/contacts',
    headers: {
      'Authorization': 'Bearer mock_hubspot_pat',
    },
    generatePayload: () => ({
      properties: {
        email: `user${Math.floor(Math.random() * 9999)}@example.com`,
        firstname: 'Test',
        lastname: 'User',
        phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      },
    }),
  },

  // --- Internal Microservice ---
  {
    service: 'inventory-service',
    method: 'PATCH',
    endpoint: 'http://inventory.internal/api/v1/products/stock',
    headers: {
      'X-Service-Key': 'internal-secret-token',
      'X-Trace-ID': `trace-${Math.random().toString(36).substring(7)}`,
    },
    generatePayload: () => ({
      product_id: `prod_${Math.random().toString(36).substring(7)}`,
      quantity_delta: Math.floor(-50 + Math.random() * 100),
    }),
  },

  // --- Analytics: Mixpanel ---
  {
    service: 'mixpanel',
    method: 'POST',
    endpoint: 'https://api.mixpanel.com/track',
    headers: {
      'Authorization': 'Basic bW9ja19taXhwYW5lbF90b2tlbg==',
    },
    generatePayload: () => ({
      event: ['checkout_started', 'payment_completed', 'signup', 'page_view'][Math.floor(Math.random() * 4)],
      properties: {
        distinct_id: `user_${Math.floor(Math.random() * 9999)}`,
        time: Math.floor(Date.now() / 1000),
        $browser: 'Chrome',
      },
    }),
  },
];

// ── Send a single request through DevProxy ──────────────────────────────────

function sendViaDevProxy(scenario) {
  return new Promise((resolve, reject) => {
    const proxyPayload = JSON.stringify({
      method: scenario.method,
      endpoint: scenario.endpoint,
      headers: scenario.headers,
      payload: scenario.generatePayload(),
      service: scenario.service,
      source: 'auto',
    });

    const url = new URL(DEVPROXY_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(proxyPayload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const statusEmoji = res.statusCode < 300 ? '✅' : res.statusCode < 500 ? '⚠️ ' : '❌';
        const logLine = `${statusEmoji} [${new Date().toISOString()}] ${scenario.method} ${scenario.service} → ${scenario.endpoint} | DevProxy Status: ${res.statusCode}`;
        console.log(logLine);

        let parsed = {};
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }
        resolve({
          service: scenario.service,
          method: scenario.method,
          endpoint: scenario.endpoint,
          devProxyStatus: res.statusCode,
          response: parsed,
        });
      });
    });

    req.on('error', (e) => {
      const errMsg = `❌ [${new Date().toISOString()}] FAILED ${scenario.service}: ${e.message}`;
      console.error(errMsg);
      reject(new Error(errMsg));
    });

    req.write(proxyPayload);
    req.end();
  });
}

// ── Auto-simulation state ───────────────────────────────────────────────────

let simulationInterval = null;
let requestCount = 0;

function startAutoSimulation(intervalMs = 3000) {
  if (simulationInterval) return false; // already running

  simulationInterval = setInterval(() => {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    sendViaDevProxy(scenario).catch(() => { /* logged inside */ });
    requestCount++;
  }, intervalMs);

  // Fire one immediately
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  sendViaDevProxy(scenario).catch(() => {});
  requestCount++;

  return true;
}

function stopAutoSimulation() {
  if (!simulationInterval) return false;
  clearInterval(simulationInterval);
  simulationInterval = null;
  return true;
}

// ── Express Routes ──────────────────────────────────────────────────────────

// Health / info
app.get('/', (_req, res) => {
  res.json({
    name: 'API Traffic Simulator',
    port: PORT,
    devProxy: DEVPROXY_URL,
    services: scenarios.map((s) => s.service).filter((v, i, a) => a.indexOf(v) === i),
    simulation: {
      running: !!simulationInterval,
      totalRequestsSent: requestCount,
    },
  });
});

// Fire a single random request through DevProxy
app.post('/simulate', async (_req, res) => {
  try {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const result = await sendViaDevProxy(scenario);
    requestCount++;
    res.json({ success: true, message: 'Request sent through DevProxy', result });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

// Fire a specific service request through DevProxy
app.post('/simulate/:service', async (req, res) => {
  const serviceName = req.params.service.toLowerCase();
  const matching = scenarios.filter((s) => s.service.toLowerCase() === serviceName);

  if (matching.length === 0) {
    return res.status(404).json({
      success: false,
      error: `Unknown service: ${serviceName}`,
      available: scenarios.map((s) => s.service).filter((v, i, a) => a.indexOf(v) === i),
    });
  }

  try {
    const scenario = matching[Math.floor(Math.random() * matching.length)];
    const result = await sendViaDevProxy(scenario);
    requestCount++;
    res.json({ success: true, message: `Request sent for ${serviceName}`, result });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

// Fire a burst of requests (default 5)
app.post('/simulate-burst', async (req, res) => {
  const count = Math.min(parseInt(req.body.count) || 5, 20); // cap at 20
  const results = [];
  const errors = [];

  const promises = Array.from({ length: count }, () => {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return sendViaDevProxy(scenario)
      .then((r) => results.push(r))
      .catch((e) => errors.push(e.message));
  });

  await Promise.allSettled(promises);
  requestCount += count;

  res.json({
    success: true,
    message: `Burst of ${count} requests sent through DevProxy`,
    sent: results.length,
    failed: errors.length,
    results,
    errors,
  });
});

// Start continuous auto-simulation
app.post('/simulate-auto/start', (req, res) => {
  const intervalMs = Math.max(parseInt(req.body.interval) || 3000, 1000); // min 1s
  const started = startAutoSimulation(intervalMs);

  if (started) {
    console.log(`🔄 Auto-simulation started (interval: ${intervalMs}ms)`);
    res.json({ success: true, message: `Auto-simulation started (every ${intervalMs}ms)` });
  } else {
    res.json({ success: false, message: 'Auto-simulation is already running' });
  }
});

// Stop auto-simulation
app.post('/simulate-auto/stop', (_req, res) => {
  const stopped = stopAutoSimulation();

  if (stopped) {
    console.log('⏹️  Auto-simulation stopped');
    res.json({ success: true, message: 'Auto-simulation stopped', totalRequestsSent: requestCount });
  } else {
    res.json({ success: false, message: 'Auto-simulation is not running' });
  }
});

// Status
app.get('/status', (_req, res) => {
  res.json({
    running: !!simulationInterval,
    totalRequestsSent: requestCount,
    devProxy: DEVPROXY_URL,
  });
});

// ── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           🚀 API Traffic Simulator — Port 4000         ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  DevProxy target:  ${DEVPROXY_URL}  ║`);
  console.log('║                                                        ║');
  console.log('║  Endpoints:                                            ║');
  console.log('║    GET  /                   → Server info              ║');
  console.log('║    POST /simulate           → Fire 1 random request    ║');
  console.log('║    POST /simulate/:service  → Fire for specific svc    ║');
  console.log('║    POST /simulate-burst     → Fire N requests at once  ║');
  console.log('║    POST /simulate-auto/start→ Start auto-simulation    ║');
  console.log('║    POST /simulate-auto/stop → Stop auto-simulation     ║');
  console.log('║    GET  /status             → Simulation status        ║');
  console.log('║                                                        ║');
  console.log('║  Services: stripe, razorpay, twilio, sendgrid,         ║');
  console.log('║            hubspot, inventory-service, mixpanel        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});
