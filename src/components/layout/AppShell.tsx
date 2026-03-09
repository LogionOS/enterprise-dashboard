"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ToastContainer } from "@/components/ui/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <AuthGuard>
      <ToastContainer />
      {isLogin ? (
        children
      ) : (
        <>
          <Sidebar />
          <div className="ml-60 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </>
      )}
    </AuthGuard>
  );
}
