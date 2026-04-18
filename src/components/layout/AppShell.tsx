"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ToastContainer } from "@/components/ui/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname === "/welcome";
  const isClerkSurface =
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/me") ||
    pathname?.startsWith("/teams");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMobileSidebarOpen(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileSidebarOpen]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <AuthGuard>
      <ToastContainer />
      {isLogin || isClerkSurface ? (
        <main className="min-h-screen bg-[#080b12]">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
        </main>
      ) : (
        <>
          <Sidebar
            isMobile={isMobile}
            isOpen={isMobile ? mobileSidebarOpen : true}
            onClose={() => setMobileSidebarOpen(false)}
          />
          <div className="min-h-screen flex flex-col md:ml-60">
            <Header
              showMobileNavToggle={isMobile}
              onMobileNavToggle={() => setMobileSidebarOpen((o) => !o)}
            />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </>
      )}
    </AuthGuard>
  );
}
