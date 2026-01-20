'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams, University } from "@/types/dashboard";

const buildQueryString = (params: ListQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

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
