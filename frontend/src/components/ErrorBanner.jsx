import React from "react";

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="w-full p-4 mb-4 rounded-lg border border-[var(--oppose-oxblood)] bg-[var(--oppose-bg)] flex items-center justify-between">
      <div className="flex items-center space-x-3 text-[var(--oppose-oxblood-bright)]">
        <span className="font-bold">⚠️ Error:</span>
        <span className="text-sm font-sans">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-xs font-mono text-[var(--oppose-oxblood-bright)] hover:underline">
          Dismiss ✕
        </button>
      )}
    </div>
  );
}
