import { useQuery } from "@tanstack/react-query";

export interface UniversityDetail {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    province: string | null;
    status: string;
    stats: {
        totalMentors: number;
        totalParticipants: number;
    };
}

export interface UniversityMentor {
    id: string;
    name: string;
    email: string;
    photo: string | null;
    nik: string | null;
    stats: {
        totalParticipants: number;
        totalLogbooks: number;
    };
}

export interface UniversityParticipant {
    id: string;
    uuid: string;
    name: string;
    photo: string | null;
    businessName: string;
    sector: string;
    status: string;
    state: string;
    nik: string;
    omsetGrowth: number;
    newJobs: number;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export function useUniversityDetail(id: string) {
    return useQuery<UniversityDetail>({
        queryKey: ["university", id],
        queryFn: async () => {
            const res = await fetch(`/api/universities/${id}`);
            if (!res.ok) throw new Error("Failed to fetch university details");
            return res.json();
        },
        enabled: !!id,
    });
}

export function useUniversityMentors(id: string, params: { page: number; pageSize: number; search?: string }) {
    return useQuery<PaginatedResponse<UniversityMentor>>({
        queryKey: ["university-mentors", id, params],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page.toString(),
                pageSize: params.pageSize.toString(),
            });
            if (params.search) searchParams.append("search", params.search);
            const res = await fetch(`/api/universities/${id}/mentors?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch mentors");
            return res.json();
        },
        enabled: !!id,
    });
}

export function useUniversityParticipants(id: string, params: { page: number; pageSize: number; search?: string }) {
    return useQuery<PaginatedResponse<UniversityParticipant>>({
        queryKey: ["university-participants", id, params],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page.toString(),
                pageSize: params.pageSize.toString(),
            });
            if (params.search) searchParams.append("search", params.search);
            const res = await fetch(`/api/universities/${id}/participants?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch participants");
            return res.json();
        },
        enabled: !!id,
    });
}
