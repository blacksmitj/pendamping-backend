"use client";

import { use, useState } from "react";
import { useLogbookDetail } from "@/hooks/use-logbook-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    User,
    Users,
    Clock,
    Calendar,
    FileText,
    MessageCircle,
    Building2,
    ArrowLeft,
    Image as ImageIcon,
    Receipt,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

const formatCurrency = (value: number | null) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "EEEE, dd MMMM yyyy", { locale: localeId });
};

const formatTime = (time: string | null) => {
    if (!time) return "-";
    return format(new Date(time), "HH:mm", { locale: localeId });
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

export default function LogbookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: logbook, isLoading, isError } = useLogbookDetail(id);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    if (isError || !logbook) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                        Gagal memuat data logbook. Silakan coba lagi.
                    </p>
                    <Link href="/logbooks">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Daftar
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

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

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link href="/logbooks">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Detail Logbook</h1>
                    <p className="text-muted-foreground">{formatDate(logbook.tanggal)}</p>
                </div>
                <div className="flex items-center gap-2">
                    {getVerificationBadge(logbook.verifikasi)}
                    <Badge variant="outline">
                        {logbook.isGroup ? (
                            <><Users className="w-3 h-3 mr-1" />{logbook.attendeeCount} Peserta</>
                        ) : (
                            <><User className="w-3 h-3 mr-1" />Individu</>
                        )}
                    </Badge>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
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
                                <AvatarImage src={logbook.pendamping.foto || undefined} />
                                <AvatarFallback>{getInitials(logbook.pendamping.nama)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="font-semibold text-lg">{logbook.pendamping.nama || "-"}</p>
                                    <p className="text-sm text-muted-foreground">{logbook.pendamping.universitas}</p>
                                </div>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">NIK</span>
                                        <span className="font-medium">{logbook.pendamping.nik || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{logbook.pendamping.email || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">WhatsApp</span>
                                        <span className="font-medium">{logbook.pendamping.no_whatsapp || "-"}</span>
                                    </div>
                                </div>
                                {logbook.pendamping.no_whatsapp && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                                        onClick={() => window.open(`https://wa.me/${logbook.pendamping.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        WhatsApp
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Peserta Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Peserta ({logbook.attendeeCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                            {logbook.attendees.map((attendee, idx) => (
                                <div key={attendee.id || idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={attendee.foto || undefined} />
                                        <AvatarFallback>{getInitials(attendee.nama)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{attendee.nama || "Unknown"}</p>
                                        <p className="text-sm text-muted-foreground">{attendee.nama_usaha}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {attendee.kota_usaha}{attendee.provinsi_usaha ? `, ${attendee.provinsi_usaha}` : ""}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {attendee.sektor_usaha || "-"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Kegiatan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detail Kegiatan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Metode</p>
                            <p className="font-semibold">{logbook.metode || "-"}</p>
                        </div>
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Jenis Kunjungan</p>
                            <p className="font-semibold">{logbook.jenis_kunjungan || "-"}</p>
                        </div>
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Jenis Pertemuan</p>
                            <p className="font-semibold">{logbook.jenis_pertemuan || "-"}</p>
                        </div>
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">JPL</p>
                            <p className="font-semibold">{logbook.jpl} Jam</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Waktu</p>
                                <p className="font-semibold">{formatTime(logbook.jam_mulai)} - {formatTime(logbook.jam_selesai)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal</p>
                                <p className="font-semibold">{formatDate(logbook.tanggal)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Materi Pendampingan</p>
                        <p className="p-4 rounded-lg border bg-muted/30">{logbook.materi || "-"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Ringkasan Kegiatan</p>
                        <p className="p-4 rounded-lg border bg-muted/30 whitespace-pre-wrap">{logbook.ringkasan_kegiatan || "-"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Kendala & Solusi */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Kendala</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{logbook.kendala || "Tidak ada kendala"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Solusi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{logbook.solusi || "Tidak ada solusi"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expense */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Biaya
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Total Biaya</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(logbook.total_expense)}</p>
                        </div>
                        {logbook.alasan_tdk_expense && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                                <p className="text-sm text-muted-foreground mb-1">Alasan Tidak Ada Expense</p>
                                <p className="font-medium">{logbook.alasan_tdk_expense}</p>
                            </div>
                        )}
                    </div>

                    {logbook.buktiExpense.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Bukti Biaya</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {logbook.buktiExpense.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square rounded-lg border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setPreviewImage(url)}
                                    >
                                        <img src={url} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dokumentasi */}
            {logbook.dokumentasi.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Dokumentasi ({logbook.dokumentasi.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {logbook.dokumentasi.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square rounded-lg border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setPreviewImage(url)}
                                >
                                    <img src={url} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Catatan Verifikasi */}
            {logbook.catatan_verifikasi && (
                <Card>
                    <CardHeader>
                        <CardTitle>Catatan Verifikasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{logbook.catatan_verifikasi}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
