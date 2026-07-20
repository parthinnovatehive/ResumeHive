import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeHive",
  description: "Build ATS-optimized resumes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Navbar />
          <AuthGuard>{children}</AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
