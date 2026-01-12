import React from "react";

export default function ActionLogPanel({ actionLog = [] }) {
  const getUserId = (a) => {
    if (typeof a.userId === "string") return a.userId;
    if (a.userId?.userId) return a.userId.userId;
    return "system";
  };

  const isEmpty = !actionLog || actionLog.length === 0;

  return (
    <div
      className={[
        "relative backdrop-blur-2xl border rounded-3xl",
        "shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500 overflow-hidden",
        "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95",
        "border-slate-800/80 hover:border-sky-400/70 hover:shadow-[0_22px_60px_rgba(56,189,248,0.35)]",
        "p-6",
      ].join(" ")}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-16 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Title */}
      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/40 ring-1 ring-sky-400/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm">📝</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-tight">
            Action Log
          </h2>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/5 text-slate-100 border border-indigo-400/40 backdrop-blur-sm flex items-center gap-1">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          {actionLog.length} events
        </span>
      </div>

      {isEmpty && (
        <div className="relative flex flex-col items-center justify-center py-10 text-center text-slate-400">
          <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-600/70 flex items-center justify-center mb-3 bg-white/5 backdrop-blur-lg shadow-inner shadow-slate-900/60">
            <span className="text-xl">📝</span>
          </div>
          <p className="text-sm">No actions yet</p>
          <p className="text-[11px] mt-1 opacity-70">
            Interact with the **system** to populate the log.
          </p>
        </div>
      )}

      {/* Log container */}
      {!isEmpty && (
        <div
          className={[
            "relative mt-3 max-h-[620px] overflow-y-auto rounded-2xl p-3 space-y-2",
            "bg-slate-950/80 border border-slate-800/70 backdrop-blur-xl",
          ].join(" ")}
        >
          {actionLog.map((a) => {
            const isError = a.category === "error" || a.type === "error";
            const isSystem = getUserId(a) === "system";

            const accentBar = isError
              ? "from-rose-500 to-orange-400"
              : isSystem
              ? "from-sky-400 to-indigo-400"
              : "from-emerald-400 to-indigo-400";

            return (
              <div
                key={a._id || `${a.sessionId}-${a.clientTs}`}
                className={[
                  "relative rounded-2xl px-3 py-2.5 text-sm",
                  "bg-gradient-to-br from-slate-900/80 to-slate-800/80",
                  "border border-slate-700/70 text-slate-100",
                  "transition-all duration-300 group",
                  "hover:-translate-y-0.5 hover:border-indigo-500",
                  "hover:shadow-lg hover:shadow-indigo-500/25",
                ].join(" ")}
              >
                {/* Accent line */}
                <div
                  className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${accentBar} rounded-l-2xl opacity-80`}
                />

                {/* Glow on hover top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="ml-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                      <span className="uppercase tracking-wide text-xs text-indigo-300">
                        {a.type}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-indigo-500/40">
                        {a.category || "uncategorized"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(a.serverTs || a.clientTs).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      User:{" "}
                      <span className="font-mono text-slate-200">
                        {getUserId(a).slice(0, 6)}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      Session:{" "}
                      <span className="font-mono text-slate-200">
                        {a.sessionId ? a.sessionId.split(":")[1] : "—"}
                      </span>
                    </span>

                    {a.payload && (
                      <span className="inline-flex items-center gap-1 opacity-80">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        Payload
                      </span>
                    )}
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
