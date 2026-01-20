'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams, LogbookEntry } from "@/types/dashboard";

const buildQueryString = (params: ListQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.filterCondition) searchParams.set("condition", params.filterCondition);
  if (params.filterVerified) searchParams.set("verified", params.filterVerified);
  if (params.filterDate) searchParams.set("date", params.filterDate);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const fetchLogbooks = async (
  params: ListQueryParams
): Promise<ApiListResponse<LogbookEntry>> => {
  const response = await fetch(`/api/logbooks${buildQueryString(params)}`);

  if (!response.ok) {
    throw new Error("Unable to fetch logbooks");
  }

  return response.json();
};

export function useLogbooks(params: ListQueryParams) {
  return useQuery({
    queryKey: ["logbooks", params],
    queryFn: () => fetchLogbooks(params),
    placeholderData: (previousData) => previousData,
  });
}
