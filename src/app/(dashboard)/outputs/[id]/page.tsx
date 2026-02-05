"use client";

import { use, useState } from "react";
import { useOutputDetail, OutputEmployee } from "@/hooks/use-output-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    User,
    Building2,
    TrendingUp,
    Package,
    ShoppingCart,
    MapPin,
    BookOpen,
    FileCheck,
    MessageCircle,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Users,
    Calendar,
    FileText,
    Eye,
    ExternalLink,
    Download,
    Briefcase
} from "lucide-react";
import Link from "next/link";

const formatCurrency = (value: number | null) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

const getMonthName = (month: number) => {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[month - 1] || "-";
};

const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const getVerificationBadge = (status: string) => {
    switch (status) {
        case "success":
        case "approved":
            return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Terverifikasi</Badge>;
        case "failed":
        case "rejected":
            return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
        default:
            return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Menunggu</Badge>;
    }
};

// Helper to check if URL is a PDF
const isPdfUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.pdf') || lower.includes('pdf') || lower.includes('application/pdf');
};

// Helper to get file name from URL
const getFileName = (url: string) => {
    if (!url) return "Dokumen";
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        const segments = path.split('/');
        const fileName = segments[segments.length - 1];
        return decodeURIComponent(fileName) || "Dokumen";
    } catch {
        return "Dokumen";
    }
};

const getGenderLabel = (gender: string | null) => {
    if (gender === 'L' || gender === 'l') return 'Laki-laki';
    if (gender === 'P' || gender === 'p') return 'Perempuan';
    return gender || '-';
};

export default function OutputDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: output, isLoading, isError } = useOutputDetail(id);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [pdfPreview, setPdfPreview] = useState<{ url: string; title: string } | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (isError || !output) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                        Gagal memuat data output. Silakan coba lagi.
                    </p>
                    <Link href="/outputs">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Daftar
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    // Handle document click - if PDF, show dialog; otherwise show image preview
    const handleDocumentClick = (url: string, title: string) => {
        if (isPdfUrl(url)) {
            setPdfPreview({ url, title });
        } else {
            setPreviewImage(url);
        }
    };

    // Render document preview component - shows image thumbnail or PDF icon
    const renderDocumentPreview = (url: string, title: string) => {
        if (!url) return null;

        if (isPdfUrl(url)) {
            return (
                <div className="flex flex-col items-center gap-2">
                    <div className="aspect-video rounded-lg border bg-muted/50 flex flex-col items-center justify-center p-4">
                        <FileText className="w-12 h-12 text-red-500 mb-2" />
                        <p className="text-xs text-muted-foreground text-center truncate max-w-full">
                            {getFileName(url)}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDocumentClick(url, title)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat PDF
                    </Button>
                </div>
            );
        }

        return (
            <div
                className="aspect-video rounded-lg border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleDocumentClick(url, title)}
            >
                <img
                    src={url}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-h-full max-w-full">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-1 shadow-lg hover:bg-gray-100"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Viewer Dialog */}
            <Dialog open={!!pdfPreview} onOpenChange={(open) => !open && setPdfPreview(null)}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-500" />
                            {pdfPreview?.title || "Dokumen PDF"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 rounded-lg border overflow-hidden bg-muted">
                        {pdfPreview && (
                            <iframe
                                src={pdfPreview.url}
                                className="w-full h-full"
                                title={pdfPreview.title}
                            />
                        )}
                    </div>
                    <div className="flex-shrink-0 flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(pdfPreview?.url, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Buka di Tab Baru
                        </Button>
                        <Button
                            variant="default"
                            className="flex-1"
                            asChild
                        >
                            <a href={pdfPreview?.url} download>
                                <Download className="w-4 h-4 mr-2" />
                                Unduh PDF
                            </a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link href="/outputs">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Detail Capaian Output</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Periode: {getMonthName(output.report_month)} {output.report_year}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {output.lpj_status && (
                        <Badge className="bg-blue-100 text-blue-800">
                            <FileCheck className="w-3 h-3 mr-1" />
                            LPJ Selesai
                        </Badge>
                    )}
                    {getVerificationBadge(output.verifikasi)}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Peserta Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Peserta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-border">
                                <AvatarImage src={output.peserta.foto || undefined} />
                                <AvatarFallback>{getInitials(output.peserta.nama)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="font-semibold text-lg">{output.peserta.nama || "-"}</p>
                                    <p className="text-sm text-muted-foreground">{output.peserta.nama_usaha}</p>
                                </div>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ID TKM</span>
                                        <span className="font-medium">{output.peserta.legacy_tkm_id || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">NIK</span>
                                        <span className="font-medium">{output.peserta.nik || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sektor</span>
                                        <Badge variant="outline">{output.peserta.sektor_usaha || "-"}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Lokasi</span>
                                        <span className="font-medium text-right">{output.peserta.kota_usaha}, {output.peserta.provinsi_usaha}</span>
                                    </div>
                                </div>
                                {output.peserta.no_whatsapp && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                                        onClick={() => window.open(`https://wa.me/${output.peserta.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        WhatsApp Peserta
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pendamping Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Pendamping
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-border">
                                <AvatarImage src={output.pendamping.foto || undefined} />
                                <AvatarFallback>{getInitials(output.pendamping.nama)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="font-semibold text-lg">{output.pendamping.nama || "-"}</p>
                                    <p className="text-sm text-muted-foreground">{output.pendamping.universitas}</p>
                                </div>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">NIK</span>
                                        <span className="font-medium">{output.pendamping.nik || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{output.pendamping.email || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">WhatsApp</span>
                                        <span className="font-medium">{output.pendamping.no_whatsapp || "-"}</span>
                                    </div>
                                </div>
                                {output.pendamping.no_whatsapp && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                                        onClick={() => window.open(`https://wa.me/${output.pendamping.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        WhatsApp
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Capaian Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Data Capaian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">Omzet</span>
                            </div>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {formatCurrency(output.omzet)}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                                <Package className="w-4 h-4" />
                                <span className="text-sm font-medium">Kapasitas Produksi</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                {output.kapasitas_produksi.toLocaleString()} {output.satuan_produksi}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span className="text-sm font-medium">Volume Penjualan</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                {output.volume_penjualan.toLocaleString()} {output.satuan_penjualan}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-2">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">Tenaga Kerja</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                                {output.tenaga_kerja_count} orang
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Area Pemasaran</span>
                        </div>
                        <p className="font-medium">{output.area_pemasaran || "-"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Tenaga Kerja / Karyawan */}
            {output.tenaga_kerja && output.tenaga_kerja.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Daftar Tenaga Kerja ({output.tenaga_kerja.length} orang)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>NIK</TableHead>
                                        <TableHead>Jenis Kelamin</TableHead>
                                        <TableHead>Jabatan</TableHead>
                                        <TableHead>Status Kerja</TableHead>
                                        <TableHead>BPJS</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {output.tenaga_kerja.map((employee: OutputEmployee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">
                                                {employee.name || "-"}
                                                {employee.disability && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        Disabilitas: {employee.disability_type || "Ya"}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{employee.nik || "-"}</TableCell>
                                            <TableCell>{getGenderLabel(employee.gender)}</TableCell>
                                            <TableCell>{employee.role || "-"}</TableCell>
                                            <TableCell>{employee.employment_status || "-"}</TableCell>
                                            <TableCell>
                                                {employee.bpjs_status ? (
                                                    <div className="text-sm">
                                                        <Badge variant="outline" className="text-green-700 border-green-300">
                                                            {employee.bpjs_type || "Terdaftar"}
                                                        </Badge>
                                                        {employee.bpjs_number && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {employee.bpjs_number}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={employee.is_active ? "default" : "secondary"}>
                                                    {employee.is_active ? "Aktif" : "Tidak Aktif"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pembukuan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Pembukuan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Buku Kas */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">Buku Kas</span>
                                <Badge variant={output.buku_kas ? "default" : "secondary"}>
                                    {output.buku_kas ? "Ya" : "Tidak"}
                                </Badge>
                            </div>
                            {output.bukti_buku_kas ? (
                                renderDocumentPreview(output.bukti_buku_kas, "Bukti Buku Kas")
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada bukti dokumen</p>
                            )}
                        </div>

                        {/* Laba Rugi */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">Laba Rugi</span>
                                <Badge variant={output.laba_rugi ? "default" : "secondary"}>
                                    {output.laba_rugi ? "Ya" : "Tidak"}
                                </Badge>
                            </div>
                            {output.bukti_laba_rugi ? (
                                renderDocumentPreview(output.bukti_laba_rugi, "Bukti Laba Rugi")
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada bukti dokumen</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dokumen Lainnya */}
            {output.dokumenLainnya && output.dokumenLainnya.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Dokumen Lainnya
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {output.dokumenLainnya.map((doc, idx) => (
                                <div key={idx} className="rounded-lg border p-3">
                                    <p className="text-sm font-medium mb-2 truncate">{doc.label}</p>
                                    {renderDocumentPreview(doc.url, doc.label)}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Kondisi & Kendala */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Kondisi Usaha
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{output.kondisi_usaha || "-"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kendala</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{output.kendala || "Tidak ada kendala"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Catatan Konfirmasi */}
            {output.note_confirmation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Catatan Konfirmasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{output.note_confirmation}</p>
                    </CardContent>
                </Card>
            )}

            {/* Catatan Verifikasi */}
            {output.catatan_verifikasi && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            Catatan Verifikasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{output.catatan_verifikasi}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
