"use client";

import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    return (
        <header className="fixed left-[200px] right-0 top-0 z-30 h-20 border-b border-border bg-card/95 backdrop-blur-sm">
            <div className="flex h-full items-center justify-between px-8">
                {/* Search Bar */}
                <div className="flex flex-1 max-w-md items-center gap-3 rounded-lg bg-muted px-4 py-2.5">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notification Bell */}
                    <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                U
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
}
