// backend/auth/socketAuth.js
const { verifyToken } = require("./jwt");

function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    // --- Allow simulated agents WITHOUT token (Day-2 testing) ---
    if (!token) {
      socket.userId = "SimulatedAgent";
      console.log("⚠️  No JWT provided — treating connection as simulated agent");
      return next();
    }

    // --- Normal user JWT flow ---
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid or expired token"));
    }

    socket.userId = decoded.sub;
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
}

module.exports = socketAuthMiddleware;
