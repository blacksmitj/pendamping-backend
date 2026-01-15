'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, Mentor } from "@/types/dashboard";

const fetchMentors = async (): Promise<ApiListResponse<Mentor>> => {
  const response = await fetch("/api/mentors");

  if (!response.ok) {
    throw new Error("Unable to fetch mentors");
  }

  return response.json();
};

export function useMentors() {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: fetchMentors,
  });
}
