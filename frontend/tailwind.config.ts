import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          blue: "#0F52BA", // Sapphire blue
          blueLight: "#E8F0FE",
          indigo: "#4338CA", // Electric Indigo
          purple: "#6B21A8", // Royal purple
          violet: "#8B5CF6", // Soft Violet
          purpleLight: "#F3E8FF",
          emerald: "#10B981",
          emeraldLight: "#D1FAE5",
          amber: "#F59E0B",
          amberLight: "#FEF3C7",
          rose: "#F43F5E", // Rose Glow
          red: "#EF4444",
          redLight: "#FEE2E2",
          slate: "#475569",
          slateLight: "#F8FAFC",
        },
        glass: {
          white: "rgba(255, 255, 255, 0.7)",
          panel: "rgba(255, 255, 255, 0.4)",
          border: "rgba(255, 255, 255, 0.5)",
        },
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.02)',
        'premium-hover': '0 20px 40px -4px rgba(0, 0, 0, 0.08), 0 0 8px rgba(0,0,0,0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
