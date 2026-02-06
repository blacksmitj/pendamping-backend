import { useState } from "react";
import { useUniversityMentors } from "@/hooks/use-university-detail";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronLeft, ChevronRight, GraduationCap, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

function AvatarBubble({ photo, name }: { photo?: string | null; name: string }) {
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground mr-3">
            {photo ? (
                <img src={photo} alt={name} className="h-full w-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
}

export function UniversityMentorsTab({ universityId }: { universityId: string }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const pageSize = 10;

    const { data, isLoading, isError, refetch, isFetching } = useUniversityMentors(universityId, {
        page,
        pageSize,
        search: debouncedSearch
    });

    if (isError) return <div className="py-10 text-center text-muted-foreground">Gagal memuat data mentor.</div>;

    const mentors = data?.data || [];
    const totalPages = data?.totalPages || 1;

    if (!isLoading && mentors.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Users className="mb-2 h-8 w-8" />
                <p>Belum ada mentor yang terdaftar di universitas ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau email..."
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

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mentor</TableHead>
                            <TableHead className="text-center">Total Peserta</TableHead>
                            <TableHead className="text-center">Total Kunjungan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-24 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-24 mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            mentors.map((m) => (
                                <TableRow key={m.id} className="cursor-pointer hover:bg-accent group">
                                    <TableCell>
                                        <Link href={`/mentors/${m.id}`} className="flex items-center py-1">
                                            <AvatarBubble photo={m.photo} name={m.name} />
                                            <div className="flex flex-col">
                                                <span className="font-medium group-hover:text-primary transition-colors">{m.name}</span>
                                                <span className="text-xs text-muted-foreground">{m.email}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {m.stats.totalParticipants}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {m.stats.totalLogbooks}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
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
