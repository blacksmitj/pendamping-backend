"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    School,
    BookOpen,
    Target,
} from "lucide-react";

const menuItems = [
    { label: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { label: "PARTICIPANTS", href: "/participants", icon: Users },
    { label: "MENTORS", href: "/mentors", icon: GraduationCap },
    { label: "UNIVERSITIES", href: "/universities", icon: School },
    { label: "LOGBOOKS", href: "/logbooks", icon: BookOpen },
    { label: "OUTPUTS", href: "/outputs", icon: Target },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-[200px] bg-card border-r border-border text-card-foreground">
            {/* Logo */}
            <div className="flex h-20 items-center justify-center border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <div className="text-xl font-bold text-primary">P</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 p-4">
                {menuItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? "border-l-4 border-primary bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
