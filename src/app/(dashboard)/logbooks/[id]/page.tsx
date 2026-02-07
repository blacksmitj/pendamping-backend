"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogbookDetail } from "@/hooks/use-logbook-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    AlertCircle,
    Info,
    ChevronRight,
    MapPin,
    CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { ParticipantCard } from "@/app/(dashboard)/_components/participant-card";
import { FilePreviewDrawer } from "@/components/dashboard/file-preview-drawer";
import { cn } from "@/lib/utils";

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
            return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Terverifikasi</Badge>;
        case "failed":
        case "rejected":
            return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3.5 h-3.5 mr-1.5" />Ditolak</Badge>;
        default:
            return <Badge variant="secondary" className="bg-muted text-muted-foreground border-border"><Clock className="w-3.5 h-3.5 mr-1.5" />Menunggu</Badge>;
    }
};

export default function LogbookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: logbook, isLoading, isError } = useLogbookDetail(id);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-6 w-full p-4 lg:p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !logbook) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 w-full">
                <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gagal Memuat Data</h3>
                <p className="text-muted-foreground mb-6">Logbook tidak ditemukan atau terjadi kesalahan server.</p>
                <Link href="/logbooks">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Logbook
                    </Button>
                </Link>
            </div>
        );
    }

    const infoItems = [
        { label: "Metode", value: logbook.metode, icon: Building2 },
        { label: "Kunjungan", value: logbook.jenis_kunjungan, icon: MapPin },
        { label: "Pertemuan", value: logbook.jenis_pertemuan, icon: Users },
        { label: "Durasi (JPL)", value: `${logbook.jpl} Jam`, icon: Clock },
    ];

    return (
        <div className="w-full space-y-6 pb-20">
            {/* Image Preview Drawer */}
            <FilePreviewDrawer
                open={!!previewImage}
                onOpenChange={(open) => !open && setPreviewImage(null)}
                fileUrl={previewImage}
                fileName="Lampiran Logbook"
            />

            {/* Compact Breadcrumb/Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">Logbooks</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">Detail Kegiatan</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        {logbook.isGroup ? "Logbook Kelompok" : "Logbook Individu"}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 font-medium">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        {formatDate(logbook.tanggal)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {getVerificationBadge(logbook.verifikasi)}
                    <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary font-bold shadow-sm py-1">
                        {logbook.isGroup ? (
                            <><Users className="w-3.5 h-3.5 mr-1.5" />{logbook.attendeeCount} Peserta</>
                        ) : (
                            <><User className="w-3.5 h-3.5 mr-1.5" />Individu</>
                        )}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Activity Key Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {infoItems.map((item, idx) => (
                            <Card key={idx} className="border-none shadow-sm bg-muted/30 hover:bg-primary/5 transition-colors group">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <div className="p-2 bg-background rounded-lg shadow-sm group-hover:scale-110 transition-transform text-primary">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                                        <p className="font-bold text-sm truncate">{item.value || "-"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Detailed Content */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center gap-3 border-b">
                            <div className="p-2 bg-background rounded-lg text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Ringkasan Kegiatan</CardTitle>
                                <CardDescription className="text-xs">Informasi detail mengenai materi dan hasil pendampingan</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y border-border">
                                <div className="p-6 space-y-3 bg-primary/5">
                                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-primary/70">Materi Pendampingan</h4>
                                    <p className="text-base font-semibold leading-relaxed text-foreground">{logbook.materi || "Tidak ada materi"}</p>
                                </div>
                                <div className="p-6 space-y-3">
                                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Ringkasan Narasi</h4>
                                    <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">{logbook.ringkasan_kegiatan || "-"}</p>
                                </div>
                                <div className="grid md:grid-cols-2 divide-x border-border">
                                    <div className="p-6 space-y-3">
                                        <h4 className="text-xs uppercase font-extrabold tracking-widest text-destructive/80">Kendala</h4>
                                        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-sm text-destructive min-h-[100px]">
                                            {logbook.kendala || "Tidak ada kendala yang dilaporkan"}
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <h4 className="text-xs uppercase font-extrabold tracking-widest text-primary/80">Solusi</h4>
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-primary min-h-[100px]">
                                            {logbook.solusi || "Tidak ada solusi yang diberikan"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabbed Media Section */}
                    <Tabs defaultValue="documentation" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30 p-1 mb-4">
                            <TabsTrigger value="documentation" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-bold">
                                <ImageIcon className="w-4 h-4 mr-2" /> Dokumentasi
                                <Badge className="ml-2 bg-primary/10 text-primary border-none pointer-events-none">{logbook.dokumentasi.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="expense" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-bold">
                                <Receipt className="w-4 h-4 mr-2" /> Biaya & Bukti
                                <Badge className="ml-2 bg-primary/10 text-primary border-none pointer-events-none">{logbook.buktiExpense.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="documentation" className="mt-0 focus-visible:ring-0">
                            <Card className="border-none shadow-sm min-h-[300px]">
                                <CardContent className="p-4">
                                    {logbook.dokumentasi.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {logbook.dokumentasi.map((url: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="group relative aspect-square rounded-xl border-2 border-transparent hover:border-primary transition-all overflow-hidden cursor-pointer bg-muted shadow-sm"
                                                    onClick={() => setPreviewImage(url)}
                                                >
                                                    <img src={url} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ImageIcon className="w-8 h-8 text-foreground shadow-2xl" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl border-muted">
                                            <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="font-medium">Tidak ada foto dokumentasi</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="expense" className="mt-0 focus-visible:ring-0">
                            <Card className="border-none shadow-sm min-h-[300px]">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Total Biaya</CardTitle>
                                            <CardDescription className="text-xs">Rincian pengeluaran untuk kegiatan ini</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-primary leading-none">{formatCurrency(logbook.total_expense)}</p>
                                            {logbook.alasan_tdk_expense && (
                                                <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] italic">"{logbook.alasan_tdk_expense}"</p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 border-t border-border">
                                    {logbook.buktiExpense.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {logbook.buktiExpense.map((url, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group relative aspect-square rounded-xl border-2 border-transparent hover:border-primary transition-all overflow-hidden cursor-pointer bg-muted shadow-sm"
                                                    onClick={() => setPreviewImage(url)}
                                                >
                                                    <img src={url} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Receipt className="w-8 h-8 text-foreground shadow-2xl" />
                                                    </div>
                                                    <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground border-none shadow-sm">Kwitansi</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl border-muted">
                                            <Receipt className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="font-medium">Pencatatan biaya nihil</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Mentor Card - More Compact */}
                    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
                        <CardHeader className="pb-4 py-4 bg-primary/5 flex flex-row items-center gap-3 border-b border-border">
                            <div className="p-1.5 bg-background rounded-full shadow-sm text-primary">
                                <User className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-base text-foreground">Informasi Pendamping</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20 shadow-xl transition-transform hover:scale-105 duration-300">
                                        <AvatarImage src={logbook.pendamping.foto || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">{getInitials(logbook.pendamping.nama)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-background shadow-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground">{logbook.pendamping.nama || "Tanpa Nama"}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <Badge variant="secondary" className="font-bold border-none bg-primary/10 text-primary text-[10px] uppercase tracking-wide">
                                            {logbook.pendamping.universitas || "No Institution"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="w-full bg-background/50 rounded-2xl p-4 gap-3 grid text-sm border border-border shadow-inner">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Info className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                                            <span className="text-xs font-semibold">NIK</span>
                                        </div>
                                        <span className="font-bold tabular-nums text-foreground/80">{logbook.pendamping.nik || "-"}</span>
                                    </div>
                                    <div className="w-full h-px bg-border" />
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MessageCircle className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                                            <span className="text-xs font-semibold">Contact</span>
                                        </div>
                                        <span className="font-bold text-foreground/80">{logbook.pendamping.no_whatsapp?.replace(/^062/, '+62') || "-"}</span>
                                    </div>
                                </div>

                                {logbook.pendamping.no_whatsapp && (
                                    <Button
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                                        onClick={() => window.open(`https://wa.me/${logbook.pendamping.no_whatsapp?.replace(/^0/, '62')}`, '_blank')}
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Chat WhatsApp
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Participants Card - Scrollable */}
                    <Card className="border-none shadow-md flex flex-col max-h-[700px]">
                        <CardHeader className="pb-3 border-b border-border bg-muted/30 flex flex-row items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-background rounded-full shadow-sm text-primary">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base text-foreground">Daftar Peserta</CardTitle>
                                    <CardDescription className="text-xs">{logbook.attendeeCount} Orang hadir</CardDescription>
                                </div>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-none">{logbook.attendeeCount}</Badge>
                        </CardHeader>
                        <CardContent className="p-1 flex-1 overflow-hidden">
                            <div className="grid gap-1 px-3 py-4 overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 pr-2">
                                {logbook.attendees.map((attendee) => (
                                    <ParticipantCard
                                        key={attendee.id}
                                        id={attendee.id}
                                        id_tkm={attendee.legacy_tkm_id}
                                        name={attendee.nama}
                                        photo={attendee.foto}
                                        businessName={attendee.nama_usaha}
                                        sector={attendee.sektor_usaha}
                                        omsetGrowth={attendee.omsetGrowth}
                                        newJobs={attendee.newJobs}
                                    />
                                ))}
                                {logbook.attendees.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground italic w-full">
                                        Tidak ada peserta terdaftar
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Note if any */}
                    {logbook.catatan_verifikasi && (
                        <Card className="border-none shadow-md bg-accent/50 border-border">
                            <CardHeader className="pb-3 px-4">
                                <div className="flex items-center gap-2 text-foreground">
                                    <AlertCircle className="w-4 h-4 text-primary" />
                                    <CardTitle className="text-sm font-bold">Catatan Verifikator</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-sm text-foreground/80 leading-relaxed italic border-l-4 border-primary pl-4 py-2 bg-background/50 rounded-r-lg shadow-sm">
                                    "{logbook.catatan_verifikasi}"
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
