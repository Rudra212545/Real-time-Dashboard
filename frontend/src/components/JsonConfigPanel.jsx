import React, { useState } from "react";
import socket from "../socket/socket";
import CubePreview from "./CubePreview";

export default function JsonConfigPanel({ onConfigChange, previewConfig }) {
  const [jsonText, setJsonText] = useState(
    '{"color": "#66ffdd", "size": 1}'
  );
  const [error, setError] = useState(null);

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      onConfigChange(parsed);
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      socket.emit("generate_world", {
        config: parsed,
        submittedAt: Date.now(),
      });
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

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

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm"></span>
            </div>
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-tight">
            Cube Config (JSON)
          </h2>
        </div>
      </div>

      {/* JSON textarea */}
      <textarea
        rows={4}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        className={[
          "relative w-full mb-3 rounded-2xl p-3 font-mono text-sm resize-y shadow-inner",
          "bg-slate-950/75 border border-slate-700/80 text-cyan-300",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-300/50",
        ].join(" ")}
      />

      {/* Actions */}
      <div className="relative flex gap-2 mb-3">
        <button
          onClick={handlePreview}
          className={[
            "flex-1 rounded-2xl px-4 py-2.5 text-sm font-medium",
            "bg-gradient-to-r from-slate-800/80 to-slate-900/80",
            "border border-slate-600/80 text-sky-200",
            "shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30",
            "hover:border-sky-400/60 hover:scale-[1.02] hover:-translate-y-0.5",
            "transition-all duration-300 flex items-center justify-center gap-2",
          ].join(" ")}
        >
          <span>👁️</span>
          <span>Preview Cube</span>
        </button>
      </div>

      {/* Preview */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl p-3 mb-3">
        <CubePreview config={previewConfig} />
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        className={[
          "relative w-full mt-1 rounded-2xl px-4 py-2.5 text-sm font-semibold",
          "bg-gradient-to-r from-violet-500 to-indigo-500",
          "hover:from-violet-600 hover:to-indigo-600",
          "text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
          "hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300",
          "flex items-center justify-center gap-2",
        ].join(" ")}
      >
        <span>🚀</span>
        <span>Generate World</span>
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 text-sm text-pink-400 bg-pink-500/5 border border-pink-500/40 rounded-2xl px-3 py-2">
          {error}
        </div>
      )}

      {/* Hint */}
      <div className="mt-3 text-xs text-slate-400">
        Example:{" "}
        <code className="font-mono text-[11px] text-cyan-300 bg-slate-900/70 px-2 py-1 rounded-xl border border-slate-700/70">
          {'{ "color": "#B6FF00", "size": 1.3 }'}
        </code>
      </div>
    </div>
  );
}
