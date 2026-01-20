"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[200px]">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)] bg-background pt-20">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
