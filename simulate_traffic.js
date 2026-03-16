const http = require('http');

// Start a local mock server on port 4000 to receive the forwarded requests
// and return various status codes (200, 400, 500)
const MOCK_SERVER_PORT = 8080;
const mockServer = http.createServer((req, res) => {
  // Collect the data just to consume the stream
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Determine random status code
    const r = Math.random();
    let status = 200;

    if (r < 0.6) {
      status = 200; // 60% success
    } else if (r < 0.8) {
      status = 400; // 20% bad request
    } else {
      status = 500; // 20% internal server error
    }

    res.writeHead(status, { 'Content-Type': 'application/json' });

    // Return a mock response body
    if (status === 200) {
      res.end(JSON.stringify({ success: true, message: 'Webhook received successfully' }));
    } else if (status === 400) {
      res.end(JSON.stringify({ error: 'Bad Request', details: 'Invalid payload format' }));
    } else {
      res.end(JSON.stringify({ error: 'Internal Server Error', details: 'Something went wrong processing the webhook' }));
    }

    console.log(`[Mock Server] Received forwarded request for ${req.url}, returning ${status}`);
  });
});

mockServer.listen(MOCK_SERVER_PORT, () => {
  console.log(`\n✅ Mock Target Server listening on port ${MOCK_SERVER_PORT}`);
  console.log('   (It will return random 200, 400, and 500 status codes)\n');
});

const TARGET_URL = 'http://localhost:3000/api/webhooks';

const providers = [
  {
    name: 'stripe',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 't=1628100514,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd',
    },
    generatePayload: () => ({
      id: `evt_test_${Math.random().toString(36).substring(7)}`,
      object: 'event',
      type: Math.random() > 0.5 ? 'payment_intent.succeeded' : 'charge.failed',
      data: {
        object: {
          amount: Math.floor(Math.random() * 10000),
          currency: 'usd',
          status: 'succeeded',
        },
      },
    }),
  },
  {
    name: 'razorpay',
    headers: {
      'Content-Type': 'application/json',
      'X-Razorpay-Signature': 'mock_signature_abc123',
    },
    generatePayload: () => ({
      entity: 'event',
      account_id: 'acc_12345',
      event: Math.random() > 0.5 ? 'payment.captured' : 'order.paid',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_${Math.random().toString(36).substring(7)}`,
            amount: Math.floor(Math.random() * 5000),
            currency: 'INR',
          },
        },
      },
    }),
  },
  {
    name: 'github',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': Math.random() > 0.5 ? 'push' : 'pull_request',
      'X-Hub-Signature-256': 'sha256=mock_signature_xyz',
    },
    generatePayload: () => ({
      action: 'opened',
      number: Math.floor(Math.random() * 100),
      repository: {
        id: 123456,
        name: 'webhook-debugger',
        full_name: 'test/webhook-debugger',
      },
      sender: {
        login: 'testuser',
        type: 'User',
      },
    }),
  },
  {
    name: 'custom_source_errors',
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Auth': 'secret-token',
    },
    generatePayload: () => ({
      message: 'This simulates varying data, sometimes malformed',
      malformed: Math.random() > 0.8,
      timestamp: Date.now(),
    }),
  }
];

const methods = ['POST', 'POST', 'POST', 'PUT']; // mostly POSTs, occasionally PUT

function sendRequest() {
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const payload = JSON.stringify(provider.generatePayload());

  const url = new URL(`${TARGET_URL}/${provider.name}`);

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: method,
    headers: {
      ...provider.headers,
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] Sent ${method} to /${provider.name} -> Status: ${res.statusCode}`);
    });
  });

  req.on('error', (e) => {
    console.error(`[${new Date().toISOString()}] Request failed for /${provider.name}: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

console.log('Starting constant webhook traffic simulation...');
console.log(`Targeting: ${TARGET_URL}/:source`);
console.log('Press Ctrl+C to stop.\n');

// Send initial request immediately
sendRequest();

// Then send a request every 2-5 seconds
setInterval(() => {
  sendRequest();
}, Math.floor(Math.random() * 3000) + 2000);