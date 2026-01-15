'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, University } from "@/types/dashboard";

const fetchUniversities = async (): Promise<ApiListResponse<University>> => {
  const response = await fetch("/api/universities");

  if (!response.ok) {
    throw new Error("Unable to fetch universities");
  }

  return response.json();
};

export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
  });
}
