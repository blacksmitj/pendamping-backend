import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Header() {
    return (
        <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4 md:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                {/* Search Bar */}
                <div className="flex flex-1 max-w-md items-center gap-3 rounded-xl bg-muted/50 border border-border/50 px-4 py-2 hover:bg-muted transition-colors group">
                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari data..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                </div>

                {/* Right Section */}
                <div className="ml-auto flex items-center gap-2 md:gap-4">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notification Bell */}
                    <button className="relative rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-border/50">
                        <div className="hidden md:flex flex-col items-end leading-none">
                            <span className="text-sm font-bold">Admin User</span>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Super Administrator</span>
                        </div>
                        <Avatar className="h-9 w-9 border-2 border-primary/10 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                AU
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
}
