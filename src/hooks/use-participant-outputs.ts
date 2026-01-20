import { useQuery } from "@tanstack/react-query";
import type { Output, OutputSummary } from "@/types/participant";

export function useParticipantOutputs(id: string | number) {
    return useQuery({
        queryKey: ["participant-outputs", id],
        queryFn: async () => {
            const response = await fetch(`/api/participants/${id}/outputs`);
            if (!response.ok) {
                throw new Error("Failed to fetch participant outputs");
            }
            const data = await response.json();
            return {
                outputs: data.outputs as Output[],
                summary: data.summary as OutputSummary,
            };
        },
        enabled: !!id,
    });
}
