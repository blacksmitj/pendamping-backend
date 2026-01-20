"use client";

import { GraduationCap, Phone, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { StatCard } from "../_components/dashboard-ui";

export default function DashboardPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    isFetching: summaryFetching,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const totalParticipants = summary?.participants ?? 0;
  const totalMentors = summary?.mentors ?? 0;
  const totalUniversities = summary?.universities ?? 0;
  const lastUpdated = summary?.updatedAt
    ? new Date(summary.updatedAt).toLocaleString()
    : "Not available";

  const isRefreshing = summaryFetching;

  const handleRefreshAll = async () => {
    await refetchSummary();
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">App Router</Badge>
            <Badge variant="outline">Prisma live data</Badge>
            <Badge variant="outline">TanStack Query</Badge>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-slate-950 lg:text-4xl">
              Participants, mentors, and universities
            </h1>
            <p className="mt-2 max-w-3xl text-base text-muted-foreground">
              Use the sidebar for the full lists. The dashboard shows summary
              info only.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing ? "animate-spin text-primary" : ""
              }`}
            />
            Refresh data
          </Button>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Participants"
          value={summaryLoading ? "..." : totalParticipants.toString()}
          icon={<Users className="h-5 w-5 text-primary" />}
          hint="Total participants"
        />
        <StatCard
          label="Mentors"
          value={summaryLoading ? "..." : totalMentors.toString()}
          icon={<Phone className="h-5 w-5 text-emerald-600" />}
          hint="Active mentors"
        />
        <StatCard
          label="Universities"
          value={summaryLoading ? "..." : totalUniversities.toString()}
          icon={<GraduationCap className="h-5 w-5 text-sky-600" />}
          hint="Partner campuses"
        />
      </section>

      <Card className="border-border/80 bg-white/70">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Track the latest status without opening the full lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em]">Participants</p>
            <p>
              Data status:{" "}
              {summaryError
                ? "Failed to load"
                : summaryLoading
                ? "Loading"
                : "Ready"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em]">Mentors</p>
            <p>
              Data status:{" "}
              {summaryError
                ? "Failed to load"
                : summaryLoading
                ? "Loading"
                : "Ready"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em]">Universities</p>
            <p>
              Data status:{" "}
              {summaryError
                ? "Failed to load"
                : summaryLoading
                ? "Loading"
                : "Ready"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-white/70">
        <CardHeader>
          <CardTitle>Key info</CardTitle>
          <CardDescription>
            Quick snapshot of data freshness and navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Data freshness
            </p>
            <p className="mt-2 text-sm text-slate-900">
              {summaryError ? "Unavailable" : lastUpdated}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Timestamps updated whenever the summary endpoint is called.
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              API status
            </p>
            <p className="mt-2 text-sm text-slate-900">
              {summaryError
                ? "Issues fetching summary"
                : summaryLoading
                ? "Loading"
                : "Healthy"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Uses /api/dashboard/summary (Prisma + TanStack Query).
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Quick links
            </p>
            <ul className="mt-2 space-y-1 text-sm text-primary">
              <li>
                <a href="/participants" className="hover:underline">
                  View participants
                </a>
              </li>
              <li>
                <a href="/mentors" className="hover:underline">
                  View mentors
                </a>
              </li>
              <li>
                <a href="/universities" className="hover:underline">
                  View universities
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
