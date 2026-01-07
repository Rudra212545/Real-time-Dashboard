// backend/auth/socketAuth.js
const { verifyToken } = require("./jwt");

function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    //  Allow simulated agents WITHOUT token 
    if (!token) {
      socket.userId = "SimulatedAgent";
      socket.role = "agent"; // NOT admin, NOT user
      socket.isSimulated = true;
      console.log("⚠️ No JWT — simulated agent connection");
      return next();
    }

    // Normal user JWT flow
    const decoded = verifyToken(token);
    if (!decoded || !decoded.sub) {
      return next(new Error("Invalid token payload"));
    }

    // user identity
    socket.userId = decoded.sub;

    // 🔥 role extraction — THIS is the key
    socket.role = Array.isArray(decoded.roles)
      ? decoded.roles[0]
      : "user";

    socket.user = decoded;
    socket.isSimulated = false;

    next();

  } catch (err) {
    next(new Error("Authentication error"));
  }
}

module.exports = socketAuthMiddleware;
