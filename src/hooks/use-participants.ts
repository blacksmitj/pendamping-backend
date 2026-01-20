'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams, Participant } from "@/types/dashboard";

const buildQueryString = (params: ListQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.status) searchParams.set("status", params.status);
  if (params.province) searchParams.set("province", params.province);
  if (params.city) searchParams.set("city", params.city);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const fetchParticipants = async (
  params: ListQueryParams
): Promise<ApiListResponse<Participant>> => {
  const response = await fetch(`/api/participants${buildQueryString(params)}`);

  if (!response.ok) {
    throw new Error("Unable to fetch participants");
  }

  return response.json();
};

export function useParticipants(params: ListQueryParams) {
  return useQuery({
    queryKey: ["participants", params],
    queryFn: () => fetchParticipants(params),
    placeholderData: (previousData) => previousData,
  });
}
