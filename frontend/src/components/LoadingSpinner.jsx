import React from "react";

export default function LoadingSpinner({ message = "Processing legal intelligence..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-10 h-10 border-4 border-[var(--brass-light)] border-t-[var(--brass)] rounded-full animate-spin"></div>
      <p className="font-mono text-xs text-[var(--brass)] tracking-wide">{message}</p>
    </div>
  );
}
