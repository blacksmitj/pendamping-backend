'use client';

import { use, useState } from "react";
import { useMentorDetail, useMentorParticipants } from "@/hooks/use-mentor-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    GraduationCap,
    Mail,
    Phone,
    User,
    Users,
    FileText,
    CheckCircle2,
    BarChart3,
    Info,
    ChevronLeft,
    ChevronRight,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MentorParticipantsTab } from "@/components/mentors/mentor-participants-tab";
import { MentorLogbookTab } from "@/components/mentors/mentor-logbook-tab";
import { MentorOutputTab } from "@/components/mentors/mentor-output-tab";

export default function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: mentor, isLoading, isError } = useMentorDetail(id);
    const { data: participants = [], isLoading: participantsLoading } = useMentorParticipants(id);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (isError || !mentor) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-background text-center p-8">
                <div className="space-y-4">
                    <p className="text-muted-foreground">Mentor tidak ditemukan atau terjadi kesalahan.</p>
                    <Button asChild>
                        <Link href="/mentors">Kembali ke Daftar Mentor</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Breadcrumb & Compact Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 px-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/mentors">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <span className="text-sm font-medium text-muted-foreground">Mentors</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">Detail Profil</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        {mentor.name}
                        <Badge variant="outline" className="bg-primary/5 capitalize font-bold text-primary border-primary/20">
                            {mentor.specialization || "Mentor"}
                        </Badge>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {mentor.phone && (
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg shadow-primary/20"
                            onClick={() => window.open(`https://wa.me/${mentor.phone.replace(/^0/, '62')}`, '_blank')}
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Hubungi Mentor
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
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Total Peserta</p>
                                    <p className="text-2xl font-black tabular-nums">{mentor.stats.totalParticipants}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-chart-3/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-chart-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Total Logbook</p>
                                    <p className="text-2xl font-black tabular-nums">{mentor.stats.totalLogbooks}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-muted/30 hover:bg-chart-2/5 transition-colors group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="rounded-full bg-background p-3 text-chart-2 shadow-sm group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Total Outcome</p>
                                    <p className="text-2xl font-black tabular-nums">{mentor.stats.totalMonthlyReports}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Tabs */}
                    <Tabs defaultValue="participants" className="space-y-6">
                        <TabsList className="bg-muted/30 p-1 h-12 w-full grid grid-cols-3 md:w-auto md:inline-flex">
                            <TabsTrigger value="participants" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <Users className="h-4 w-4" /> <span className="hidden sm:inline">Peserta Binaan</span><span className="sm:hidden">Peserta</span>
                            </TabsTrigger>
                            <TabsTrigger value="logbooks" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Logbook Aktivitas</span><span className="sm:hidden">Logbook</span>
                            </TabsTrigger>
                            <TabsTrigger value="outputs" className="gap-2 font-bold data-[state=active]:shadow-sm">
                                <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Capaian Output</span><span className="sm:hidden">Output</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="participants" className="mt-0 space-y-4 focus-visible:outline-none">
                            {participantsLoading ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                                </div>
                            ) : (
                                <MentorParticipantsTab participants={participants} />
                            )}
                        </TabsContent>

                        <TabsContent value="logbooks" className="mt-0 focus-visible:outline-none">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="text-lg">Logbook Harian Mentor</CardTitle>
                                    <CardDescription>Daftar kegiatan pendampingan yang telah dilakukan</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <MentorLogbookTab mentorId={id} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="outputs" className="mt-0 focus-visible:outline-none">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="text-lg">Daftar Outcome Peserta</CardTitle>
                                    <CardDescription>Capaian usaha dari peserta yang didampingi</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <MentorOutputTab mentorId={id} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Profile Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Mentor Profile Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
                        <header className="relative h-24 bg-primary/10">
                            <div className="absolute inset-x-0 -bottom-10 flex justify-center">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-2xl ring-2 ring-primary/20">
                                    <AvatarImage src={mentor.photo || undefined} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary">
                                        {mentor.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </header>
                        <CardContent className="pt-14 pb-8 text-center space-y-4">
                            <div>
                                <h2 className="text-2xl font-black text-foreground leading-tight">{mentor.name}</h2>
                                <p className="text-muted-foreground text-sm font-medium">{mentor.email}</p>
                            </div>

                            <div className="grid gap-3 p-4 bg-background/50 rounded-2xl border border-border shadow-inner text-sm">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-semibold">NIK</span>
                                    </div>
                                    <span className="font-bold tabular-nums text-foreground/80">{mentor.nik || "-"}</span>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-semibold">Phone</span>
                                    </div>
                                    <span className="font-bold text-foreground/80">{mentor.phone || "-"}</span>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="flex items-center justify-between group text-left">
                                    <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                        <GraduationCap className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-semibold">Univ</span>
                                    </div>
                                    <span className="font-bold text-foreground/80 text-right truncate pl-2">{mentor.university?.name || "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* University Info Card (If exists) */}
                    {mentor.university && (
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-muted/30 border-b py-4">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" /> Info Universitas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Kota/Kabupaten</p>
                                    <p className="font-bold flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-primary" /> {mentor.university.city || "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Provinsi</p>
                                    <p className="font-bold">{mentor.university.province || "-"}</p>
                                </div>
                                <Button asChild variant="outline" size="sm" className="w-full mt-2 font-bold border-primary/20 hover:bg-primary/5 text-primary">
                                    <Link href={`/universities/${mentor.university.id}`}>Lihat Universitas</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
