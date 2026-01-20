'use client';

import { useQuery } from "@tanstack/react-query";
import { DashboardSummary } from "@/types/dashboard";

const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await fetch("/api/dashboard/summary");

  if (!response.ok) {
    throw new Error("Unable to fetch dashboard summary");
  }

  return response.json();
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 60_000, // keep for a minute to reduce refetching
  });
}
