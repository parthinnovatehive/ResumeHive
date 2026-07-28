import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
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
          dark: "rgba(0, 0, 0, 0.4)",
        },
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.02)',
        'premium-hover': '0 20px 40px -4px rgba(0, 0, 0, 0.08), 0 0 8px rgba(0,0,0,0.04)',
        'premium-bloom': '0 0 40px -10px var(--bloom-color, rgba(15, 82, 186, 0.3))',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - 2rem))' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(calc(-100% - 2rem))' },
          to: { transform: 'translateX(0)' },
        },
        spotlight: {
          "0%": { opacity: '0', transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: '1', transform: "translate(-50%,-40%) scale(1)" },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
export default config;
