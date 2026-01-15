'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, Participant } from "@/types/dashboard";

const fetchParticipants = async (): Promise<ApiListResponse<Participant>> => {
  const response = await fetch("/api/participants");

  if (!response.ok) {
    throw new Error("Unable to fetch participants");
  }

  return response.json();
};

export function useParticipants() {
  return useQuery({
    queryKey: ["participants"],
    queryFn: fetchParticipants,
  });
}
