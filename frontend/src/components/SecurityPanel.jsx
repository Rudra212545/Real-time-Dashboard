import React from "react";

export default function SecurityPanel({
  agentNonces = {},
  signatureLog = [],
  replayAlerts = [],
  heartbeatStatus = {},
}) {
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

      {/* Header */}
      <div className="relative mb-5 pb-3 border-b border-white/10 flex flex-col items-center gap-1">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/40 ring-1 ring-sky-400/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm">🛡️</span>
          </div>
        </div>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent tracking-tight text-center">
          Sovereign Security Indicators
        </h2>
        <p className="text-[11px] text-slate-400">
          Live **integrity** and replay‑attack signals.
        </p>
      </div>

      <div className="relative space-y-5 text-sm">
        {/* Agent Nonces */}
        <section>
          <h3 className="mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span>🔐</span>
            <span>Agent Nonces</span>
          </h3>

          {Object.keys(agentNonces).length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No agents **registered** yet.
            </p>
          )}

          {Object.entries(agentNonces).map(([agent, nonce]) => (
            <div
              key={agent}
              className="flex justify-between items-center py-1.5 border-b border-dashed border-white/10 text-slate-200"
            >
              <span className="truncate">{agent}</span>
              <span className="rounded-xl bg-slate-900/70 px-2.5 py-0.5 font-mono text-[11px] border border-slate-700/80">
                {nonce}
              </span>
            </div>
          ))}
        </section>

        {/* Signatures */}
        <section>
          <h3 className="mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span>🖋</span>
            <span>Signatures</span>
          </h3>

          {signatureLog.length === 0 ? (
            <p className="text-xs italic text-emerald-300/80">
              No signature **failures**.
            </p>
          ) : (
            <div className="rounded-2xl bg-slate-950/70 border border-rose-500/30 px-3 py-2 space-y-1">
              {signatureLog.slice(0, 5).map((s, i) => (
                <div
                  key={i}
                  className="text-xs text-rose-300 flex justify-between gap-2 border-b border-dashed border-white/10 last:border-0 py-1"
                >
                  <span className="font-mono">
                    {new Date(s.ts).toLocaleTimeString()}
                  </span>
                  <span className="text-right">{s.reason}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Replay Alerts */}
        <section>
          <h3 className="mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span>⛔</span>
            <span>Replay Alerts</span>
          </h3>

          {replayAlerts.length === 0 ? (
            <p className="text-xs italic text-emerald-300/80">
              No replay **attacks** detected.
            </p>
          ) : (
            <div className="rounded-2xl bg-slate-950/70 border border-amber-400/40 px-3 py-2 space-y-1">
              {replayAlerts.slice(0, 5).map((r, i) => (
                <div
                  key={i}
                  className="text-xs text-amber-300 flex justify-between gap-2 border-b border-dashed border-white/10 last:border-0 py-1"
                >
                  <span className="font-mono">
                    {new Date(r.ts).toLocaleTimeString()}
                  </span>
                  <span className="text-right">Replay detected</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Heartbeats */}
        <section>
          <h3 className="mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span>💓</span>
            <span>Heartbeats</span>
          </h3>

          {Object.keys(heartbeatStatus).length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No heartbeat **signals** yet.
            </p>
          )}

          {Object.entries(heartbeatStatus).map(([agent, hb]) => {
            const color = hb.ok ? "text-emerald-300" : "text-rose-300";
            const dotColor = hb.ok ? "bg-emerald-400" : "bg-rose-400";

            return (
              <div
                key={agent}
                className={[
                  "flex justify-between items-center py-1.5 text-xs border-b border-dashed border-white/10",
                  color,
                ].join(" ")}
              >
                <span className="flex items-center gap-1 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  <span>{agent}</span>
                </span>
                <span className="text-right">
                  {hb.ok ? "OK" : hb.reason} ·{" "}
                  {hb.ts ? new Date(hb.ts).toLocaleTimeString() : "—"}
                </span>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
