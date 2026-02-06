'use client';

import { useQuery } from "@tanstack/react-query";
import { ApiListResponse, ListQueryParams } from "@/types/dashboard";

export interface MentorDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    nik: string;
    gender: string;
    photo: string | null;
    specialization: string | null;
    university: {
        id: string;
        name: string;
        city: string | null;
        province: string | null;
    } | null;
    stats: {
        totalParticipants: number;
        totalLogbooks: number;
        totalMonthlyReports: number;
    };
}

export interface MentorParticipant {
    id: string;
    uuid: string;
    name: string;
    photo: string | null;
    nik: string;
    phone: string;
    university: string;
    businessName: string;
    sector: string;
    status: string;
    state: string;
    assignmentDate: string;
    omsetGrowth: number;
    newJobs: number;
}

export interface MentorLogbook {
    id: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    activitySummary: string | null;
    deliveryMethod: string | null;
    jpl: number;
    isVerified: string;
    attendees: { id: string, name: string }[];
}

export interface MentorOutput {
    id: string;
    month: number;
    year: number;
    revenue: number | null;
    salesVolume: number | null;
    condition: string | null;
    isVerified: string;
    participantName: string;
    participantId: string;
}

const fetchMentorDetail = async (id: string): Promise<MentorDetail> => {
    const response = await fetch(`/api/mentors/${id}`);
    if (!response.ok) throw new Error("Failed to fetch mentor details");
    return response.json();
};

const fetchMentorParticipants = async (id: string): Promise<MentorParticipant[]> => {
    const response = await fetch(`/api/mentors/${id}/participants`);
    if (!response.ok) throw new Error("Failed to fetch mentor participants");
    return response.json();
};

const fetchMentorLogbooks = async (id: string, params: ListQueryParams): Promise<ApiListResponse<MentorLogbook>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    const response = await fetch(`/api/mentors/${id}/logbooks?${searchParams.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch mentor logbooks");
    return response.json();
};

const fetchMentorOutputs = async (id: string, params: ListQueryParams): Promise<ApiListResponse<MentorOutput>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    const response = await fetch(`/api/mentors/${id}/outputs?${searchParams.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch mentor outputs");
    return response.json();
};

export function useMentorDetail(id: string) {
    return useQuery({
        queryKey: ["mentor-detail", id],
        queryFn: () => fetchMentorDetail(id),
    });
}

export function useMentorParticipants(id: string) {
    return useQuery({
        queryKey: ["mentor-participants", id],
        queryFn: () => fetchMentorParticipants(id),
    });
}

export function useMentorLogbooks(id: string, params: ListQueryParams) {
    return useQuery({
        queryKey: ["mentor-logbooks", id, params],
        queryFn: () => fetchMentorLogbooks(id, params),
        placeholderData: (previousData) => previousData,
    });
}

export function useMentorOutputs(id: string, params: ListQueryParams) {
    return useQuery({
        queryKey: ["mentor-outputs", id, params],
        queryFn: () => fetchMentorOutputs(id, params),
        placeholderData: (previousData) => previousData,
    });
}
