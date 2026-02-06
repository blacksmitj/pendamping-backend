'use client';

import { useState } from "react";
import { useMentorLogbooks } from "@/hooks/use-mentor-detail";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight, FileText, User2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

export function MentorLogbookTab({ mentorId }: { mentorId: string }) {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isError } = useMentorLogbooks(mentorId, { page, pageSize });

    if (isError) {
        return (
            <div className="py-10 text-center">
                <p className="text-muted-foreground">Gagal memuat data logbook.</p>
            </div>
        );
    }

    const logbooks = data?.data || [];
    const totalPages = data?.totalPages || 1;

    if (!isLoading && logbooks.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Mentor ini belum pernah menginput logbook.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Aktivitas</TableHead>
                            <TableHead>Peserta</TableHead>
                            <TableHead className="text-center">JPL</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            logbooks.map((l) => (
                                <TableRow key={l.id} className="cursor-pointer hover:bg-accent group">
                                    <TableCell className="w-[150px]">
                                        <Link href={`/logbooks/${l.id}`} className="flex flex-col">
                                            <span className="font-medium">{format(new Date(l.date), "dd MMM yyyy", { locale: localeId })}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {l.startTime ? format(new Date(l.startTime), "HH:mm") : "-"} - {l.endTime ? format(new Date(l.endTime), "HH:mm") : "-"}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/logbooks/${l.id}`} className="max-w-[300px] block">
                                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                                                {l.activitySummary || "Tanpa ringkasan"}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{l.deliveryMethod}</p>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {l.attendees.length > 0 ? (
                                                l.attendees.map(a => (
                                                    <Link
                                                        key={a.id}
                                                        href={`/participants/${a.participantId}`}
                                                        className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors w-fit"
                                                    >
                                                        <User2 className="h-3 w-3 text-muted-foreground" />
                                                        <span className="truncate">{a.name}</span>
                                                    </Link>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        <Link href={`/logbooks/${l.id}`}>{l.jpl}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/logbooks/${l.id}`}>
                                            <Badge variant={l.isVerified === "approved" ? "default" : l.isVerified === "rejected" ? "destructive" : "secondary"}>
                                                {l.isVerified || "Pending"}
                                            </Badge>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Halaman {page} dari {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
