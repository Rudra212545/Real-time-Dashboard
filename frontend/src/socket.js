import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false, // <--- IMPORTANT
  transports: ["websocket"]
});

export function connectSocket() {
  const token = localStorage.getItem("jwt");
  socket.auth = { token };
  socket.connect();
}

export default socket;
