"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Participants", href: "/participants" },
  { label: "Mentors", href: "/mentors" },
  { label: "Universities", href: "/universities" },
  { label: "Logbooks", href: "/logbooks" },
  { label: "Capaian Output", href: "/outputs" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.08),transparent_40%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Menu
            </p>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-white/70 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <Card className="border-border/80 bg-white/70">
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">Data source</p>
              <p>
                Uses Prisma + API routes, then fetched via TanStack Query hooks.
              </p>
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-10">{children}</main>
      </div>
    </div>
  );
}
