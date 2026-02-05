'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams, Participant } from "@/types/dashboard";

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
