import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  transports: ["websocket"],
  auth: { token: localStorage.getItem("jwt") || "" }
});

// expose socket 
window.__socket = socket;

export function refreshSocketAuth() {
  socket.auth = { token: localStorage.getItem("jwt") };
  if (!socket.connected) socket.connect();
}

export default socket;
