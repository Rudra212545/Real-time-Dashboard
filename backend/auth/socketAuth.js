const { verifyToken } = require("./jwt");

function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("Missing token"));

    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Invalid token"));

    socket.userId = decoded.sub;   // IMPORTANT
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
}

module.exports = socketAuthMiddleware;
