'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams, Mentor } from "@/types/dashboard";

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

const fetchMentors = async (
  params: ListQueryParams
): Promise<ApiListResponse<Mentor>> => {
  const response = await fetch(`/api/mentors${buildQueryString(params)}`);

  if (!response.ok) {
    throw new Error("Unable to fetch mentors");
  }

  return response.json();
};

export function useMentors(params: ListQueryParams) {
  return useQuery({
    queryKey: ["mentors", params],
    queryFn: () => fetchMentors(params),
    placeholderData: (previousData) => previousData,
  });
}
