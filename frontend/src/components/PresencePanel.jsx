import React from "react";
import { Monitor, Smartphone, Tablet, Laptop, Circle } from "lucide-react";

function timeAgo(ts) {
  if (!ts) return "—";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function getDeviceIcon(device) {
  const d = device?.toLowerCase() || "";
  if (d.includes("mobile") || d.includes("phone")) return <Smartphone size={14} />;
  if (d.includes("tablet") || d.includes("ipad")) return <Tablet size={14} />;
  if (d.includes("laptop")) return <Laptop size={14} />;
  return <Monitor size={14} />;
}

export default function PresencePanel({
  presenceList,
  darkMode = true,
  compactMode = false,
}) {
  const users = Object.values(presenceList || {});

  // Outer card
  const cardBase =
    "relative overflow-hidden rounded-3xl border backdrop-blur-2xl shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500";
  const cardTheme = darkMode
    ? [
        "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95",
        "border-slate-800/80",
        "hover:border-sky-400/70",
        "hover:shadow-[0_22px_60px_rgba(56,189,248,0.35)]",
      ].join(" ")
    : [
        "bg-gradient-to-br from-slate-50/90 via-white/90 to-sky-50/90",
        "border-slate-200/80",
        "hover:border-sky-400/70",
        "hover:shadow-[0_16px_45px_rgba(56,189,248,0.35)]",
      ].join(" ");

  const cardPadding = compactMode ? "p-4" : "p-6";

  // Header
  const headerText = darkMode
    ? "bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300"
    : "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500";

  const labelMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const labelStrong = darkMode ? "text-slate-100" : "text-slate-800";

  const chipBase =
    "px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md flex items-center gap-1";
  const innerCardBase =
    "relative rounded-2xl border transition-all duration-300 overflow-hidden group cursor-default";
  const innerCardTheme = darkMode
    ? "bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/80 border-slate-700/80 hover:border-sky-400/70 hover:shadow-[0_16px_40px_rgba(56,189,248,0.35)]"
    : "bg-gradient-to-br from-slate-50/90 via-white/90 to-slate-100/90 border-slate-200 hover:border-sky-400/70 hover:shadow-[0_14px_30px_rgba(56,189,248,0.25)]";

  const densityPadding = compactMode ? "p-3.5" : "p-4.5";
  const listGap = compactMode ? "space-y-3" : "space-y-4";

  const metaBg = darkMode
    ? "bg-black/30 border border-slate-700/70"
    : "bg-slate-50 border border-slate-200";

  return (
    <div className={`${cardBase} ${cardTheme} ${cardPadding}`}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-20 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-2xl bg-sky-500/10 border border-sky-400/40 flex items-center justify-center shadow-inner shadow-sky-500/30`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          </div>
          <h2
            className={`text-lg font-semibold tracking-tight bg-clip-text text-transparent ${headerText}`}
          >
            User Presence
          </h2>
        </div>

        <span
          className={`${chipBase} ${
            darkMode
              ? "text-sky-100 border-sky-400/60 bg-sky-500/15"
              : "text-sky-800 border-sky-400/80 bg-sky-100/80"
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          {users.length} online
        </span>
      </div>

      {/* Empty state */}
      {users.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full border border-dashed border-slate-500/50 flex items-center justify-center mb-3 bg-white/5 backdrop-blur-lg shadow-inner shadow-slate-900/60">
            <Circle
              size={32}
              className={darkMode ? "text-slate-500/70" : "text-slate-400/80"}
            />
          </div>
          <p className={labelMuted}>No users connected</p>
          <p className="text-xs mt-1 text-slate-500">
            Waiting for **real-time** presence signals...
          </p>
        </div>
      ) : (
        <div
          className={`relative presence-scroll max-h-[480px] pr-2 overflow-y-auto ${listGap}`}
        >
          {users.map((u) => {
            const stateColor =
              u.state === "active"
                ? "bg-emerald-400"
                : u.state === "idle"
                ? "bg-amber-400"
                : "bg-rose-500";

            const roleBadge =
              u.role === "admin"
                ? darkMode
                  ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                  : "bg-gradient-to-br from-violet-500 to-fuchsia-400"
                : darkMode
                ? "bg-gradient-to-br from-sky-500 to-blue-500"
                : "bg-gradient-to-br from-sky-500 to-blue-400";

            return (
              <div
                key={u.userId}
                className={`${innerCardBase} ${innerCardTheme} ${densityPadding}`}
              >
                {/* Glow line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Inner ambient blur */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                  <div className="absolute -top-10 -right-6 h-24 w-24 rounded-full bg-sky-500/25 blur-2xl" />
                  <div className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />
                </div>

                {/* User row */}
                <div
                  className={`relative flex items-center gap-4 ${
                    compactMode ? "mb-2" : "mb-3"
                  }`}
                >
                  <div
                    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/40 ring-1 ring-sky-400/60`}
                  >
                    <div
                      className={
                        darkMode
                          ? "absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500"
                          : "absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500"
                      }
                    />
                    <span className="relative text-xs tracking-wide">
                      {u.userId.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${labelStrong} truncate`}>
                      {u.userId.slice(0, 8)}
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${labelMuted}`}>
                      <div
                        className={`relative w-2.5 h-2.5 rounded-full ${stateColor} shadow-[0_0_12px_rgba(34,197,94,0.9)]`}
                      >
                        <span
                          className="absolute inset-0 rounded-full animate-[ping_1.6s_ease-out_infinite]"
                          style={{ backgroundColor: "inherit" }}
                        />
                      </div>
                      <span className="capitalize">{u.state}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div
                  className={`relative flex flex-wrap gap-2 ${
                    compactMode ? "mb-2" : "mb-3"
                  }`}
                >
                  <span
                    className={`px-3 py-1 text-[11px] font-semibold rounded-md text-white flex items-center gap-1 shadow-sm shadow-black/40 ${roleBadge}`}
                  >
                    {u.role === "admin" ? "⭐ admin" : "👤 user"}
                  </span>

                  <span
                    className={`px-3 py-1 text-[11px] rounded-md flex items-center gap-1 border ${
                      darkMode
                        ? "bg-slate-900/70 text-slate-200 border-slate-600/80"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    <span className="shrink-0 flex items-center justify-center">
                      {getDeviceIcon(u.device)}
                    </span>
                    <span className="truncate max-w-[140px]">
                      {u.device || "Unknown device"}
                    </span>
                  </span>
                </div>

                {/* Meta */}
                <div
                  className={`relative text-xs flex justify-between items-center rounded-lg px-3 py-2 ${metaBg}`}
                >
                  <span className={labelMuted}>Last active</span>
                  <span
                    className={
                      darkMode
                        ? "font-semibold text-slate-100"
                        : "font-semibold text-slate-700"
                    }
                  >
                    {timeAgo(u.lastActiveAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
