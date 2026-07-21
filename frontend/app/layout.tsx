import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ResumeHive",
  description: "AI Powered Resume & Career Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body>
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-premium-blue/10 blur-[120px] mix-blend-multiply animate-pulse-slow" />
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-premium-purple/10 blur-[120px] mix-blend-multiply animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-premium-rose/10 blur-[120px] mix-blend-multiply animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-premium-emerald/10 blur-[120px] mix-blend-multiply animate-pulse-slow" style={{ animationDelay: "3s" }} />
        </div>
        <ToastProvider>
          <Navbar />
          <div className="pt-28">
            <AuthGuard>{children}</AuthGuard>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
