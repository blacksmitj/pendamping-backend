"use client";

import { useState } from "react";
import { useParticipantLogbooks } from "@/hooks/use-participant-logbooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar, Clock, User2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const monthOptions = [
    { value: "all", label: "Semua Bulan" },
    { value: "1", label: "Bulan 1" },
    { value: "2", label: "Bulan 2" },
    { value: "3", label: "Bulan 3" },
    { value: "4", label: "Bulan 4" },
    { value: "5", label: "Bulan 5" },
    { value: "6", label: "Bulan 6" },
    { value: "7", label: "Bulan 7" },
    { value: "8", label: "Bulan 8" },
    { value: "9", label: "Bulan 9" },
    { value: "10", label: "Bulan 10" },
    { value: "11", label: "Bulan 11" },
    { value: "12", label: "Bulan 12" },
];

const verificationOptions = [
    { value: "all", label: "Semua Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
];

const getVerificationBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">N/A</Badge>;

    switch (status.toLowerCase()) {
        case "approved":
            return <Badge variant="default">Disetujui</Badge>;
        case "rejected":
            return <Badge variant="destructive">Ditolak</Badge>;
        case "pending":
            return <Badge variant="secondary">Pending</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMM yyyy", { locale: localeId });
};

const formatTime = (time: Date | null) => {
    if (!time) return "-";
    return format(new Date(time), "HH:mm", { locale: localeId });
};

export function LogbookTab({ participantId }: { participantId: string }) {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [monthFilter, setMonthFilter] = useState("all");
    const [verifiedFilter, setVerifiedFilter] = useState("all");

    const { data, isLoading, isError } = useParticipantLogbooks({
        id: participantId,
        page,
        pageSize,
        month: monthFilter === "all" ? undefined : parseInt(monthFilter),
        verified: verifiedFilter === "all" ? undefined : verifiedFilter,
    });

    const logbooks = data?.data || [];
    const pagination = data?.pagination;

    if (isError) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                        Gagal memuat data logbook. Silakan coba lagi.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logbook Harian</CardTitle>
                <CardDescription>Riwayat logbook pendampingan peserta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Select value={monthFilter} onValueChange={(value) => {
                            setMonthFilter(value);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Filter Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={verifiedFilter} onValueChange={(value) => {
                            setVerifiedFilter(value);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {verificationOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {pagination && (
                        <p className="text-sm text-muted-foreground">
                            Total: {pagination.totalItems} logbook
                        </p>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Aktivitas</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead className="text-center">JPL</TableHead>
                                <TableHead>Mentor</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : logbooks.length > 0 ? (
                                logbooks.map((logbook) => (
                                    <TableRow key={logbook.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{formatDate(logbook.logbookDate)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTime(logbook.startTime)} - {formatTime(logbook.endTime)}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <p className="font-medium truncate">{logbook.activitySummary || "-"}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {logbook.mentoringMaterial || "-"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>{logbook.deliveryMethod || "-"}</p>
                                                <p className="text-xs text-muted-foreground">{logbook.visitType || "-"}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-medium">{logbook.jpl || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {logbook.pendamping ? (
                                                <div className="flex items-center gap-2">
                                                    <User2 className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">{logbook.pendamping.name}</p>
                                                        <p className="text-xs text-muted-foreground">{logbook.pendamping.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getVerificationBadge(logbook.verified)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <p className="text-muted-foreground">Tidak ada data logbook</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Halaman {pagination.page} dari {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.totalPages || isLoading}
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
