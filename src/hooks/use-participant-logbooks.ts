import { useQuery } from "@tanstack/react-query";
import type { Logbook, Pagination } from "@/types/participant";

interface UseParticipantLogbooksParams {
    id: string | number;
    page?: number;
    pageSize?: number;
    month?: number;
    verified?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export function useParticipantLogbooks({
    id,
    page = 1,
    pageSize = 10,
    month,
    verified,
    sortBy = "logbookDate",
    sortOrder = "desc",
}: UseParticipantLogbooksParams) {
    return useQuery({
        queryKey: ["participant-logbooks", id, page, pageSize, month, verified, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                sortBy,
                sortOrder,
            });

            if (month) params.append("month", month.toString());
            if (verified) params.append("verified", verified);

            const response = await fetch(
                `/api/participants/${id}/logbooks?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch participant logbooks");
            }

            const data = await response.json();
            return {
                data: data.data as Logbook[],
                pagination: data.pagination as Pagination,
            };
        },
        enabled: !!id,
    });
}
