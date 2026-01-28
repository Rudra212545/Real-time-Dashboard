import { useState, useEffect } from "react";
import socket from "../socket/socket";
import { SAMPLE_WORLDS } from "../data/sampleWorlds";

const WORLDS = ["forest", "desert", "ocean", "volcano"];

export default function DemoModePanel() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ stage: "", percent: 0 });
  const [selectedWorld, setSelectedWorld] = useState("");

  useEffect(() => {
    const handleJobStatus = (job) => {
      if (!running) return;
      
      if (job.status === "queued") {
        setProgress({ stage: "Queuing jobs...", percent: 25 });
      } else if (job.status === "dispatched") {
        setProgress({ stage: "Dispatching to engine...", percent: 50 });
      } else if (job.status === "running") {
        setProgress({ stage: `Building ${job.jobType}...`, percent: 75 });
      } else if (job.status === "completed") {
        setProgress({ stage: "Complete!", percent: 100 });
      } else if (job.status === "failed") {
        setProgress({ stage: "Failed", percent: 0 });
        setRunning(false);
      }
    };

    const handleWorldUpdate = () => {
      setProgress({ stage: "Preview updated!", percent: 100 });
      setTimeout(() => {
        setRunning(false);
        setProgress({ stage: "", percent: 0 });
      }, 1500);
    };

    socket.on("job_status", handleJobStatus);
    socket.on("world_update", handleWorldUpdate);

    return () => {
      socket.off("job_status", handleJobStatus);
      socket.off("world_update", handleWorldUpdate);
    };
  }, [running]);

  const runDemo = () => {
    setRunning(true);
    const world = WORLDS[Math.floor(Math.random() * WORLDS.length)];
    setSelectedWorld(world);
    setProgress({ stage: "Generating world...", percent: 10 });
    
    socket.emit("generate_world", {
      config: SAMPLE_WORLDS[world],
      submittedAt: Date.now(),
    });
  };

  return (
    <div
      className={[
        "relative backdrop-blur-2xl border rounded-3xl overflow-hidden",
        "shadow-[0_18px_45px_rgba(15,23,42,0.6)] transition-all duration-500",
        "bg-gradient-to-br from-slate-50/90 via-white/90 to-sky-50/90",
        "dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/95",
        "border-slate-200/80 dark:border-slate-800/80",
        "p-8 min-h-[280px] flex flex-col justify-between",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -top-32 -right-16 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative mb-6 pb-4 border-b border-slate-200/60 dark:border-white/10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          🎬 Demo Mode
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Experience the full pipeline in one click
        </p>
      </div>
      
      <div className="relative flex-1 flex flex-col justify-center gap-4">
        <button
          onClick={runDemo}
          disabled={running}
          className={[
            "w-full rounded-2xl px-8 py-6 text-xl font-bold text-white shadow-2xl",
            "transition-all duration-300 flex items-center justify-center gap-3",
            "relative overflow-hidden",
            running
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 hover:scale-[1.03] hover:-translate-y-1 shadow-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/50"
          ].join(" ")}
        >
          {!running && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full animate-[shimmer_2s_infinite]" />
          )}
          <span className="text-3xl">{running ? "🔄" : "▶️"}</span>
          <span>{running ? "Running Demo..." : "Launch Demo"}</span>
        </button>

        {running && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {progress.stage}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {progress.percent}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {selectedWorld && (
              <p className="mt-2 text-xs text-center text-slate-600 dark:text-slate-400">
                World: <span className="font-semibold capitalize">{selectedWorld}</span>
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="relative mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Random World → Queue → Engine → Preview
        </p>
      </div>
    </div>
  );
}
