import { io } from "socket.io-client";

function getToken() {
  return localStorage.getItem("token");
}

const socket = io("http://localhost:3000", {
  autoConnect: false,
  transports: ["websocket"],
  auth: {
    token: getToken()
  }
});

// expose socket for debugging
window.__socket = socket;

export function refreshSocketAuth() {
  const token = getToken();
  socket.auth = { token };

  if (!token) {
    console.warn("[SOCKET] No token — not connecting");
    return;
  }

  if (!socket.connected) {
    socket.connect();
  }
}

export default socket;
