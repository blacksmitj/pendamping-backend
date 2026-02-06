'use client';

import { useQuery } from "@tanstack/react-query";
import {
  DashboardSummary,
  MapDistribution,
  TopOmzetParticipant,
  TopMentorVisit,
  UniversityStat
} from "@/types/dashboard";

const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await fetch("/api/dashboard/summary");
  if (!response.ok) throw new Error("Unable to fetch dashboard summary");
  return response.json();
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 60_000,
  });
}

// New Hooks for Partial Loading

export function useDashboardCounts() {
  return useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/counts");
      if (!res.ok) throw new Error("Failed to fetch counts");
      return res.json() as Promise<DashboardSummary["counts"]>;
    },
    staleTime: 60_000,
  });
}

export function useDashboardMap() {
  return useQuery({
    queryKey: ["dashboard-map"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/map");
      if (!res.ok) throw new Error("Failed to fetch map data");
      return res.json() as Promise<MapDistribution[]>;
    },
    staleTime: 60_000,
  });
}

export function useDashboardTopPerformers() {
  return useQuery({
    queryKey: ["dashboard-top-performers"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/top-performers");
      if (!res.ok) throw new Error("Failed to fetch top performers");
      return res.json() as Promise<{
        topParticipants: TopOmzetParticipant[];
        topMentors: TopMentorVisit[];
      }>;
    },
    staleTime: 60_000,
  });
}

export function useDashboardUniversityStats() {
  return useQuery({
    queryKey: ["dashboard-university-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/university-stats");
      if (!res.ok) throw new Error("Failed to fetch university stats");
      return res.json() as Promise<UniversityStat[]>;
    },
    staleTime: 60_000,
  });
}
