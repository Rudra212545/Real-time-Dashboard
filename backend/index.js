const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const { initSocket } = require("./socket");
require("dotenv").config();

const app = express();
const server = createServer(app);

// middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// routes
app.use("/auth", authRoutes);

// db
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

// sockets
initSocket(server);

// server
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
