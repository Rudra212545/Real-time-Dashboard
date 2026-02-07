/**
 * TextToGamePanel - Text input for game generation
 * Day 1d: Dashboard Control Wiring
 */

import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function TextToGamePanel({ socket }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTextToGame = async () => {
    if (!text.trim()) {
      setError('Please enter a game description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ttg/text-to-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ message: 'Conversion successful!', type: 'convert' });
        console.log('✅ Text-to-Game success:', data);
      } else {
        setError(data.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Text-to-Game error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuildGame = async () => {
    if (!text.trim()) {
      setError('Please enter a game description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ttg/build-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ message: 'Game build queued!', job: data.job, type: 'build' });
        console.log('✅ Build-Game success:', data);
        
        // Emit to socket for real-time updates
        if (socket) {
          socket.emit('job:submit', data.job);
        }
      } else {
        setError(data.error || 'Build failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Build-Game error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!text.trim()) {
      setError('Please enter a game description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ttg/start-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ message: 'Game started!', jobs: data.jobs, type: 'start' });
        console.log('✅ Start-Game success:', data);
        
        // Emit to socket
        if (socket) {
          data.jobs.forEach(job => socket.emit('job:submit', job));
        }
      } else {
        setError(data.error || 'Start failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Start-Game error:', err);
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Create a fast runner game",
    "Easy platform game with obstacles",
    "Hard endless runner with 3 lives",
    "Side scroller survive 60 seconds"
  ];

  return (
    <div className="glass-card relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          Text to Game Generator
        </h2>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your game... (e.g., 'Create a fast runner game with obstacles')"
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900/60 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all resize-none disabled:opacity-50 text-sm mb-4 shadow-lg"
          disabled={loading}
        />

        {/* Action Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleStartGame}
            disabled={loading || !text.trim()}
            className="px-8 py-4 rounded-xl font-bold text-white text-base bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-600 shadow-2xl shadow-indigo-500/50 hover:-translate-y-1 hover:shadow-3xl hover:shadow-indigo-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-pulse"
          >
            {loading ? '⏳ Starting Generation...' : '🚀 Start Generation'}
          </button>
        </div>

        {/* Example Prompts */}
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Examples:</span>
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setText(prompt)}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500 rounded-xl text-red-500 text-sm shadow-lg animate-pulse">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-2 border-indigo-400 rounded-xl shadow-xl animate-pulse">
            <h3 className="text-indigo-400 font-bold text-center text-base">✅ {result.message}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">Check console for detailed schema output</p>
          </div>
        )}
      </div>
    </div>
  );
}
