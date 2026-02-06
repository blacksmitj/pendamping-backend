
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UniversityStat } from "@/types/dashboard";
import { Users, UserCheck, Briefcase, TrendingUp } from "lucide-react";

interface UniversityStatsProps {
    stats: UniversityStat[];
    isLoading?: boolean;
}

export function UniversityStats({ stats, isLoading }: UniversityStatsProps) {
    if (isLoading) {
        return <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">University Performance</h2>
                <Link href="/universities" className="text-sm text-primary hover:underline">
                    View all {stats.length} universities →
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {stats.slice(0, 9).map((univ) => (
                    <Link key={univ.university_id} href={`/universities/${univ.university_id}`}>
                        <Card className="hover:shadow-md hover:bg-accent/50 transition-all cursor-pointer h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base line-clamp-1" title={univ.university_name}>
                                    {univ.university_name}
                                </CardTitle>
                                <CardDescription>Performance Metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <UserCheck className="h-3 w-3" /> Mentors
                                        </div>
                                        <div className="font-semibold">{univ.total_mentors}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3 w-3" /> Participants
                                        </div>
                                        <div className="font-semibold">{univ.total_participants}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Briefcase className="h-3 w-3" /> New Jobs
                                        </div>
                                        <div className="font-semibold text-primary">+{univ.total_new_employees}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <TrendingUp className="h-3 w-3" /> Growth
                                        </div>
                                        <div className={`font-semibold ${univ.avg_growth >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                            {univ.avg_growth.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {stats.length > 9 && (
                <div className="text-center mt-4">
                    <Link href="/universities" className="text-sm text-primary hover:underline">
                        View all {stats.length} universities →
                    </Link>
                </div>
            )}
        </div>
    );
}
