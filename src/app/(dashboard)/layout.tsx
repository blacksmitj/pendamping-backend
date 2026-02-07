import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="min-h-screen bg-background">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
