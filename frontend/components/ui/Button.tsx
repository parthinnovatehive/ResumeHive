import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export function Button({ children, onClick, disabled, variant = "primary", loading }: ButtonProps) {
  const cls = variant === "primary"
    ? "bg-blue-600 hover:bg-blue-700 text-white"
    : "bg-gray-200 hover:bg-gray-300 text-gray-700";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-5 py-2 rounded-lg font-medium transition text-sm disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
