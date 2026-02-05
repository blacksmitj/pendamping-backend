
"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Download, Filter, Columns, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const LOGBOOK_COLUMNS = [
    { id: "tanggal", label: "Tanggal" },
    { id: "id_tkm", label: "ID TKM" },
    { id: "nama", label: "Nama" },
    { id: "nik", label: "NIK" },
    { id: "tgl_lahir", label: "Tgl Lahir" },
    { id: "umur", label: "Umur" },
    { id: "nama_usaha", label: "Nama Usaha" },
    { id: "jenis_usaha", label: "Jenis Usaha" },
    { id: "sektor_usaha", label: "Sektor Usaha" },
    { id: "alamat_usaha", label: "Alamat Usaha" },
    { id: "kelurahan_usaha", label: "Kelurahan Usaha" },
    { id: "kecamatan_usaha", label: "Kecamatan Usaha" },
    { id: "kota_usaha", label: "Kota Usaha" },
    { id: "provinsi_usaha", label: "Provinsi Usaha" },
    { id: "link_map_usaha_baru", label: "Link Map Usaha Baru" },
    { id: "no_whatsapp", label: "No WhatsApp" },
    { id: "no_whatsapp_baru", label: "No WhatsApp Baru" },
    { id: "penyandang_disabilitas", label: "Penyandang Disabilitas" },
    { id: "jenis_disabilitas", label: "Jenis Disabilitas" },
    { id: "nama_pendamping", label: "Nama Pendamping" },
    { id: "nik_pendamping", label: "NIK Pendamping" },
    { id: "wa_pendamping", label: "WA Pendamping" },
    { id: "jenis_kelamin_pendamping", label: "Jenis Kelamin Pendamping" },
    { id: "univ", label: "Universitas" },
    { id: "email_pendamping", label: "Email Pendamping" },
    { id: "status_komunikasi", label: "Status Komunikasi" },
    { id: "pencairan_dana_bantuan", label: "Pencairan Dana Bantuan" },
    { id: "bersedia_didampingi", label: "Bersedia Didampingi" },
    { id: "alasan_tdk_didampingi", label: "Alasan Tidak Didampingi" },
    { id: "keberadaan_tkml", label: "Keberadaan TKM" },
    { id: "status_kepesertaan_tkml", label: "Status Kepesertaan TKM" },
    { id: "metode", label: "Metode" },
    { id: "jam_mulai", label: "Jam Mulai" },
    { id: "jam_selesai", label: "Jam Selesai" },
    { id: "jpl", label: "JPL" },
    { id: "materi", label: "Materi" },
    { id: "dokumentasi", label: "Dokumentasi" },
    { id: "ringakasan_kegiatan", label: "Ringkasan Kegiatan" },
    { id: "kendala", label: "Kendala" },
    { id: "solusikendala", label: "Solusi Kendala" },
    { id: "rincian_biaya", label: "Rincian Biaya" },
    { id: "alasan_tdk_expense", label: "Alasan Tidak Expense" },
    { id: "total_expense", label: "Total Expense" },
    { id: "jenis_kunjungan", label: "Jenis Kunjungan" },
    { id: "jenis_pertemuan", label: "Jenis Pertemuan" },
    { id: "temu_bisnis", label: "Temu Bisnis" },
    { id: "alasan_direkomendasikan", label: "Alasan Direkomendasikan" },
    { id: "catatan_verifikasi", label: "Catatan Verifikasi" },
    { id: "verifikasi", label: "Verifikasi" },
];

const OUTPUT_COLUMNS = [
    { id: "id_tkm", label: "ID TKM" },
    { id: "nama", label: "Nama" },
    { id: "nik", label: "NIK" },
    { id: "tgl_lahir", label: "Tgl Lahir" },
    { id: "umur", label: "Umur" },
    { id: "nama_usaha", label: "Nama Usaha" },
    { id: "jenis_usaha", label: "Jenis Usaha" },
    { id: "sektor_usaha", label: "Sektor Usaha" },
    { id: "alamat_usaha", label: "Alamat Usaha" },
    { id: "kelurahan_usaha", label: "Kelurahan" },
    { id: "kecamatan_usaha", label: "Kecamatan" },
    { id: "kota_usaha", label: "Kota/Kab" },
    { id: "provinsi_usaha", label: "Provinsi" },
    { id: "pendamping", label: "Pendamping" },
    { id: "universitas", label: "Universitas" },
    { id: "nik_pendamping", label: "NIK Pendamping" },
    { id: "no_wa_pendamping", label: "WA Pendamping" },
    { id: "bersedia_didampingi", label: "Bersedia" },
    { id: "kehadiran", label: "Dapat Ditemukan" },
    { id: "state_peserta", label: "State" },
    { id: "status_peserta", label: "Status" },
    { id: "alasan_drop", label: "Alasan Drop" },
    ...[0, 1, 2, 3].flatMap(m => [
        { id: `omzet_m${m}`, label: `Omzet (M${m})` },
        { id: `prod_m${m}`, label: `Kapasitas Produksi (M${m})` },
        { id: `sales_m${m}`, label: `Volume Penjualan (M${m})` },
        { id: `area_m${m}`, label: `Area Pemasaran (M${m})` },
        { id: `buku_m${m}`, label: `Penerapan Buku Kas (M${m})` },
        { id: `bukti_buku_m${m}`, label: `Bukti Buku Kas (M${m})` },
        { id: `lr_m${m}`, label: `Penerapan Laba Rugi (M${m})` },
        { id: `bukti_lr_m${m}`, label: `Bukti Laba Rugi (M${m})` },
        { id: `ver_m${m}`, label: `Verifikasi (M${m})` },
        { id: `tk_m${m}`, label: `Tenaga Kerja Baru (M${m})` },
    ])
];

export function ExportDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [loading, setLoading] = React.useState(false)
    const [reportType, setReportType] = React.useState<"logbook" | "output">("logbook")
    const [statuses, setStatuses] = React.useState<string[]>(["active"])
    const [verified, setVerified] = React.useState<string>("all")
    const [universityStatus, setUniversityStatus] = React.useState<string>("all")
    const [dateStart, setDateStart] = React.useState("")
    const [dateEnd, setDateEnd] = React.useState("")
    const [selectedColumns, setSelectedColumns] = React.useState<string[]>([])

    // Update columns selection when report type changes
    React.useEffect(() => {
        setSelectedColumns(reportType === "logbook"
            ? LOGBOOK_COLUMNS.map(c => c.id)
            : OUTPUT_COLUMNS.map(c => c.id))
    }, [reportType])

    const handleStatusToggle = (status: string) => {
        setStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        )
    }

    const handleColumnToggle = (id: string) => {
        setSelectedColumns(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        )
    }

    const handleExport = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statuses.length > 0) params.append("status", statuses.join(","))
            if (verified !== "all") params.append("verified", verified)
            if (universityStatus !== "all") params.append("university_status", universityStatus)
            if (dateStart) params.append("date_start", dateStart)
            if (dateEnd) params.append("date_end", dateEnd)
            if (selectedColumns.length > 0) params.append("columns", selectedColumns.join(","))

            const url = reportType === "logbook"
                ? `/api/export/logbook?${params.toString()}`
                : `/api/export/output?${params.toString()}`

            window.open(url, '_blank')
            onOpenChange(false)
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setLoading(false)
        }
    }


    const availableColumns = reportType === "logbook" ? LOGBOOK_COLUMNS : OUTPUT_COLUMNS

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Export Data Berdasarkan Filter
                    </DialogTitle>
                    <DialogDescription>
                        Pilih jenis laporan dan filter yang diinginkan untuk mengunduh file Excel.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Report Type */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Jenis Laporan</Label>
                        <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih jenis laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="logbook">Laporan Detail Logbook</SelectItem>
                                <SelectItem value="output">Laporan Capaian Output</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Participant Status */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Status Peserta</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {["active", "drop", "pending"].map((s) => (
                                <div key={s} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`status-${s}`}
                                        checked={statuses.includes(s)}
                                        onCheckedChange={() => handleStatusToggle(s)}
                                    />
                                    <Label htmlFor={`status-${s}`} className="capitalize">{s}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Status Laporan (Verifikasi)</Label>
                        <Select value={verified} onValueChange={setVerified}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="success">Berhasil (Success)</SelectItem>
                                <SelectItem value="pending">Menunggu (Pending)</SelectItem>
                                <SelectItem value="failed">Gagal (Failed)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* University Status */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Status Universitas</Label>
                        <Select value={universityStatus} onValueChange={setUniversityStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status universitas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Universitas</SelectItem>
                                <SelectItem value="active">Universitas Aktif</SelectItem>
                                <SelectItem value="inactive">Universitas Tidak Aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Period Filter (Logbook only) */}
                    {reportType === "logbook" && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Periode Tanggal Logbook</Label>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Dari</Label>
                                    <DatePicker value={dateStart} onChange={setDateStart} />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Sampai</Label>
                                    <DatePicker value={dateEnd} onChange={setDateEnd} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Column Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Pilih Kolom</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setSelectedColumns(selectedColumns.length === availableColumns.length ? [] : availableColumns.map(c => c.id))}
                            >
                                {selectedColumns.length === availableColumns.length ? "Hapus Semua" : "Pilih Semua"}
                            </Button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-accent/20">
                            {availableColumns.map((col) => (
                                <div key={col.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`col-${col.id}`}
                                        checked={selectedColumns.includes(col.id)}
                                        onCheckedChange={() => handleColumnToggle(col.id)}
                                    />
                                    <Label htmlFor={`col-${col.id}`} className="text-xs leading-tight">{col.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Batal
                    </Button>
                    <Button onClick={handleExport} disabled={loading || (statuses.length === 0 && verified === "all") || selectedColumns.length === 0}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Proses Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
