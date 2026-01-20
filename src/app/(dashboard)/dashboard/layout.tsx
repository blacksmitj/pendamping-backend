
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard Overview | Pendampingan",
    description: "Comprehensive overview of program statistics, top performers, and geographic distribution.",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
