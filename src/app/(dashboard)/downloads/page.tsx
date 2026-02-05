
"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Download,
    FileSpreadsheet,
    Plus,
    History,
    FileText,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ArrowUpDown,
    DownloadCloud
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ExportDialog } from "@/components/dashboard/export-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ExportLog {
    id: string
    filename: string
    file_url: string | null
    type: string
    filters: any
    status: string
    created_at: string
}

export default function DownloadsPage() {
    const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const { data: history, isLoading, refetch } = useQuery<ExportLog[]>({
        queryKey: ["export-history"],
        queryFn: async () => {
            const res = await fetch("/api/export/history")
            if (!res.ok) throw new Error("Failed to fetch history")
            return res.json()
        }
    })

    const filteredHistory = history?.filter(log =>
        log.filename.toLowerCase().includes(search.toLowerCase()) ||
        log.type.toLowerCase().includes(search.toLowerCase())
    )

    const getReportTypeLabel = (type: string) => {
        return type === "logbook" ? "Logbook Detail" : "Capaian Output"
    }

    const formatFilters = (filters: any) => {
        if (!filters) return "Semua Data"
        const parts = []
        if (filters.status) parts.push(`Status: ${filters.status}`)
        if (filters.verified && filters.verified !== "all") parts.push(`Verif: ${filters.verified}`)
        if (filters.dateStart) parts.push(`Dari: ${filters.dateStart}`)
        if (filters.dateEnd) parts.push(`Ke: ${filters.dateEnd}`)
        return parts.length > 0 ? parts.join(" | ") : "Default Filter"
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Riwayat Unduhan</h1>
                    <p className="text-muted-foreground">Kelola dan lihat daftar laporan yang telah Anda generate sebelumnya.</p>
                </div>
                <Button onClick={() => setIsExportDialogOpen(true)} className="bg-primary text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Laporan Baru
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Total Laporan</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{history?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Laporan tersimpan di server</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Logbook Detail</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{history?.filter(h => h.type === "logbook").length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Laporan detail kegiatan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Capaian Output</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{history?.filter(h => h.type === "output").length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Laporan perkembangan usaha</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>History Log</CardTitle>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama file..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Nama File</TableHead>
                                <TableHead>Jenis Laporan</TableHead>
                                <TableHead>Filter</TableHead>
                                <TableHead>Tanggal Dibuat</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredHistory?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <DownloadCloud className="h-8 w-8 opacity-20" />
                                            <p>Belum ada riwayat unduhan.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredHistory?.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-accent/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                                <span className="truncate max-w-[200px]">{log.filename}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {getReportTypeLabel(log.type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                            {formatFilters(log.filters)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {log.status === "completed" ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-yellow-500" />
                                                )}
                                                <span className="text-xs capitalize">{log.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Because we don't store physical files yet, we re-trigger the download via API with same filters */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:text-primary"
                                                onClick={() => {
                                                    const params = new URLSearchParams()
                                                    if (log.filters) {
                                                        Object.entries(log.filters).forEach(([k, v]: any) => {
                                                            if (v) params.append(k, v)
                                                        })
                                                    }
                                                    window.open(`/api/export/${log.type}?${params.toString()}`, '_blank')
                                                }}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ExportDialog
                open={isExportDialogOpen}
                onOpenChange={(open) => {
                    setIsExportDialogOpen(open)
                    if (!open) refetch() // Refresh history after dialog closes
                }}
            />
        </div>
    )
}
