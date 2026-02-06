
import Link from "next/link";
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
            colorClass: "text-chart-1 border-l-chart-1",
            desc: "Registered & Verified",
            href: "/participants"
        },
        {
            label: "Active Mentors",
            value: counts?.mentors ?? 0,
            icon: UserCheck,
            colorClass: "text-chart-2 border-l-chart-2",
            desc: "Role: User",
            href: "/mentors"
        },
        {
            label: "Partner Universities",
            value: counts?.universities ?? 0,
            icon: School,
            colorClass: "text-chart-3 border-l-chart-3",
            desc: "Total Registered",
            href: "/universities"
        },
        {
            label: "New Employees",
            value: counts?.newEmployees ?? 0,
            icon: Briefcase,
            colorClass: "text-chart-4 border-l-chart-4",
            desc: "Added by Participants",
            href: null
        },
        {
            label: "Avg. Omzet Growth",
            value: `${counts?.avgOmzetGrowth?.toFixed(1) ?? 0}%`,
            icon: TrendingUp,
            colorClass: "text-chart-5 border-l-chart-5",
            desc: "Global Average",
            href: null
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const content = (
                    <Card
                        className={`overflow-hidden border-l-4 ${stat.colorClass.split(' ')[1]} ${stat.href ? 'cursor-pointer hover:shadow-md hover:bg-accent/50 transition-all' : ''}`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.colorClass.split(' ')[0]}`} />
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

                return stat.href ? (
                    <Link key={index} href={stat.href}>
                        {content}
                    </Link>
                ) : (
                    <div key={index}>{content}</div>
                );
            })}
        </div>
    );
}
