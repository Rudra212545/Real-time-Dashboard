const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const { initSocket } = require("./socket");
require("dotenv").config();
const { setupEngineSocket } = require("./engine/engine_socket");
const jobQueue = require("./jobQueue");

// Clear job queue on startup
jobQueue.clearAllJobs();
console.log("[STARTUP] Job queue cleared");


const app = express();
const server = createServer(app);

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// routes
app.use("/auth", authRoutes);

// db (optional - system works without MongoDB)
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb://localhost:27017/microbridge') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo connected"))
    .catch(err => {
      console.warn("MongoDB connection failed (non-critical):", err.message);
      console.log("System will continue without database persistence");
    });
} else {
  console.log("MongoDB disabled - using in-memory state only");
}

// sockets
const io = initSocket(server);
setupEngineSocket(io, jobQueue);

const PORT = process.env.PORT || 3000;

if (!process.env.PORT) {
  console.warn("[CONFIG] PORT not set in environment, using default: 5000");
}

// server
server.listen(PORT, () => {
  console.log(`server running at PORT : ${PORT}`);
});
