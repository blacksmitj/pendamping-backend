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
import { Separator } from "@/components/ui/separator";
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground/60 transition-colors">
                        <Link href="/participants" className="text-xs font-medium hover:text-primary flex items-center gap-1">
                            <Users className="h-3 w-3" /> Participants
                        </Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-xs font-bold text-foreground">Detail Profil</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {participant.nama}
                        </h1>
                        <Badge 
                            variant="secondary" 
                            className={`px-2 py-0 text-[10px] uppercase font-black border-none ${
                                participant.status === "active" 
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                                : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {participant.status || "N/A"}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {participant.no_whatsapp && (
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 h-9 font-bold shadow-md shadow-emerald-600/10"
                            onClick={() => window.open(`https://wa.me/${participant.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                        >
                            <MessageCircle className="w-3.5 h-3.5 mr-2" />
                            WhatsApp
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full border bg-background/50 hover:bg-background"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Separator className="opacity-50 mx-4 w-auto" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-3 md:grid-cols-3">
                        <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm border border-border/10 hover:border-primary/20 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <TrendingUp className="h-12 w-12 text-primary" />
                            </div>
                            <CardContent className="p-4 flex items-center gap-3 relative z-10">
                                <div className="rounded-xl bg-primary/5 p-2.5 text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-0.5">Omset Periode</p>
                                    <p className="text-base font-black tabular-nums">{participant.omset_per_periode ? `Rp ${participant.omset_per_periode.toLocaleString()}` : "-"}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm border border-border/10 hover:border-chart-3/20 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building2 className="h-12 w-12 text-chart-3" />
                            </div>
                            <CardContent className="p-4 flex items-center gap-3 relative z-10">
                                <div className="rounded-xl bg-chart-3/5 p-2.5 text-chart-3">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-0.5">Sektor Usaha</p>
                                    <p className="text-base font-black truncate">{participant.sektor_usaha || "-"}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm border border-border/10 hover:border-chart-2/20 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="h-12 w-12 text-chart-2" />
                            </div>
                            <CardContent className="p-4 flex items-center gap-3 relative z-10">
                                <div className="rounded-xl bg-chart-2/5 p-2.5 text-chart-2">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-0.5">Batch</p>
                                    <p className="text-base font-black">{participant.batch_pembekalan || "-"}</p>
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
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm border border-border/10 overflow-hidden">
                                    <div className="bg-muted/30 border-b px-4 py-2.5 flex items-center justify-between">
                                        <h3 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                                            <User className="h-3.5 w-3.5 text-primary" /> Data Pribadi
                                        </h3>
                                    </div>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Tempat Lahir</p>
                                                <p className="font-bold text-xs">{participant.tempat_lahir || "-"}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Tanggal Lahir</p>
                                                <p className="font-bold text-xs">{formatDate(participant.tgl_lahir)}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Umur</p>
                                                <p className="font-bold text-xs">{participant.umur ? `${participant.umur} thn` : "-"}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Pendidikan</p>
                                                <p className="font-bold text-xs">{participant.pendidikan_terakhir || "-"}</p>
                                            </div>
                                        </div>
                                        <Separator className="opacity-30" />
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Disabilitas</p>
                                            <p className={`font-black text-xs flex items-center gap-1.5 ${participant.penyandang_disabilitas ? "text-amber-600" : "text-foreground"}`}>
                                                {participant.penyandang_disabilitas ? (
                                                    <><CheckCircle2 className="h-3 w-3" /> Ya ({participant.jenis_disabilitas || "-"})</>
                                                ) : "Tidak"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm border border-border/10 overflow-hidden">
                                    <div className="bg-muted/30 border-b px-4 py-2.5 flex items-center justify-between">
                                        <h3 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 text-primary" /> Alamat KTP
                                        </h3>
                                    </div>
                                    <CardContent className="p-4 space-y-3 text-xs">
                                        <p className="text-muted-foreground leading-relaxed font-medium bg-muted/20 p-2.5 rounded-lg border border-border/5 mb-2">
                                            {participant.alamat_ktp || "-"}
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 block">Desa/Kel</span>
                                                <span className="font-bold truncate block">{participant.kelurahan_ktp || "-"}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 block">Kecamatan</span>
                                                <span className="font-bold truncate block">{participant.kecamatan_ktp || "-"}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 block">Kota/Kab</span>
                                                <span className="font-bold truncate block">{participant.kota_ktp || "-"}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 block">Provinsi</span>
                                                <span className="font-bold truncate block">{participant.provinsi_ktp || "-"}</span>
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
                    <Card className="border-none shadow-sm overflow-hidden bg-background/60 backdrop-blur-md border border-border/10">
                        <header className="relative h-20 bg-primary/5">
                            <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                                <div
                                    className={`relative group ${participant.foto ? "cursor-pointer" : ""}`}
                                    onClick={() => participant.foto && setIsImageOpen(true)}
                                >
                                    <Avatar className="h-20 w-20 border-4 border-background shadow-xl ring-1 ring-border/50 transition-all group-hover:ring-primary/30">
                                        <AvatarImage src={participant.foto || undefined} className="object-cover" />
                                        <AvatarFallback className="text-2xl font-black bg-primary/5 text-primary">
                                            {getInitials(participant.nama)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {participant.foto && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-5 h-5 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>
                        <CardContent className="pt-10 pb-6 text-center space-y-4 px-5">
                            <div>
                                <h2 className="text-xl font-black text-foreground tracking-tight">{participant.nama}</h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{participant.nik || "-"}</p>
                            </div>

                            <div className="grid gap-2.5 p-3.5 bg-muted/20 rounded-xl border border-border/5 text-[11px]">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tighter">
                                        <Phone className="h-3 w-3" /> Phone
                                    </span>
                                    <span className="font-black tabular-nums">{participant.no_whatsapp || "-"}</span>
                                </div>
                                <Separator className="opacity-10" />
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tighter">
                                        <User className="h-3 w-3" /> Gender
                                    </span>
                                    <span className="font-black">{participant.jenis_kelamin || "-"}</span>
                                </div>
                                <Separator className="opacity-10" />
                                <div className="flex items-center justify-between text-left">
                                    <span className="font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tighter shrink-0">
                                        <Building2 className="h-3 w-3" /> Univ
                                    </span>
                                    <span className="font-black truncate pl-4">{(participant as any).university?.name || "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Info Card */}
                    <Card className="border-none shadow-sm overflow-hidden bg-background/60 backdrop-blur-sm border border-border/10">
                        <div className="bg-muted/30 border-b px-5 py-3 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-3.5 w-3.5 text-primary" /> Informasi Usaha
                            </h3>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Nama Usaha</p>
                                <p className="font-black text-base text-foreground tracking-tight leading-tight">{participant.nama_usaha || "-"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Produk Utama</p>
                                <p className="font-bold flex items-center gap-1.5 text-xs text-foreground/80">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {participant.produk_utama || "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Lokasi Usaha</p>
                                <p className="font-bold text-xs leading-snug text-foreground/80">{participant.alamat_usaha || participant.alamat_domisili || "-"}</p>
                            </div>
                            <div className="pt-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-0.5 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                                        <p className="text-[8px] uppercase font-black text-primary/70 tracking-widest">Omset</p>
                                        <p className="font-black text-[13px] text-primary tabular-nums">{formatCurrency(participant.omset_per_periode)}</p>
                                    </div>
                                    <div className="space-y-0.5 p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                        <p className="text-[8px] uppercase font-black text-emerald-600/70 tracking-widest">Laba</p>
                                        <p className="font-black text-[13px] text-emerald-600 tabular-nums">{formatCurrency(participant.laba_per_periode)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media & Kerabat */}
                    <Card className="border-none shadow-sm overflow-hidden bg-background/60 backdrop-blur-sm border border-border/10">
                        <div className="bg-muted/30 border-b px-5 py-3 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                                <Globe className="h-3.5 w-3.5 text-primary" /> Media & Kontak
                            </h3>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            {participant.nama_medsos && (
                                <div className="space-y-2">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Media Sosial</p>
                                    <div className="flex items-center justify-between p-2.5 bg-muted/10 rounded-xl border border-border/5">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/80">{participant.jenis_medsos || "Account"}</p>
                                            <p className="text-xs font-bold truncate">{participant.nama_medsos}</p>
                                        </div>
                                        {participant.link_media_sosial && (
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg shrink-0" onClick={() => window.open(participant.link_media_sosial!, '_blank')}>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground/70">Kontak Kerabat</p>
                                <div className="space-y-2">
                                    {participant.no_kerabat_1 && (
                                        <div className="p-3 bg-muted/10 rounded-xl border border-border/5 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black">{participant.nama_kerabat_1}</p>
                                                <Badge variant="secondary" className="text-[8px] h-3.5 px-1.5 uppercase font-bold bg-muted/40">{participant.status_kerabat_1 || "Keluarga"}</Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground tabular-nums font-medium">{participant.no_kerabat_1}</p>
                                        </div>
                                    )}
                                    {participant.no_kerabat_2 && (
                                        <div className="p-3 bg-muted/10 rounded-xl border border-border/5 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black">{participant.nama_kerabat_2}</p>
                                                <Badge variant="secondary" className="text-[8px] h-3.5 px-1.5 uppercase font-bold bg-muted/40">{participant.status_kerabat_2 || "Keluarga"}</Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground tabular-nums font-medium">{participant.no_kerabat_2}</p>
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
