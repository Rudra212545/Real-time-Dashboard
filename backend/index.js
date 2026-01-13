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
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
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
const PORT = process.env.PORT;
// server
server.listen(PORT, () => {
  console.log(`server running at PORT : ${PORT}`);
});
