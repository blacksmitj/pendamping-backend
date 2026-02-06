"use client";

import { use, useState } from "react";
import { useOutputDetail, OutputEmployee } from "@/hooks/use-output-detail";
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Search,
    Info,
    Wallet,
    Target
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
            return (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold py-1 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Terverifikasi
                </Badge>
            );
        case "failed":
        case "rejected":
            return (
                <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 font-bold py-1 px-3">
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Ditolak
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-bold py-1 px-3">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    Menunggu
                </Badge>
            );
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
            <div className="w-full space-y-6 pb-20 px-4">
                <div className="flex items-center gap-4 border-b pb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                        </div>
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <Skeleton className="h-[300px] rounded-xl" />
                        <Skeleton className="h-[300px] rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !output) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-destructive/10 p-6 rounded-full text-destructive mb-4">
                    <Info className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Gagal Memuat Data</h2>
                <p className="text-muted-foreground mb-6">Terjadi kesalahan saat mengambil data output atau data tidak ditemukan.</p>
                <Link href="/outputs">
                    <Button variant="outline">Kembali ke Daftar</Button>
                </Link>
            </div>
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
                        <FileText className="w-12 h-12 text-destructive mb-2" />
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
        <div className="w-full space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Image Preview Modal & PDF Dialog */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-h-full max-w-full group">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-4 -right-4 bg-background text-foreground rounded-full p-2 shadow-2xl border border-border hover:bg-muted transition-all hover:scale-110 active:scale-90"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            <Dialog open={!!pdfPreview} onOpenChange={(open) => !open && setPdfPreview(null)}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-4 border-b bg-muted/30">
                        <DialogTitle className="flex items-center gap-2 text-lg font-black">
                            <div className="bg-destructive/10 p-2 rounded-lg">
                                <FileText className="w-5 h-5 text-destructive" />
                            </div>
                            {pdfPreview?.title || "Dokumen PDF"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 bg-muted">
                        {pdfPreview && (
                            <iframe
                                src={pdfPreview.url}
                                className="w-full h-full"
                                title={pdfPreview.title}
                            />
                        )}
                    </div>
                    <div className="p-4 border-t bg-background flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 font-bold h-12 rounded-xl"
                            onClick={() => window.open(pdfPreview?.url, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Buka di Tab Baru
                        </Button>
                        <Button
                            variant="default"
                            className="flex-1 font-bold h-12 rounded-xl"
                            asChild
                        >
                            <a href={pdfPreview?.url} download>
                                <Download className="w-4 h-4 mr-2" />
                                Unduh Dokumen
                            </a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Breadcrumb & Compact Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/outputs">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <span className="text-sm font-medium text-muted-foreground">Outputs</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">Detail Capaian</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Capaian Output
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1">
                            {getMonthName(output.report_month)} {output.report_year}
                        </Badge>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {getVerificationBadge(output.verifikasi)}
                    {output.lpj_status && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            LPJ Selesai
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-primary/5 transition-colors group">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="rounded-full bg-background p-2 w-fit text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Omzet</p>
                                    <p className="text-md font-black tabular-nums truncate">{formatCurrency(output.omzet)}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-blue-500/5 transition-colors group">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="rounded-full bg-background p-2 w-fit text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Produksi</p>
                                    <p className="text-md font-black tabular-nums truncate">{output.kapasitas_produksi} <span className="text-[10px] font-bold text-muted-foreground uppercase">{output.satuan_produksi}</span></p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-purple-500/5 transition-colors group">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="rounded-full bg-background p-2 w-fit text-purple-500 shadow-sm group-hover:scale-110 transition-transform">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Penjualan</p>
                                    <p className="text-md font-black tabular-nums truncate">{output.volume_penjualan} <span className="text-[10px] font-bold text-muted-foreground uppercase">{output.satuan_penjualan}</span></p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-orange-500/5 transition-colors group">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="rounded-full bg-background p-2 w-fit text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Karyawan</p>
                                    <p className="text-md font-black tabular-nums">{output.tenaga_kerja_count} <span className="text-[10px] font-bold text-muted-foreground uppercase">Orang</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                Tenaga Kerja
                            </CardTitle>
                            <CardDescription>Daftar tenaga kerja yang terdaftar di periode ini</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/20">
                                    <TableRow>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider">Nama & Detail</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider text-center">Status</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider text-right">BPJS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {output.tenaga_kerja && output.tenaga_kerja.length > 0 ? (
                                        output.tenaga_kerja.map((employee: OutputEmployee) => (
                                            <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-sm">{employee.name || "-"}</p>
                                                        <div className="flex flex-wrap gap-1.5 items-center">
                                                            <Badge variant="outline" className="text-[10px] font-bold h-5 uppercase">
                                                                {getGenderLabel(employee.gender)}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-[10px] font-bold h-5 uppercase bg-primary/5 text-primary border-primary/10">
                                                                {employee.role || "Staf"}
                                                            </Badge>
                                                            {employee.disability && (
                                                                <Badge variant="outline" className="text-[10px] font-bold h-5 uppercase bg-destructive/5 text-destructive border-destructive/10">
                                                                    Disabilitas
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={`text-[10px] font-black uppercase tracking-tighter ${employee.is_active ? "bg-emerald-500 hover:bg-emerald-600" : "bg-muted text-muted-foreground"}`}>
                                                        {employee.is_active ? "Aktif" : "Non-Aktif"}
                                                    </Badge>
                                                    <p className="text-[10px] font-medium text-muted-foreground mt-1 whitespace-nowrap">{employee.employment_status}</p>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="space-y-0.5">
                                                        {employee.bpjs_status ? (
                                                            <>
                                                                <p className="text-xs font-black text-chart-2 uppercase">{employee.bpjs_type || "Terdaftar"}</p>
                                                                <p className="text-[10px] font-medium text-muted-foreground tabular-nums">{employee.bpjs_number || "-"}</p>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-bold text-muted-foreground">Tidak Ada</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                                Tidak ada data tenaga kerja
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Bookkeeping & Documents */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="text-md flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" /> Bukti Pembukuan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-4">
                                    <div className="p-3 rounded-xl border border-border bg-background/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Buku Kas</span>
                                            <Badge variant={output.buku_kas ? "outline" : "secondary"} className={output.buku_kas ? "bg-primary/5 text-primary border-primary/20" : ""}>
                                                {output.buku_kas ? "Ada" : "Tidak Ada"}
                                            </Badge>
                                        </div>
                                        {output.bukti_buku_kas ? renderDocumentPreview(output.bukti_buku_kas, "Buku Kas") : <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-lg text-xs text-muted-foreground font-medium">Kosong</div>}
                                    </div>
                                    <div className="p-3 rounded-xl border border-border bg-background/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Laba Rugi</span>
                                            <Badge variant={output.laba_rugi ? "outline" : "secondary"} className={output.laba_rugi ? "bg-chart-2/5 text-chart-2 border-chart-2/20" : ""}>
                                                {output.laba_rugi ? "Ada" : "Tidak Ada"}
                                            </Badge>
                                        </div>
                                        {output.bukti_laba_rugi ? renderDocumentPreview(output.bukti_laba_rugi, "Laba Rugi") : <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-lg text-xs text-muted-foreground font-medium">Kosong</div>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="text-md flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> Dokumen Pendukung
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {output.dokumenLainnya && output.dokumenLainnya.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {output.dokumenLainnya.map((doc, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <p className="text-[10px] font-bold uppercase truncate text-muted-foreground">{doc.label}</p>
                                                {renderDocumentPreview(doc.url, doc.label)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                                        <XCircle className="w-8 h-8 opacity-20" />
                                        <p className="text-xs font-medium">Tidak ada dokumen lain</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Search className="w-4 h-4" /> Kondisi Usaha
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm leading-relaxed font-medium">{output.kondisi_usaha || "-"}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Kendala & Solusi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm leading-relaxed font-medium">{output.kendala || "Tidak ada kendala yang dilaporkan"}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Peserta Info Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
                        <header className="relative h-20 bg-primary/10">
                            <div className="absolute inset-x-0 -bottom-8 flex justify-center px-6">
                                <div className="w-full flex items-center gap-4 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-border/50 shadow-xl">
                                    <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                                        <AvatarImage src={output.peserta.foto || undefined} className="object-cover" />
                                        <AvatarFallback className="text-xl font-black bg-primary/5 text-primary">
                                            {getInitials(output.peserta.nama)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <h2 className="font-black text-foreground leading-tight truncate">{output.peserta.nama}</h2>
                                        <p className="text-xs font-bold text-muted-foreground truncate">{output.peserta.nama_usaha}</p>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <CardContent className="pt-12 pb-6 px-6 space-y-4">
                            <div className="grid gap-3 p-4 bg-background/50 rounded-2xl border border-border shadow-inner text-sm">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Target className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">ID TKM</span>
                                    </div>
                                    <span className="font-bold text-foreground/80 tabular-nums">{output.peserta.legacy_tkm_id || "-"}</span>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Sektor</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase h-5">{output.peserta.sektor_usaha || "-"}</Badge>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group text-left">
                                    <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                        <MapPin className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Lokasi</span>
                                    </div>
                                    <span className="font-bold text-foreground/80 text-right text-xs truncate pl-4">{output.peserta.kota_usaha}, {output.peserta.provinsi_usaha}</span>
                                </div>
                            </div>
                            {output.peserta.no_whatsapp && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all gap-2"
                                    onClick={() => window.open(`https://wa.me/${output.peserta.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                >
                                    <MessageCircle className="w-4 h-4" /> Hubungi Peserta
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pendamping Info Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-background">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> Mentor Pendamping
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 pb-6 px-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-muted shadow-sm">
                                    <AvatarImage src={output.pendamping.foto || undefined} className="object-cover" />
                                    <AvatarFallback className="text-lg font-black bg-muted text-muted-foreground">
                                        {getInitials(output.pendamping.nama)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-foreground leading-tight truncate">{output.pendamping.nama}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {output.pendamping.universitas}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between text-xs border bg-muted/30 p-2.5 rounded-xl">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Wallet className="h-3.5 w-3.5" />
                                        <span className="font-bold uppercase text-[9px]">ID</span>
                                    </div>
                                    <span className="font-bold tabular-nums">{output.pendamping.nik || "-"}</span>
                                </div>
                                {output.pendamping.no_whatsapp && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full h-11 rounded-xl font-bold text-xs border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all gap-2"
                                        onClick={() => window.open(`https://wa.me/${output.pendamping.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                    >
                                        <MessageCircle className="w-4 h-4" /> WhatsApp Mentor
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Marketing Area */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-primary/70 tracking-widest">Area Pemasaran</p>
                                    <p className="text-sm font-bold leading-tight">{output.area_pemasaran || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Notes */}
                    {(output.catatan_verifikasi || output.note_confirmation) && (
                        <Card className="border-none shadow-md overflow-hidden bg-destructive/5 border-destructive/10">
                            <CardHeader className="bg-destructive/10 border-b pb-3">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                                    <FileCheck className="w-4 h-4" /> Catatan Penting
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 pb-4 px-4 space-y-4">
                                {output.catatan_verifikasi && (
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-destructive/60 tracking-tighter">Admin/Verifikator</p>
                                        <p className="text-xs font-bold leading-relaxed">{output.catatan_verifikasi}</p>
                                    </div>
                                )}
                                {output.catatan_verifikasi && output.note_confirmation && <div className="h-px bg-destructive/10 w-full" />}
                                {output.note_confirmation && (
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-destructive/60 tracking-tighter">Konfirmasi System</p>
                                        <p className="text-xs font-bold leading-relaxed">{output.note_confirmation}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
