
import {
    Users,
    UserCheck,
    School,
    Briefcase,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/types/dashboard";

interface StatsCardsProps {
    counts?: DashboardSummary['counts'];
    isLoading?: boolean;
}

export function StatsCards({ counts, isLoading }: StatsCardsProps) {
    const stats = [
        {
            label: "Total Participants",
            value: counts?.participants ?? 0,
            icon: Users,
            color: "text-blue-500",
            desc: "Registered & Verified"
        },
        {
            label: "Active Mentors",
            value: counts?.mentors ?? 0,
            icon: UserCheck,
            color: "text-emerald-500",
            desc: "Role: User"
        },
        {
            label: "Partner Universities",
            value: counts?.universities ?? 0,
            icon: School,
            color: "text-purple-500",
            desc: "Total Registered"
        },
        {
            label: "New Employees",
            value: counts?.newEmployees ?? 0,
            icon: Briefcase,
            color: "text-orange-500",
            desc: "Added by Participants"
        },
        {
            label: "Avg. Omzet Growth",
            value: `${counts?.avgOmzetGrowth?.toFixed(1) ?? 0}%`,
            icon: TrendingUp,
            color: "text-pink-500",
            desc: "Global Average"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="overflow-hidden border-l-4" style={{ borderLeftColor: stat.color.replace('text-', 'var(--') }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                                ) : (
                                    stat.value
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.desc}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
