'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams, University } from "@/types/dashboard";

const buildQueryString = (params: ListQueryParams) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value.toString());
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const fetchUniversities = async (
  params: ListQueryParams
): Promise<ApiListResponse<University>> => {
  const response = await fetch(`/api/universities${buildQueryString(params)}`);

  if (!response.ok) {
    throw new Error("Unable to fetch universities");
  }

  return response.json();
};

export function useUniversities(params: ListQueryParams) {
  return useQuery({
    queryKey: ["universities", params],
    queryFn: () => fetchUniversities(params),
    placeholderData: (previousData) => previousData,
  });
}
