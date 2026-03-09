"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const baseUrl =
      localStorage.getItem("logionos_api_url") ||
      "https://logionos-api.onrender.com";
    const key = localStorage.getItem("logionos_api_key");
    fetch(`${baseUrl}/v1/health`, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    })
      .then((r) => setConnected(r.ok))
      .catch(() => setConnected(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="h-16 bg-[#0d1117]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search rules, events, policies..."
          className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connected === null
                ? "bg-gray-500 animate-pulse"
                : connected
                ? "bg-emerald-400"
                : "bg-red-400"
            }`}
          />
          <span className="text-xs text-gray-500">
            {connected === null
              ? "Connecting..."
              : connected
              ? "API Connected"
              : "Disconnected"}
          </span>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
