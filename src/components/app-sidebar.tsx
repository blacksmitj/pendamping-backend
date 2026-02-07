"use client"

import * as React from "react"
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    School,
    BookOpen,
    Target,
    DownloadCloud,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const data = {
    navMain: [
        {
            title: "Menu Utama",
            items: [
                {
                    title: "Dashboard",
                    url: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    title: "Participants",
                    url: "/participants",
                    icon: Users,
                },
                {
                    title: "Mentors",
                    url: "/mentors",
                    icon: GraduationCap,
                },
                {
                    title: "Universities",
                    url: "/universities",
                    icon: School,
                },
            ],
        },
        {
            title: "Laporan & Data",
            items: [
                {
                    title: "Logbooks",
                    url: "/logbooks",
                    icon: BookOpen,
                },
                {
                    title: "Outputs",
                    url: "/outputs",
                    icon: Target,
                },
                {
                    title: "Downloads",
                    url: "/downloads",
                    icon: DownloadCloud,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-border">
            <SidebarHeader className="h-16 flex-shrink-0 border-b border-border flex items-center justify-center group-data-[state=collapsed]:p-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default active:scale-100 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-0">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 shrink-0">
                                <span className="text-lg font-black text-primary-foreground">P</span>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                                <span className="truncate font-bold text-foreground tracking-tight">Pendampingan</span>
                                <span className="truncate text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Admin Panel</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {data.navMain.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                isActive={isActive}
                                                className={`hover:bg-primary/5 transition-all duration-200 h-10 px-4 rounded-xl ${isActive
                                                    ? "bg-primary/10 text-primary font-semibold"
                                                    : "text-muted-foreground"
                                                    }`}
                                            >
                                                <Link href={item.url} className="flex items-center gap-3">
                                                    <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                                    <span className="text-sm font-medium">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
