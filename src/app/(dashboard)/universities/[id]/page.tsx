'use client';

import { use } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Building2,
    Users,
    User,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Info,
    GraduationCap,
    CheckCircle2,
    FileText,
    BarChart3
} from "lucide-react";
import { useUniversityDetail } from "@/hooks/use-university-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniversityMentorsTab } from "@/components/universities/university-mentors-tab";
import { UniversityParticipantsTab } from "@/components/universities/university-participants-tab";

export default function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { data: university, isLoading, isError } = useUniversityDetail(id);

    const activeTab = searchParams.get("tab") || "mentors";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`);
    };

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
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <Skeleton className="h-[300px] rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !university) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-destructive/10 p-6 rounded-full text-destructive mb-4">
                    <Info className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Gagal Memuat Data</h2>
                <p className="text-muted-foreground mb-6">Terjadi kesalahan saat mengambil data universitas atau data tidak ditemukan.</p>
                <Link href="/universities">
                    <Button variant="outline">Kembali ke Daftar</Button>
                </Link>
            </div>
        );
    }

    const initials = (university.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="w-full space-y-6 pb-20 animate-in fade-in duration-500">
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
                        <span className="text-sm font-medium text-muted-foreground">Universities</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">Detail Profil</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        {university.name}
                        <Badge variant="outline" className={`capitalize font-bold border-2 ${university.status === "active" ? "bg-primary/5 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                            {university.status || "N/A"}
                        </Badge>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-primary/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Total Mentor</p>
                                    <p className="text-2xl font-black tabular-nums">{university.stats.totalMentors}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-chart-2/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-chart-2 shadow-sm group-hover:scale-110 transition-transform">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Total Peserta</p>
                                    <p className="text-2xl font-black tabular-nums">{university.stats.totalParticipants}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-muted/30 p-1 h-12 w-full grid grid-cols-2 md:w-auto md:inline-flex">
                            <TabsTrigger value="mentors" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <Users className="h-4 w-4" /> <span className="hidden sm:inline">Daftar Mentor</span><span className="sm:hidden">Mentor</span>
                            </TabsTrigger>
                            <TabsTrigger value="participants" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <CheckCircle2 className="h-4 w-4" /> <span className="hidden sm:inline">Daftar Peserta</span><span className="sm:hidden">Peserta</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="mentors" className="mt-0 focus-visible:outline-none">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="text-lg">Mentor dari {university.name}</CardTitle>
                                    <CardDescription>Daftar dosen pendamping lapangan yang terdaftar</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <UniversityMentorsTab universityId={id} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="participants" className="mt-0 focus-visible:outline-none">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="text-lg">Peserta Binaan {university.name}</CardTitle>
                                    <CardDescription>Daftar wirausaha mahasiswa yang sedang didampingi</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <UniversityParticipantsTab universityId={id} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* University Profile Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
                        <header className="relative h-24 bg-primary/10">
                            <div className="absolute inset-x-0 -bottom-10 flex justify-center">
                                <div className="h-28 w-28 rounded-full border-4 border-background shadow-2xl ring-2 ring-primary/20 flex items-center justify-center text-4xl font-black bg-primary/5 text-primary">
                                    {initials}
                                </div>
                            </div>
                        </header>
                        <CardContent className="pt-14 pb-8 text-center space-y-4 px-6">
                            <div>
                                <h2 className="text-2xl font-black text-foreground leading-tight">{university.name}</h2>
                                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mt-1">ID: {university.id}</p>
                            </div>

                            <div className="grid gap-3 p-4 bg-background/50 rounded-2xl border border-border shadow-inner text-sm">
                                <div className="flex items-center justify-between group text-left">
                                    <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                        <MapPin className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Lokasi</span>
                                    </div>
                                    <span className="font-bold text-foreground/80 text-right truncate pl-2">{university.city}, {university.province}</span>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <GraduationCap className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Status</span>
                                    </div>
                                    <span className={`font-bold capitalize ${university.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>{university.status}</span>
                                </div>
                            </div>

                            {university.address && (
                                <div className="space-y-1 text-left pt-2">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Alamat Lengkap</p>
                                    <p className="text-xs font-medium leading-relaxed italic">{university.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
