import { useQuery } from "@tanstack/react-query";
import type { ParticipantDetail } from "@/types/participant";

export function useParticipantDetail(id: string | number) {
    return useQuery({
        queryKey: ["participant", id],
        queryFn: async () => {
            const response = await fetch(`/api/participants/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch participant detail");
            }
            const data = await response.json();
            return data.participant as ParticipantDetail;
        },
        enabled: !!id,
    });
}
