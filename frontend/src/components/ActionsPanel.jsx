import React, { useState } from "react";
import socket from "../socket/socket";
import CryptoJS from "crypto-js";

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

export default function ActionsPanel({
  compactMode = false,
  soundEnabled = true,
}) {
  const [customAction, setCustomAction] = useState("");

  const sendAction = (type, payload) => {
    const { ts, nonce, sig } = signAction(type, payload);
    socket.emit("action", { type, payload, ts, nonce, sig });
    if (soundEnabled) {
      // playClick();
    }
  };

  const densityBtn = compactMode ? "py-2 px-3 text-sm" : "py-3 px-4";
  const densityWide = compactMode ? "py-2.5 px-4 text-sm" : "py-3 px-6";

  return (
    <div
      className={[
        compactMode
          ? "relative w-full max-w-full min-w-0 rounded-3xl"
          : "relative max-w-md mx-auto rounded-3xl",
        "border backdrop-blur-2xl overflow-hidden",
        "shadow-[0_18px_45px_rgba(15,23,42,0.15)] dark:shadow-[0_18px_45px_rgba(15,23,42,0.6)]",
        "transition-all duration-300",
        // ✅ THEME
        "bg-white text-slate-900 border-slate-200",
        "dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800",
        compactMode ? "p-4" : "p-6",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            ⚡
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Fire signed events to the backend.
          </p>
        </div>
      </div>

      {/* Ping */}
      <button
        onClick={() => socket.emit("ping", { message: "frontend ping" })}
        className={[
          "w-full mb-4 rounded-2xl border font-medium",
          "bg-sky-100 text-sky-900 border-sky-200",
          "dark:bg-sky-500/20 dark:text-sky-100 dark:border-sky-400/40",
          "transition-all flex items-center justify-center gap-2",
          compactMode ? "" : "hover:scale-[1.02]",
          compactMode ? "py-2.5 text-sm" : "py-3",
        ].join(" ")}
      >
        🔍 Ping Backend
      </button>

      {/* Actions */}
      <div className={`grid ${compactMode ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
        {["inspect", "interact", "speak", "call_npc"].map((type) => (
          <button
            key={type}
            onClick={() =>
              sendAction(type, type === "speak" ? "hello" : null)
            }
            className={[
              "rounded-2xl border font-medium",
              "bg-slate-100 text-slate-900 border-slate-200",
              "dark:bg-white/10 dark:text-slate-100 dark:border-white/20",
              "transition-all flex items-center justify-center gap-2",
              compactMode ? "" : "hover:scale-[1.02]",
              densityBtn,
            ].join(" ")}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Click / Spam */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => sendAction("click", null)}
          className={[
            "w-full rounded-2xl border",
            "bg-rose-100 text-rose-900 border-rose-200",
            "dark:bg-rose-500/20 dark:text-rose-100 dark:border-rose-400/40",
            densityBtn,
          ].join(" ")}
        >
          🖱️ Click
        </button>

        <button
          onClick={() => {
            for (let i = 0; i < 5; i++) {
              setTimeout(() => sendAction("click", null), i * 80);
            }
          }}
          className={[
            "w-full rounded-2xl border font-semibold",
            "bg-red-100 text-red-900 border-red-200",
            "dark:bg-red-500/20 dark:text-red-100 dark:border-red-400/40",
            densityWide,
          ].join(" ")}
        >
          🚀 Spam x5
        </button>
      </div>

      {/* Custom Action */}
      <div className={`mt-4 flex gap-3 ${compactMode ? "flex-col" : ""}`}>
        <input
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          placeholder="Custom action..."
          className={[
            "flex-1 rounded-2xl px-4 border",
            "bg-white text-slate-900 border-slate-300",
            "dark:bg-white/10 dark:text-white dark:border-white/20",
            compactMode ? "py-2 text-sm" : "py-3",
          ].join(" ")}
        />

        <button
          disabled={!customAction.trim()}
          onClick={() => {
            sendAction(customAction.trim(), null);
            setCustomAction("");
          }}
          className={[
            "rounded-2xl bg-indigo-600 text-white font-semibold",
            "disabled:opacity-50",
            compactMode ? "px-4 py-2 text-sm" : "px-7 py-3",
          ].join(" ")}
        >
          ⚡ Send
        </button>
      </div>
    </div>
  );
}
