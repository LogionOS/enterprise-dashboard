"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let _nextId = 0;
let _pushToast: ((item: ToastItem) => void) | null = null;

export function toast(message: string, type: ToastType = "error") {
  _pushToast?.({ id: ++_nextId, message, type });
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const STYLES = {
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  error: "bg-red-500/10 border-red-500/20 text-red-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  _pushToast = useCallback((item: ToastItem) => {
    setItems((prev) => [...prev, item]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }, 4000);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {items.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm animate-fade-in ${STYLES[item.type]}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{item.message}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              className="p-0.5 hover:opacity-70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
