import { useQuery } from "@tanstack/react-query";
import type { ParticipantDocuments, DocumentStats } from "@/types/participant";

export function useParticipantDocuments(id: string | number) {
    return useQuery({
        queryKey: ["participant-documents", id],
        queryFn: async () => {
            const response = await fetch(`/api/participants/${id}/documents`);
            if (!response.ok) {
                throw new Error("Failed to fetch participant documents");
            }
            const data = await response.json();
            return {
                documents: data.documents as ParticipantDocuments,
                stats: data.stats as DocumentStats,
            };
        },
        enabled: !!id,
    });
}
