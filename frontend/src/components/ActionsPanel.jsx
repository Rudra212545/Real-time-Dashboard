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

// Accept prefs from UserPreferencePanel / parent
export default function ActionsPanel({
  darkMode = true,
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

  const cardBase =
    "relative max-w-md mx-auto rounded-3xl border backdrop-blur-2xl shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500 overflow-hidden";
  const cardTheme = darkMode
    ? "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 border-slate-800/80 hover:border-sky-400/70 hover:shadow-[0_22px_60px_rgba(56,189,248,0.35)]"
    : "bg-gradient-to-br from-slate-50/90 via-white/90 to-sky-50/90 border-slate-200/80 hover:border-sky-400/70 hover:shadow-[0_16px_45px_rgba(56,189,248,0.35)]";

  const headerGradient = darkMode
    ? "bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300"
    : "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500";

  const inputTheme = darkMode
    ? "bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/30 text-white placeholder-slate-400"
    : "bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400";

  const labelMuted = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`${cardBase} ${cardTheme} ${compactMode ? "p-4" : "p-6"}`}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-16 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/40 ring-1 ring-sky-400/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
          </div>
          <div>
            <h2
              className={`text-lg md:text-xl font-semibold bg-clip-text text-transparent tracking-tight ${headerGradient}`}
            >
              Quick Actions
            </h2>
            <p className={`text-[11px] ${labelMuted}`}>
              Fire **signed** events to the backend.
            </p>
          </div>
        </div>
      </div>

      {/* Ping Button */}
      <button
        className={[
          "relative w-full mb-4 bg-gradient-to-r backdrop-blur-sm border font-medium rounded-2xl",
          "shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-0.5",
          "transition-all duration-300 flex items-center justify-center gap-2",
          compactMode ? "py-2.5 text-sm" : "py-3",
          darkMode
            ? "from-cyan-500/20 to-blue-500/20 border-cyan-400/40 hover:border-cyan-400/70 text-cyan-100 shadow-cyan-500/20"
            : "from-cyan-400/15 to-blue-400/15 border-cyan-400/70 hover:border-cyan-500 text-cyan-900 shadow-cyan-300/40",
        ].join(" ")}
        onClick={() => socket.emit("ping", { message: "frontend ping" })}
      >
        <span className="text-lg">🔍</span>
        <span>Ping Backend</span>
      </button>

      {/* Action Groups */}
      <div className={`relative space-y-3 ${compactMode ? "my-4" : "my-6"}`}>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={[
              "group rounded-2xl border bg-white/10 backdrop-blur-sm",
              "hover:bg-indigo-500/20 border-indigo-400/30 hover:border-indigo-400/60",
              "text-indigo-200 shadow-md shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/25",
              "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              densityBtn,
            ].join(" ")}
            onClick={() => sendAction("inspect", null)}
          >
            <span className="text-lg">🔎</span>
            <span
              className={[
                "transition-transform group-hover:translate-x-1",
                compactMode ? "text-xs" : "text-sm",
              ].join(" ")}
            >
              Inspect
            </span>
          </button>

          <button
            className={[
              "group rounded-2xl border bg-white/10 backdrop-blur-sm",
              "hover:bg-emerald-500/20 border-emerald-400/30 hover:border-emerald-400/60",
              "text-emerald-200 shadow-md shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/25",
              "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              densityBtn,
            ].join(" ")}
            onClick={() => sendAction("interact", null)}
          >
            <span className="text-lg">🤝</span>
            <span className={compactMode ? "text-xs" : "text-sm"}>Interact</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className={[
              "group rounded-2xl border bg-white/10 backdrop-blur-sm",
              "hover:bg-orange-500/20 border-orange-400/30 hover:border-orange-400/60",
              "text-orange-200 shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/25",
              "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              densityBtn,
            ].join(" ")}
            onClick={() => sendAction("speak", "hello")}
          >
            <span className="text-lg">🗣️</span>
            <span className={compactMode ? "text-xs" : "text-sm"}>Speak</span>
          </button>

          <button
            className={[
              "group rounded-2xl border bg-white/10 backdrop-blur-sm",
              "hover:bg-purple-500/20 border-purple-400/30 hover:border-purple-400/60",
              "text-purple-200 shadow-md shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/25",
              "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              densityBtn,
            ].join(" ")}
            onClick={() => sendAction("call_npc", null)}
          >
            <span className="text-lg">📞</span>
            <span className={compactMode ? "text-xs" : "text-sm"}>Call NPC</span>
          </button>
        </div>
      </div>

      {/* Click Actions */}
      <div className={`relative space-y-3 ${compactMode ? "mb-4" : "mb-6"}`}>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={[
              "group rounded-2xl border bg-white/10 backdrop-blur-sm",
              "hover:bg-rose-500/20 border-rose-400/30 hover:border-rose-400/60",
              "text-rose-200 shadow-md shadow-rose-500/10 hover:shadow-xl hover:shadow-rose-500/25",
              "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              densityBtn,
            ].join(" ")}
            onClick={() => sendAction("click", null)}
          >
            <span className="text-lg">🖱️</span>
            <span className={compactMode ? "text-xs" : "text-sm"}>Click</span>
          </button>

          <button
            className={[
              "col-span-2 group rounded-2xl border bg-gradient-to-r from-rose-500/20 to-red-500/20 backdrop-blur-sm",
              "border-rose-400/30 hover:border-rose-400/60 text-rose-100 font-semibold",
              "shadow-lg shadow-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/30",
              "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              densityWide,
            ].join(" ")}
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                setTimeout(() => sendAction("click", null), i * 80);
              }
            }}
          >
            <span className="text-lg animate-pulse">🚀</span>
            <span className={compactMode ? "text-xs" : "text-sm"}>Spam x5</span>
          </button>
        </div>
      </div>

      {/* Presence */}
      <button
        className={[
          "relative w-full mb-4 mx-auto bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm",
          "border border-amber-400/30 hover:border-amber-400/60 text-amber-100 rounded-2xl font-medium",
          "shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/25",
          "hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
          densityWide,
        ].join(" ")}
        onClick={() => socket.emit("presence", "idle")}
      >
        <span className="text-lg">😴</span>
        <span className={compactMode ? "text-xs" : "text-sm"}>Force Idle</span>
      </button>

      {/* Custom Action */}
      <div className="relative flex gap-3 items-center">
        <input
          className={[
            "flex-1 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
            "transition-all duration-300 shadow-md shadow-black/20",
            compactMode ? "py-2 text-sm" : "py-3",
            inputTheme,
          ].join(" ")}
          placeholder="Enter custom action type..."
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
        />
        <button
          className={[
            "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
            "text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25",
            "hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]",
            "transition-all duration-300 whitespace-nowrap flex items-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            compactMode ? "px-4 py-2 text-sm" : "px-7 py-3",
          ].join(" ")}
          disabled={!customAction.trim()}
          onClick={() => {
            if (!customAction.trim()) return;
            sendAction(customAction.trim(), null);
            setCustomAction("");
          }}
        >
          <span>⚡</span>
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
