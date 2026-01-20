"use client";

import { use, useState } from "react";
import { useParticipantDetail } from "@/hooks/use-participant-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    MapPin,
    Building2,
    FileText,
    Phone,
    Calendar,
    Briefcase,
    MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { LogbookTab } from "@/components/participants/logbook-tab";
import { DocumentsTab } from "@/components/participants/documents-tab";
import { OutputTab } from "@/components/participants/output-tab";
import { Button } from "@/components/ui/button";

// Helper function to format currency
const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

// Helper function to format date
const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: localeId });
};

// Helper function to get initials
const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export default function ParticipantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const { data: participant, isLoading, isError } = useParticipantDetail(id);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (isError || !participant) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                        Gagal memuat data peserta. Silakan coba lagi.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Image Preview Modal */}
            {isImageOpen && participant.foto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageOpen(false)}
                >
                    <div className="relative max-h-full max-w-full">
                        <img
                            src={participant.foto}
                            alt={participant.nama || "Profile"}
                            className="h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsImageOpen(false);
                            }}
                            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-1 shadow-lg hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start">
                            {/* Avatar */}
                            <div
                                className={`relative group ${participant.foto ? "cursor-pointer" : ""}`}
                                onClick={() => participant.foto && setIsImageOpen(true)}
                            >
                                <Avatar className="h-24 w-24 border-4 border-border transition-transform group-hover:scale-105">
                                    <AvatarImage src={participant.foto || undefined} className="object-cover" />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(participant.nama)}
                                    </AvatarFallback>
                                </Avatar>
                                {participant.foto && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 drop-shadow-md"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-foreground">
                                            {participant.nama || "Nama tidak tersedia"}
                                        </h1>
                                        <Badge variant={participant.status === "active" ? "default" : "secondary"}>
                                            {participant.status || "N/A"}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground">
                                        NIK: {participant.nik || "-"}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Usaha:</span>
                                        <span className="font-medium">{participant.nama_usaha || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Batch:</span>
                                        <span className="font-medium">{participant.batch_pembekalan || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">WA:</span>
                                        <span className="font-medium">{participant.no_whatsapp || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {participant.no_whatsapp && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => window.open(`https://wa.me/${participant.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                >
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="detail" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="detail">Detail</TabsTrigger>
                    <TabsTrigger value="logbook">Logbook</TabsTrigger>
                    <TabsTrigger value="output">Output</TabsTrigger>
                    <TabsTrigger value="documents">Berkas</TabsTrigger>
                    <TabsTrigger value="contact">Kontak</TabsTrigger>
                </TabsList>

                {/* Detail Tab */}
                <TabsContent value="detail" className="space-y-4">
                    {/* Data Pribadi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Data Pribadi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">NIK</p>
                                <p className="font-medium">{participant.nik || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                                <p className="font-medium">{participant.nama || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tempat, Tanggal Lahir</p>
                                <p className="font-medium">
                                    {participant.tempat_lahir || "-"}, {formatDate(participant.tgl_lahir)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Umur</p>
                                <p className="font-medium">{participant.umur ? `${participant.umur} tahun` : "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                                <p className="font-medium">{participant.jenis_kelamin || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pendidikan Terakhir</p>
                                <p className="font-medium">{participant.pendidikan_terakhir || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Penyandang Disabilitas</p>
                                <p className="font-medium">
                                    {participant.penyandang_disabilitas ? "Ya" : "Tidak"}
                                    {participant.penyandang_disabilitas && participant.jenis_disabilitas &&
                                        ` (${participant.jenis_disabilitas})`
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alamat KTP */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Alamat KTP
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Alamat Lengkap</p>
                                <p className="font-medium">{participant.alamat_ktp || "-"}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Provinsi</p>
                                    <p className="font-medium">{participant.provinsi_ktp || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kota/Kabupaten</p>
                                    <p className="font-medium">{participant.kota_ktp || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kecamatan</p>
                                    <p className="font-medium">{participant.kecamatan_ktp || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kelurahan</p>
                                    <p className="font-medium">{participant.kelurahan_ktp || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kode Pos</p>
                                    <p className="font-medium">{participant.kode_pos_ktp || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alamat Domisili */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Alamat Domisili
                            </CardTitle>
                            {participant.alamat_domisili_dan_alamat_ktp_sama && (
                                <CardDescription>Sama dengan alamat KTP</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Alamat Lengkap</p>
                                <p className="font-medium">{participant.alamat_domisili || participant.alamat_ktp || "-"}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Provinsi</p>
                                    <p className="font-medium">{participant.provinsi_domisili || participant.provinsi_ktp || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kota/Kabupaten</p>
                                    <p className="font-medium">{participant.kota_domisili || participant.kota_ktp || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Usaha */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Data Usaha
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Nama Usaha</p>
                                <p className="font-medium">{participant.nama_usaha || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sektor Usaha</p>
                                <p className="font-medium">{participant.sektor_usaha || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Jenis Usaha</p>
                                <p className="font-medium">{participant.jenis_usaha || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Produk Utama</p>
                                <p className="font-medium">{participant.produk_utama || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Omset per Periode</p>
                                <p className="font-medium">{formatCurrency(participant.omset_per_periode)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Laba per Periode</p>
                                <p className="font-medium">{formatCurrency(participant.laba_per_periode)}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-muted-foreground">Deskripsi Usaha</p>
                                <p className="font-medium">{participant.deskripsi_usaha || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Logbook Tab */}
                <TabsContent value="logbook">
                    <LogbookTab participantId={id} />
                </TabsContent>

                {/* Output Tab */}
                <TabsContent value="output">
                    <OutputTab participantId={id} />
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents">
                    <DocumentsTab participantId={id} />
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Informasi Kontak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* WhatsApp */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">WhatsApp</p>
                                <p className="font-medium">{participant.no_whatsapp || "-"}</p>
                            </div>

                            {/* Media Sosial */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Media Sosial</p>
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        {participant.jenis_medsos || "-"}: {participant.nama_medsos || "-"}
                                    </p>
                                    {participant.link_media_sosial && (
                                        <a
                                            href={participant.link_media_sosial}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {participant.link_media_sosial}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Kontak Kerabat */}
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-muted-foreground">Kontak Kerabat</p>

                                <div className="rounded-lg border border-border bg-muted p-4">
                                    <p className="text-sm text-muted-foreground mb-1">Kerabat 1</p>
                                    <p className="font-medium">{participant.nama_kerabat_1 || "-"}</p>
                                    <p className="text-sm">{participant.no_kerabat_1 || "-"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {participant.status_kerabat_1 || "-"}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-border bg-muted p-4">
                                    <p className="text-sm text-muted-foreground mb-1">Kerabat 2</p>
                                    <p className="font-medium">{participant.nama_kerabat_2 || "-"}</p>
                                    <p className="text-sm">{participant.no_kerabat_2 || "-"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {participant.status_kerabat_2 || "-"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
