import { ENV } from "./env";
import { connectDB } from "./shared/lib/db";
import app from "./app";
import http from "http";
import { initSocket } from "./shared/socket";

const port = ENV.PORT || 3000;

// Start the server regardless of DB connection status
// This ensures Azure health checks pass even during DB outages
const server = http.createServer(app);
initSocket(server);

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
