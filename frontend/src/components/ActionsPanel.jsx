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
          ? "relative w-full max-w-full min-w-0 box-border rounded-3xl contain-layout"
          : "relative max-w-md mx-auto rounded-3xl contain-layout",
        "border backdrop-blur-2xl overflow-hidden",
        "shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500",
        "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95",
        "border-slate-800/80",
        compactMode ? "p-4" : "p-6",
      ].join(" ")}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-16 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-lg ring-1 ring-sky-400/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={compactMode ? "text-base" : "text-lg"}>⚡</span>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <p className="text-[11px] text-slate-400">
            Fire signed events to the backend.
          </p>
        </div>
      </div>

      {/* Ping */}
      <button
        onClick={() => socket.emit("ping", { message: "frontend ping" })}
        className={[
          "w-full mb-4 rounded-2xl border font-medium",
          "bg-gradient-to-r from-cyan-500/20 to-blue-500/20",
          "border-cyan-400/40 text-cyan-100",
          "shadow-lg transition-all duration-300 flex items-center justify-center gap-2",
          compactMode ? "" : "hover:scale-[1.02] hover:-translate-y-0.5",
          compactMode ? "py-2.5 text-sm" : "py-3",
        ].join(" ")}
      >
        <span>🔍</span>
        <span>Ping Backend</span>
      </button>

      {/* Action grid */}
      <div className="space-y-3">
        <div
          className={`grid ${
            compactMode ? "grid-cols-1 gap-2" : "grid-cols-2 gap-3"
          }`}
        >
          {[
            ["inspect", "🔎"],
            ["interact", "🤝"],
            ["speak", "🗣️"],
            ["call_npc", "📞"],
          ].map(([type, icon]) => (
            <button
              key={type}
              onClick={() =>
                sendAction(type, type === "speak" ? "hello" : null)
              }
              className={[
                "rounded-2xl border bg-white/10 border-white/20 text-slate-100",
                "shadow-md transition-all duration-300 flex items-center justify-center gap-2",
                compactMode ? "" : "hover:scale-[1.02]",
                densityBtn,
              ].join(" ")}
            >
              <span>{icon}</span>
              <span className={compactMode ? "text-xs" : "text-sm"}>
                {type.replace("_", " ")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Click + Spam */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => sendAction("click", null)}
          className={[
            "w-full rounded-2xl border bg-white/10 border-rose-400/40 text-rose-200",
            "shadow-md transition-all duration-300 flex items-center justify-center gap-2",
            compactMode ? "" : "hover:scale-[1.02]",
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
            "w-full rounded-2xl border bg-gradient-to-r from-rose-500/20 to-red-500/20",
            "border-rose-400/40 text-rose-100 font-semibold",
            "shadow-lg transition-all duration-300 flex items-center justify-center gap-2",
            compactMode ? "" : "hover:scale-[1.02]",
            densityWide,
          ].join(" ")}
        >
          🚀 Spam x5
        </button>
      </div>

      {/* Force Idle */}
      <button
        onClick={() => socket.emit("presence", "idle")}
        className={[
          "w-full mt-4 rounded-2xl border bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
          "border-amber-400/40 text-amber-100",
          "shadow-lg transition-all duration-300 flex items-center justify-center gap-2",
          compactMode ? "" : "hover:scale-[1.02]",
          densityWide,
        ].join(" ")}
      >
        😴 Force Idle
      </button>

      {/* Custom Action */}
      <div
        className={`mt-4 flex gap-3 ${
          compactMode ? "flex-col" : "items-center"
        }`}
      >
        <input
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
          placeholder="Enter custom action type..."
          className={[
            "flex-1 rounded-2xl px-4 border border-white/20 bg-white/10",
            "text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
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
            "rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600",
            "text-white font-semibold shadow-lg transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            compactMode ? "px-4 py-2 text-sm" : "px-7 py-3",
          ].join(" ")}
        >
          ⚡ Send
        </button>
      </div>
    </div>
  );
}
