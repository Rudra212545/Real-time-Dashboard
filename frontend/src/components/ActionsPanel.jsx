import React from "react";
import socket from "../socket";
import CryptoJS from "crypto-js";

function signAction(type, payload) {
  const ts = Date.now();
  const nonce = Math.random().toString(36).substring(2, 12);
  const message = `${type}|${JSON.stringify(payload)}|${ts}|${nonce}`;
  const sig = CryptoJS.HmacSHA256(message, "HMAC_SECRET_987654321").toString(CryptoJS.enc.Hex);
  return { ts, nonce, sig };
}

export default function ActionsPanel() {
    const sendAction = (type, payload) => {
      const { ts, nonce, sig } = signAction(type, payload);
      socket.emit("action", { type, payload, ts, nonce, sig });
    };
    return (
      <div className="card">
        <h2>Actions</h2>
        <button onClick={() => socket.emit("ping", { message: "simple ping from ActionsPanel" })}>
          Ping Backend
        </button>
        <button onClick={() => sendAction("inspect", null)}>Inspect</button>
        <button onClick={() => sendAction("interact", null)}>Interact</button>
        <button onClick={() => sendAction("speak", "hello")}>Speak</button>
        <button onClick={() => sendAction("call_npc", null)}>Call NPC</button>
      </div>
    );
  }
  