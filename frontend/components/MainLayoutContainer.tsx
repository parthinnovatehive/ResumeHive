"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function MainLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCustomPortal = pathname?.startsWith("/superadmin") || pathname?.startsWith("/college-");

  return (
    <div className={isCustomPortal ? "" : "pt-28"}>
      {children}
    </div>
  );
}
