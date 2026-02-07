import { useState } from "react";
import { useUniversityParticipants } from "@/hooks/use-university-detail";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, ChevronLeft, ChevronRight, Building, Search, RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { ParticipantCard } from "@/app/(dashboard)/_components/participant-card";

function AvatarBubble({ photo, name }: { photo?: string | null; name: string }) {
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    return (
        <Avatar className="h-10 w-10 border border-border/50 shadow-sm mr-3">
            {photo && <AvatarImage src={photo} alt={name} className="object-cover" />}
            <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground uppercase">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}

export function UniversityParticipantsTab({ universityId }: { universityId: string }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const pageSize = 12;

    const { data, isLoading, isError, refetch, isFetching } = useUniversityParticipants(universityId, {
        page,
        pageSize,
        search: debouncedSearch
    });

    if (isError) return <div className="py-10 text-center text-muted-foreground">Gagal memuat data peserta.</div>;

    const participants = data?.data || [];
    const totalPages = data?.totalPages || 1;

    if (!isLoading && participants.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <User className="mb-2 h-8 w-8" />
                <p>Belum ada peserta yang terdaftar di universitas ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama peserta atau usaha..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9 bg-background"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center p-4 border rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full mr-3" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : (
                    participants.map((p) => (
                        <ParticipantCard
                            key={p.uuid}
                            id={p.uuid}
                            id_tkm={p.nik}
                            name={p.name}
                            photo={p.photo}
                            businessName={p.businessName}
                            sector={p.sector}
                            status={p.status}
                            state={p.state}
                            omsetGrowth={p.omsetGrowth}
                            newJobs={p.newJobs}
                        />
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Sebelum
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Sesudah <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
