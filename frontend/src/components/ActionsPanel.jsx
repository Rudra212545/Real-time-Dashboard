import React, { useState } from "react";
import socket from "../socket";
import CryptoJS from "crypto-js";

// --- SIGNING FUNCTION ---
function signAction(type, payload) {
  const ts = Date.now();
  const nonce = Math.random().toString(36).substring(2, 12);
  const message = `${type}|${JSON.stringify(payload)}|${ts}|${nonce}`;

  const sig = CryptoJS.HmacSHA256(
    message,
    "HMAC_SECRET_987654321"
  ).toString(CryptoJS.enc.Hex);

  return { ts, nonce, sig };
}

export default function ActionsPanel() {
  const [customAction, setCustomAction] = useState("");

  const sendAction = (type, payload) => {
    const { ts, nonce, sig } = signAction(type, payload);
    socket.emit("action", { type, payload, ts, nonce, sig });
  };

  return (
    <div className="card">
      <h2>Actions</h2>

      {/* PING */}
      <button onClick={() => socket.emit("ping", { message: "frontend ping" })}>
        Ping Backend
      </button>

      {/* BASIC ACTION SET */}
      <button onClick={() => sendAction("inspect", null)}>Inspect</button>
      <button onClick={() => sendAction("interact", null)}>Interact</button>
      <button onClick={() => sendAction("speak", "hello")}>Speak "hello"</button>
      <button onClick={() => sendAction("call_npc", null)}>Call NPC</button>

      {/* DAY-3: CLICK SPAM ACTIONS */}
      <button onClick={() => sendAction("click", null)}>Click</button>

      <button
        onClick={() => {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => sendAction("click", null), i * 80);
          }
        }}
      >
        Spam Click (x5)
      </button>

      {/* MANUAL IDLE TEST */}
      <button onClick={() => socket.emit("presence", "idle")}>
        Force Idle
      </button>

      {/* CUSTOM ACTION */}
      <div style={{ marginTop: "15px" }}>
        <input
          placeholder="custom action"
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          style={{
            padding: "8px",
            width: "70%",
            background: "#1c2233",
            color: "white",
            borderRadius: "6px",
            border: "1px solid #2a3246",
          }}
        />

        <button
          onClick={() => {
            if (!customAction.trim()) return;
            sendAction(customAction.trim(), null);
            setCustomAction("");
          }}
        >
          Send Custom
        </button>
      </div>

      {/* STYLING */}
      <style>{`
        .card button {
          display: block;
          width: 100%;
          margin: 6px 0;
          padding: 10px;
          background: #2b3248;
          color: #dce6ff;
          border: 1px solid #3a4664;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .card button:hover {
          background: #3b4a6a;
          border-color: #4c8bf5;
        }
      `}</style>
    </div>
  );
}
