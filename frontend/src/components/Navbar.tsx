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
    <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900 dark:text-slate-100">My Daily Tracker</span>
          <div className="flex gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-2 py-1 ${
                  pathname === link.href
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/categories"
            className={`rounded px-2 py-1 ${
              pathname === "/categories"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Categories
          </Link>
          <Link
            href="/settings"
            className={`rounded px-2 py-1 ${
              pathname === "/settings"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            ⚙ Settings
          </Link>
          <span className="text-slate-600 dark:text-slate-300">👤 {user.name}</span>
          <button
            onClick={logout}
            className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
