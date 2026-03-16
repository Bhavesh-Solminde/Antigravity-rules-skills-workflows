import { ENV } from "./env";
import { connectDB } from "./shared/lib/db";
import app from "./app";
import http from "http";
import { initSocket } from "./shared/socket";
import { installProxyInterceptor } from "./middleware/proxyInterceptor";

const port = ENV.PORT || 3000;

// Start the server regardless of DB connection status
// This ensures Azure health checks pass even during DB outages
const server = http.createServer(app);
initSocket(server);

// Install the proxy interceptor AFTER socket init so getIO() is available
installProxyInterceptor();

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Connect to MongoDB in the background
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    // Don't crash — let health endpoints report DB status
  });




  // test 
  // curl -X POST http://localhost:3000/api/webhooks/stripe \
  // -H "Content-Type: application/json" \
  // -H "x-mock-signature: test_sig_123" \
  // -d '{
  //   "id": "evt_test_123",
  //   "type": "payment_intent.succeeded",
  //   "data": {
  //     "object": {
  //       "amount": 5000,
  //       "currency": "usd",
  //       "status": "succeeded"
  //     }
  //   }
  // }'