// src/components/AgentPanel.jsx
import React from "react";
import { getPresentationalAgent } from "../state/agentsReducer";

export default function AgentPanel({
  agents = {},
  recentEvents = [],
  darkMode = true,
  compactMode = false,
}) {
  const rows = Object.entries(agents);

  const cardBase =
    "relative backdrop-blur-2xl border rounded-3xl shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500 overflow-hidden";
  const cardTheme = darkMode
    ? "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 border-slate-800/80 hover:border-sky-400/70 hover:shadow-[0_22px_60px_rgba(56,189,248,0.35)]"
    : "bg-gradient-to-br from-slate-50/90 via-white/90 to-sky-50/90 border-slate-200/80 hover:border-sky-400/70 hover:shadow-[0_16px_45px_rgba(56,189,248,0.35)]";

  const headerText = darkMode
    ? "bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300"
    : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

  const labelMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const labelStrong = darkMode ? "text-slate-100" : "text-slate-800";

  const densityPadding = compactMode ? "p-3" : "p-4";
  const badgeSize = compactMode ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[11px]";

  return (
    <div
      className={`${cardBase} ${cardTheme} ${compactMode ? "p-4" : "p-6"}`}
      aria-live="polite"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-16 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative">
        
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm"></span>
            </div>
          </div>
          <h2
            className={`text-lg font-semibold bg-clip-text text-transparent tracking-tight ${headerText}`}
          >
            Agent Status (FSM)
          </h2>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/5 text-slate-100 border border-indigo-400/40 backdrop-blur-sm flex items-center gap-1">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          {rows.length} agents
        </span>
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-600/70 flex items-center justify-center mb-3 bg-white/5 backdrop-blur-lg shadow-inner shadow-slate-900/60">
            <span className="text-xl">🤖</span>
          </div>
          <p className={`${labelMuted} text-sm`}>No agents registered</p>
          <p className="text-[11px] mt-1 text-slate-500">
            Connect an agent to see **finite** state updates here.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-wrap gap-3">
          {rows.map(([name, rawState]) => {
            const a = getPresentationalAgent(rawState);

            const stateKey = String(a.state).toLowerCase();
            const stateColor =
              {
                idle: "bg-slate-600",
                watching: "bg-sky-500",
                triggered: "bg-rose-500",
                cooldown: "bg-amber-400 text-slate-900",
              }[stateKey] || "bg-slate-500";

            const stateLabel =
              stateKey === "idle"
                ? "Idle"
                : stateKey === "watching"
                ? "Watching"
                : stateKey === "triggered"
                ? "Triggered"
                : stateKey === "cooldown"
                ? "Cooldown"
                : a.state;

            const lastTs = a.ts ? new Date(a.ts).toLocaleTimeString() : "—";

            return (
              <div
                key={name}
                role="region"
                aria-label={`${name} status`}
                className={`
                  relative min-w-[220px] max-w-xs
                  ${innerCardBase(darkMode)}
                  ${densityPadding}
                  group
                `}
              >
                {/* Top glow line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Inner ambient blur */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                  <div className="absolute -top-8 -right-4 h-20 w-20 rounded-full bg-sky-500/25 blur-2xl" />
                  <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                {/* Header row */}
                <div className="relative flex items-center justify-between mb-2">
                  <div className={`font-semibold text-sm ${labelStrong} truncate`}>
                    {name}
                  </div>
                  <div
                    className={`${badgeSize} rounded-full flex items-center gap-1 shadow-sm shadow-black/30 ${stateColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    <span className="capitalize">{stateLabel}</span>
                  </div>
                </div>

                {/* Meta */}
                <div
                  className={`relative space-y-1 text-[12px] ${
                    darkMode ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <div className="truncate">
                    <span className="text-[10px] uppercase tracking-wide text-indigo-300">
                      Message:
                    </span>{" "}
                    <span className="font-medium">
                      {a.lastMessage || "—"}
                    </span>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase tracking-wide text-indigo-300">
                      Reason:
                    </span>{" "}
                    <span className={labelMuted}>{a.reason || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-indigo-300 uppercase tracking-wide">
                      Time
                    </span>
                    <span className="font-mono text-[10px]">
                      {lastTs}
                    </span>
                  </div>
                </div>

                {/* Cooldown */}
                <div
                  className="relative mt-3"
                  title={`Cooldown ${a.cooldownPct || 0}%`}
                >
                  <div className="h-2 w-full rounded-full bg-slate-900/70 border border-white/5 overflow-hidden">
                    <div
                      className="
                        h-full
                        bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400
                        transition-[width] duration-300
                      "
                      style={{ width: `${a.cooldownPct || 0}%` }}
                    />
                  </div>
                  <div
                    className={`mt-1 flex justify-between text-[10px] ${labelMuted}`}
                  >
                    <span>Cooldown</span>
                    <span className="font-mono">
                      {(a.cooldownPct || 0).toFixed
                        ? a.cooldownPct.toFixed(0)
                        : a.cooldownPct || 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inner card matches other panels' glassmorphic item cards
function innerCardBase(darkMode) {
  return darkMode
    ? "bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/80 shadow-lg shadow-black/40 hover:border-indigo-500/70 hover:shadow-indigo-500/25 rounded-2xl"
    : "bg-gradient-to-br from-slate-50/90 to-white/90 border border-slate-200 shadow-md shadow-slate-300/70 hover:border-indigo-400/80 hover:shadow-indigo-300/40 rounded-2xl";
}
