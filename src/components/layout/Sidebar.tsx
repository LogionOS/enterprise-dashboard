"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  BookOpen,
  Shield,
  FileBarChart,
  Settings,
  Zap,
  Rocket,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/quickstart", label: "Quick Start", icon: Rocket },
  { href: "/check", label: "Live Check", icon: Zap },
  { href: "/events", label: "Events", icon: Activity },
  { href: "/rules", label: "Regulations", icon: BookOpen },
  { href: "/policies", label: "Policies", icon: Shield },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d1117] border-r border-[#1e293b] flex flex-col z-40">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#1e293b]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
          <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" rx="24" fill="#000"/>
            <path d="M100 60 C100 60, 75 70, 65 100 C55 130, 70 155, 100 155" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M140 100 C140 100, 130 75, 100 65 C70 55, 45 70, 45 100" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M100 140 C100 140, 125 130, 135 100 C145 70, 130 45, 100 45" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M60 100 C60 100, 70 125, 100 135 C130 145, 155 130, 155 100" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <div>
          <span className="text-[15px] font-semibold text-gray-100 tracking-tight">
            LogionOS
          </span>
          <span className="text-[10px] text-gray-500 block -mt-0.5">
            Enterprise Dashboard
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-500/15 text-indigo-400 font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e293b] space-y-3">
        <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-400">D</span>
            </div>
            <div>
              <div className="text-xs text-gray-300 font-medium">Demo Workspace</div>
              <div className="text-[10px] text-gray-600">Admin &middot; ws_demo_001</div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-600 text-center">
          LogionOS v3.1 &middot; Runtime Compliance
        </div>
      </div>
    </aside>
  );
}
