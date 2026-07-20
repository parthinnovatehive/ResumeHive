import React from "react";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white shadow rounded-lg p-4 ${className}`}>{children}</div>;
}
