import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let webhooks: any[] = [];

// Endpoint to receive webhooks
app.post('/api/webhooks', (req, res) => {
  const event = {
    id: `wh_${uuidv4().substring(0, 8)}`,
    source: req.headers['x-source'] || 'unknown',
    method: 'POST',
    url: req.originalUrl,
    headers: req.headers,
    payload: req.body,
    status: 200,
    responseTime: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString(),
    failed: false,
  };
  
  webhooks.unshift(event);
  io.emit('new_webhook', event);
  res.status(200).json({ status: 'success' });
});

// Endpoint to fetch webhooks
app.get('/api/webhooks', (req, res) => {
  res.json(webhooks);
});

// Endpoint to replay a webhook
app.post('/api/webhooks/:id/replay', (req, res) => {
  const { id } = req.params;
  const webhook = webhooks.find(w => w.id === id);
  if (webhook) {
    // In a real app, you'd trigger the actual downstream request here
    res.json({ message: 'Replayed' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
