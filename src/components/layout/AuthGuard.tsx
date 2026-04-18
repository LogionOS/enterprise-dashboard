"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/legacy-auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Clerk-protected surfaces (sign-in / sign-up / Creator Risk Layer pages)
    // are gated by `middleware.ts` and Clerk's own <SignedIn> boundary, so
    // the legacy localStorage-based AuthGuard must not second-guess them.
    const isClerkSurface =
      pathname === "/" ||
      pathname?.startsWith("/sign-in") ||
      pathname?.startsWith("/sign-up") ||
      pathname?.startsWith("/me") ||
      pathname?.startsWith("/teams");
    if (
      pathname === "/login" ||
      pathname === "/welcome" ||
      isClerkSurface
    ) {
      setChecked(true);
      setAuthed(true);
      return;
    }
    const auth = isAuthenticated();
    if (!auth) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}
