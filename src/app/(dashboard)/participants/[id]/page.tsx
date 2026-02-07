"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Info,
    CheckCircle2,
    BarChart3,
    TrendingUp,
    Users,
    Mail,
    Globe,
    ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { LogbookTab } from "@/components/participants/logbook-tab";
import { DocumentsTab } from "@/components/participants/documents-tab";
import { OutputTab } from "@/components/participants/output-tab";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePreviewDrawer } from "@/components/dashboard/file-preview-drawer";

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
const formatDate = (date: Date | string | null) => {
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isImageOpen, setIsImageOpen] = useState(false);

    const activeTab = searchParams.get("tab") || "output";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const { data: participant, isLoading, isError } = useParticipantDetail(id);

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
                        <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <Skeleton className="h-[300px] rounded-xl" />
                        <Skeleton className="h-[200px] rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !participant) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-destructive/10 p-6 rounded-full text-destructive mb-4">
                    <Info className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Gagal Memuat Data</h2>
                <p className="text-muted-foreground mb-6">Terjadi kesalahan saat mengambil data peserta atau peserta tidak ditemukan.</p>
                <Link href="/participants">
                    <Button variant="outline">Kembali ke Daftar</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Image Preview Drawer */}
            <FilePreviewDrawer
                open={isImageOpen}
                onOpenChange={setIsImageOpen}
                fileUrl={participant.foto || null}
                fileName={participant.nama}
                fileType="image"
            />

            {/* Breadcrumb & Compact Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">Participants</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">Detail Profil</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        {participant.nama}
                        <Badge variant="outline" className={`capitalize font-bold border-2 ${participant.status === "active" ? "bg-primary/5 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                            {participant.status || "N/A"}
                        </Badge>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {participant.no_whatsapp && (
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg shadow-primary/20"
                            onClick={() => window.open(`https://wa.me/${participant.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Hubungi via WA
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-primary/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Est. Omset</p>
                                    <p className="text-lg font-black tabular-nums">{participant.omset_per_periode ? `Rp ${participant.omset_per_periode.toLocaleString()}` : "-"}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-chart-3/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-chart-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Sektor Usaha</p>
                                    <p className="text-lg font-black truncate">{participant.sektor_usaha || "-"}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-chart-2/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-chart-2 shadow-sm group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Batch</p>
                                    <p className="text-lg font-black">{participant.batch_pembekalan || "-"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-muted/30 p-1 h-12 w-full grid grid-cols-4 md:w-auto md:inline-flex">
                            <TabsTrigger value="detail" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <Info className="h-4 w-4" /> <span className="hidden sm:inline">Detail Profil</span><span className="sm:hidden">Info</span>
                            </TabsTrigger>
                            <TabsTrigger value="logbook" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4" /> Logbook
                            </TabsTrigger>
                            <TabsTrigger value="output" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <BarChart3 className="h-4 w-4" /> Output
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <Briefcase className="h-4 w-4" /> Berkas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="detail" className="mt-0 space-y-6 focus-visible:outline-none">
                            {/* Data Pribadi & Alamat */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="border-none shadow-md overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b pb-4">
                                        <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" /> Data Pribadi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Tempat Lahir</p>
                                                <p className="font-bold text-sm">{participant.tempat_lahir || "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Tanggal Lahir</p>
                                                <p className="font-bold text-sm">{formatDate(participant.tgl_lahir)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Umur</p>
                                                <p className="font-bold text-sm">{participant.umur ? `${participant.umur} thn` : "-"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Pendidikan</p>
                                                <p className="font-bold text-sm">{participant.pendidikan_terakhir || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Disabilitas</p>
                                            <p className={`font-bold text-sm flex items-center gap-2 ${participant.penyandang_disabilitas ? "text-destructive" : "text-foreground"}`}>
                                                {participant.penyandang_disabilitas ? (
                                                    <><CheckCircle2 className="h-3.5 w-3.5" /> Ya ({participant.jenis_disabilitas || "-"})</>
                                                ) : "Tidak"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-md overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b pb-4">
                                        <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" /> Alamat KTP
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4 text-sm font-medium">
                                        <p className="text-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                            {participant.alamat_ktp || "-"}
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Desa/Kel</span>
                                                <span className="font-bold">{participant.kelurahan_ktp || "-"}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Kecamatan</span>
                                                <span className="font-bold">{participant.kecamatan_ktp || "-"}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Kota/Kab</span>
                                                <span className="font-bold">{participant.kota_ktp || "-"}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Provinsi</span>
                                                <span className="font-bold">{participant.provinsi_ktp || "-"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Alamat Domisili if different */}
                            {!participant.alamat_domisili_dan_alamat_ktp_sama && (
                                <Card className="border-none shadow-md overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b pb-4">
                                        <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-chart-4" /> Alamat Domisili
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="font-medium text-sm leading-relaxed">
                                            {participant.alamat_domisili || "-"}
                                        </p>
                                        <div className="flex gap-6 mt-4 pt-4 border-t border-dashed">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Kota/Kab</span>
                                                <span className="font-bold text-sm">{participant.kota_domisili || "-"}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Provinsi</span>
                                                <span className="font-bold text-sm">{participant.provinsi_domisili || "-"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="logbook" className="mt-0 focus-visible:outline-none">
                            <LogbookTab participantId={id} />
                        </TabsContent>

                        <TabsContent value="output" className="mt-0 focus-visible:outline-none">
                            <OutputTab participantId={id} />
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
                            <DocumentsTab participantId={id} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Compact Profile Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
                        <header className="relative h-24 bg-primary/10">
                            <div className="absolute inset-x-0 -bottom-10 flex justify-center">
                                <div
                                    className={`relative group ${participant.foto ? "cursor-pointer" : ""}`}
                                    onClick={() => participant.foto && setIsImageOpen(true)}
                                >
                                    <Avatar className="h-28 w-28 border-4 border-background shadow-2xl ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                                        <AvatarImage src={participant.foto || undefined} className="object-cover" />
                                        <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary">
                                            {getInitials(participant.nama)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {participant.foto && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-8 h-8 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>
                        <CardContent className="pt-14 pb-8 text-center space-y-4 px-6">
                            <div>
                                <h2 className="text-2xl font-black text-foreground leading-tight">{participant.nama}</h2>
                                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mt-1">{participant.nik || "-"}</p>
                            </div>

                            <div className="grid gap-3 p-4 bg-background/50 rounded-2xl border border-border shadow-inner text-sm">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Phone</span>
                                    </div>
                                    <span className="font-bold tabular-nums text-foreground/80">{participant.no_whatsapp || "-"}</span>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Jenis Kelamin</span>
                                    </div>
                                    <span className="font-bold text-foreground/80">{participant.jenis_kelamin || "-"}</span>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group text-left">
                                    <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                        <Building2 className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Univ</span>
                                    </div>
                                    <span className="font-bold text-foreground/80 text-right truncate pl-2">{(participant as any).university?.name || "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Info Card */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b py-4 px-6">
                            <CardTitle className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary" /> Informasi Usaha
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Nama Usaha</p>
                                <p className="font-black text-lg text-foreground-900 leading-tight">{participant.nama_usaha || "-"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Produk Utama</p>
                                <p className="font-bold flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {participant.produk_utama || "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Lokasi Usaha</p>
                                <p className="font-bold text-sm leading-snug">{participant.alamat_usaha || participant.alamat_domisili || "-"}</p>
                            </div>
                            <div className="pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 p-3 bg-muted/30 rounded-xl">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Omset</p>
                                        <p className="font-black text-xs text-primary">{formatCurrency(participant.omset_per_periode)}</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-muted/30 rounded-xl">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Laba</p>
                                        <p className="font-black text-xs text-chart-2">{formatCurrency(participant.laba_per_periode)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media & Kerabat */}
                    <Card className="border-none shadow-md overflow-hidden bg-muted/10">
                        <CardHeader className="bg-muted/30 border-b py-4 px-6">
                            <CardTitle className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" /> Media Sosial & Kontak Darurat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {participant.nama_medsos && (
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Akun Media Sosial</p>
                                    <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                                        <div>
                                            <p className="text-xs font-bold">{participant.jenis_medsos || "Username"}</p>
                                            <p className="text-xs text-muted-foreground">{participant.nama_medsos}</p>
                                        </div>
                                        {participant.link_media_sosial && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => window.open(participant.link_media_sosial!, '_blank')}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Kontak Kerabat</p>
                                <div className="space-y-2">
                                    {participant.no_kerabat_1 && (
                                        <div className="p-3 bg-background rounded-xl border border-border space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black">{participant.nama_kerabat_1}</p>
                                                <Badge variant="outline" className="text-[9px] h-4 uppercase">{participant.status_kerabat_1 || "Keluarga"}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground tabular-nums">{participant.no_kerabat_1}</p>
                                        </div>
                                    )}
                                    {participant.no_kerabat_2 && (
                                        <div className="p-3 bg-background rounded-xl border border-border space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black">{participant.nama_kerabat_2}</p>
                                                <Badge variant="outline" className="text-[9px] h-4 uppercase">{participant.status_kerabat_2 || "Keluarga"}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground tabular-nums">{participant.no_kerabat_2}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
