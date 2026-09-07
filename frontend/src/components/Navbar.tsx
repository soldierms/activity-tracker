"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/daily-log", label: "Daily Log" },
  { href: "/calendar", label: "Calendar" },
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/reports", label: "Reports" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">My Daily Tracker</span>
          <div className="flex gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-2 py-1 ${
                  pathname === link.href
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">👤 {user.name}</span>
          <button
            onClick={logout}
            className="rounded border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
