"use client";

import dynamic from "next/dynamic";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopPerformers } from "@/components/dashboard/top-performers";
import { UniversityStats } from "@/components/dashboard/university-stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Dynamic import for Leaflet map to avoid SSR issues
const DashboardMap = dynamic(
  () => import("@/components/dashboard/dashboard-map"),
  {
    ssr: false,
    loading: () => <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted/20" />
  }
);

export default function DashboardPage() {
  const {
    data: summary,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useDashboardSummary();

  const handleRefresh = async () => {
    await refetch();
  };

  const lastUpdated = summary?.updatedAt
    ? new Date(summary.updatedAt).toLocaleString()
    : "Not available";

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold text-destructive">Failed to load dashboard data</h2>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of program performance, participants, and partner universities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden md:inline-block">
            Last updated: {lastUpdated}
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open('/api/export/output', '_blank')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <StatsCards counts={summary?.counts} isLoading={isLoading} />

      {/* Map Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-3 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>
              Distribution of participants across Indonesian provinces.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 pt-0">
            <div className="h-[400px] w-full rounded-xl overflow-hidden">
              <DashboardMap data={summary?.mapDistribution || []} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers (Growth & Mentors) */}
      <TopPerformers
        topParticipants={summary?.topOmzetParticipants || []}
        topMentors={summary?.topMentorsVisits || []}
        isLoading={isLoading}
      />

      {/* University Stats */}
      <UniversityStats
        stats={summary?.universityStats || []}
        isLoading={isLoading}
      />
    </div>
  );
}
