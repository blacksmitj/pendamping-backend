'use client';

import { useState } from "react";
import { useMentorOutputs } from "@/hooks/use-mentor-detail";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

export function MentorOutputTab({ mentorId }: { mentorId: string }) {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isError } = useMentorOutputs(mentorId, { page, pageSize });

    if (isError) {
        return (
            <div className="py-10 text-center">
                <p className="text-muted-foreground">Gagal memuat data output.</p>
            </div>
        );
    }

    const reports = data?.data || [];
    const totalPages = data?.totalPages || 1;

    if (!isLoading && reports.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada laporan output untuk peserta mentor ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Periode</TableHead>
                            <TableHead>Peserta</TableHead>
                            <TableHead>Omset</TableHead>
                            <TableHead>Volume Jual</TableHead>
                            <TableHead>Kondisi</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            reports.map((r) => (
                                <TableRow key={r.id} className="cursor-pointer hover:bg-accent group">
                                    <TableCell>
                                        <Link href={`/outputs/${r.id}`} className="font-medium">
                                            Bulan {r.month} / {r.year}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {r.participantName}
                                            </span>
                                            <Link
                                                href={`/participants/${r.participantId}`}
                                                className="text-[10px] text-muted-foreground hover:text-primary hover:underline transition-colors w-fit"
                                            >
                                                Lihat Profil
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/outputs/${r.id}`} className="text-sm">
                                            {formatCurrency(Number(r.revenue))}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/outputs/${r.id}`} className="text-sm">
                                            {r.salesVolume || "-"}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/outputs/${r.id}`}>
                                            <Badge variant="outline" className="capitalize">
                                                {r.condition || "-"}
                                            </Badge>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/outputs/${r.id}`}>
                                            <Badge variant={r.isVerified === "approved" ? "default" : r.isVerified === "rejected" ? "destructive" : "secondary"}>
                                                {r.isVerified || "Pending"}
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
