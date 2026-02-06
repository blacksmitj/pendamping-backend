'use client';

import { MentorParticipant } from "@/hooks/use-mentor-detail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Phone, User } from "lucide-react";
import Link from "next/link";
import { ParticipantCard } from "@/app/(dashboard)/_components/participant-card";

export function MentorParticipantsTab({ participants }: { participants: MentorParticipant[] }) {
    if (participants.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <User className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Tidak ada peserta yang dikelola oleh mentor ini.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((p) => (
                <ParticipantCard
                    key={p.uuid}
                    id={p.uuid}
                    id_tkm={p.nik}
                    name={p.name}
                    photo={p.photo}
                    businessName={p.businessName}
                    sector={p.sector}
                    phone={p.phone}
                    status={p.status}
                    state={p.state}
                    omsetGrowth={p.omsetGrowth}
                    newJobs={p.newJobs}
                />
            ))}
        </div>
    );
}
