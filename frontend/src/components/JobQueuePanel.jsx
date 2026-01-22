import React, { useState } from "react";
import socket from "../socket/socket";

export default function JobQueuePanel({ jobHistory = [], setJobHistory }) {
  const [agentMessage, setAgentMessage] = useState(null);

  return (
    <div
      className={[
        "relative backdrop-blur-2xl border rounded-3xl overflow-hidden",
        "shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500",
        "bg-gradient-to-br from-slate-50/90 via-white/90 to-sky-50/90",
        "dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/95",
        "border-slate-200/80 dark:border-slate-800/80",
        "p-6",
      ].join(" ")}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-16 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          World Build Jobs
        </h2>

        <span
          className="
            px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm
            flex items-center gap-1
            bg-black/5 dark:bg-white/5
            text-slate-900 dark:text-slate-100
            border-indigo-400/40
          "
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          {jobHistory.length} jobs
        </span>
      </div>

      {/* Empty state */}
      {jobHistory.length === 0 && (
        <div className="relative mb-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="
                w-12 h-12 rounded-2xl border border-dashed
                border-slate-300/70 dark:border-slate-600/70
                flex items-center justify-center mb-3
                bg-black/5 dark:bg-white/5
                backdrop-blur-lg shadow-inner
                shadow-slate-200/40 dark:shadow-slate-900/60
              "
            >
              <span className="text-xl">📦</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No jobs yet.
            </p>
            <p className="text-[11px] mt-1 text-slate-400">
              Trigger a world build to populate this queue.
            </p>
          </div>
        </div>
      )}

      {/* Job list */}
      {jobHistory.length > 0 && (
        <ul
          className={[
            "relative mb-4 max-h-96 overflow-y-auto rounded-2xl p-3 space-y-1.5",
            "bg-white/70 dark:bg-slate-950/80",
            "border border-slate-200/70 dark:border-slate-800/70",
            "backdrop-blur-xl",
          ].join(" ")}
        >
          {jobHistory.map((job) => {
            const statusColor =
              job.status === "finished"
                ? "text-emerald-600 dark:text-emerald-300"
                : job.status === "failed"
                ? "text-red-600 dark:text-red-300"
                : job.status === "started"
                ? "text-amber-600 dark:text-amber-300"
                : "text-sky-600 dark:text-sky-300";

            const dotColor =
              job.status === "finished"
                ? "bg-emerald-400"
                : job.status === "failed"
                ? "bg-red-400"
                : job.status === "started"
                ? "bg-amber-400"
                : "bg-sky-400";

            return (
              <li
                key={job.id}
                className={[
                  "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm group",
                  job.status === "failed"
                    ? "bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-950/40 dark:to-red-900/40"
                    : "bg-gradient-to-br from-white/80 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-800/80",
                  job.status === "failed"
                    ? "border border-red-300/70 dark:border-red-700/70"
                    : "border border-slate-200/70 dark:border-slate-700/70",
                  "text-slate-900 dark:text-slate-100",
                  "transition-all duration-300",
                  job.status === "failed"
                    ? "hover:shadow-lg hover:shadow-red-500/25"
                    : "hover:-translate-y-0.5 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25",
                ].join(" ")}
              >
                {/* Accent */}
                <div className={[
                  "absolute inset-y-0 left-0 w-[3px] rounded-l-2xl opacity-80",
                  job.status === "failed"
                    ? "bg-gradient-to-b from-red-500 via-red-600 to-red-700"
                    : "bg-gradient-to-b from-sky-400 via-indigo-400 to-purple-400"
                ].join(" ")} />

                {/* Hover glow */}
                <div className={[
                  "pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  job.status === "failed"
                    ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700"
                    : "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400"
                ].join(" ")} />

                <div className="ml-2 flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-2 w-2 rounded-full ${dotColor} ${job.status === 'failed' ? 'animate-pulse' : ''}`} />
                      <span className={`font-bold text-xs ${statusColor} uppercase tracking-wide`}>
                        {job.status}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {new Date(job.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Type:</span>{" "}
                      <span className="font-mono text-sky-600 dark:text-sky-300">
                        {job.jobType}
                      </span>
                    </div>

                    {job.error && (
                      <div className="flex items-start gap-1.5 mt-0.5 p-2 rounded-lg bg-red-100/80 dark:bg-red-950/60 border border-red-300/50 dark:border-red-800/50">
                        <span className="text-red-600 dark:text-red-400 text-xs mt-0.5">⚠️</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-wide text-red-600 dark:text-red-400 font-semibold mb-0.5">Error</div>
                          <div className="font-mono text-xs text-red-700 dark:text-red-300 break-all leading-relaxed">
                            {job.error}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
