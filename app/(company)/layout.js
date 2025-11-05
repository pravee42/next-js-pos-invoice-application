"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import MobileMenu from "../../components/layout/MobileMenu";

export default function CompanyLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Don't show layout for auth pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex">
        <Sidebar />
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
