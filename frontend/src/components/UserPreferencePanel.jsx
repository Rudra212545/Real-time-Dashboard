import React, { useState, useEffect } from "react";

export default function UserPreferencePanel() {
  const [compactMode, setCompactMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Load saved preferences once
  useEffect(() => {
    const savedCompact = localStorage.getItem("pref_compact") === "true";
    const savedSound = localStorage.getItem("pref_sound") !== "false";
    const savedTheme = localStorage.getItem("pref_dark") !== "false";

    setCompactMode(savedCompact);
    setSoundEnabled(savedSound);
    setDarkMode(savedTheme);

    applyTheme(savedTheme);
    applyDensity(savedCompact);
  }, []);

  // Helpers to apply global CSS classes
  const applyTheme = (isDark) => {
    if (isDark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const applyDensity = (isCompact) => {
    const app = document.querySelector(".container");
    if (!app) return;
    if (isCompact) {
      app.classList.add("compact");
    } else {
      app.classList.remove("compact");
    }
  };

  const toggleCompact = () => {
    const next = !compactMode;
    setCompactMode(next);
    localStorage.setItem("pref_compact", next);
    applyDensity(next);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("pref_sound", next);
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("pref_dark", next);
    applyTheme(next);
  };

  return (
    <div className="card pref-card">
      <h2 className="pref-header">User Preferences</h2>

      <div className="pref-option">
        <label>Compact Layout</label>
        <input type="checkbox" checked={compactMode} onChange={toggleCompact} />
      </div>

      <div className="pref-option">
        <label>Dark Mode</label>
        <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
      </div>

      <style>{`
        .pref-card {
          background: #131a2b;
          border-radius: 14px;
          padding: 16px;
          border: 1px solid #26304a;
        }

        .pref-header {
          text-align: center;
          color: #9fc5ff;
          margin-bottom: 14px;
        }

        .pref-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px dashed rgba(255,255,255,0.06);
          color: #dbe3ff;
        }

        .pref-option:last-child {
          border-bottom: none;
        }

        /* Compact mode reduces padding & gaps */
        .compact .card {
          padding: 10px !important;
        }

        .compact .grid {
          gap: 10px !important;
        }

        .compact button {
          padding: 6px 8px !important;
        }

        /* Light mode (optional override for body) */
        body:not(.dark-mode) {
          background: #f5f8ff;
          color: #0f172a;
        }

        body:not(.dark-mode) .card {
          background: #ffffff !important;
          color: #111111 !important;
          border: 1px solid #d1d5db !important;
        }

      `}</style>
    </div>
  );
}
