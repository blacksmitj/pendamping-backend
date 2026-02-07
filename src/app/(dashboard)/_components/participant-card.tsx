'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Phone, TrendingUp, TrendingDown, Users2 } from "lucide-react";
import Link from "next/link";
import { statusVariant } from "@/app/(dashboard)/_components/dashboard-ui";

interface ParticipantCardProps {
    id: string;
    id_tkm?: string | null;
    name: string;
    photo?: string | null;
    businessName: string;
    sector?: string | null;
    phone?: string | null;
    status?: string | null;
    state?: string | null;
    omsetGrowth: number;
    newJobs: number;
}

export function ParticipantCard({
    id,
    id_tkm,
    name,
    photo,
    businessName,
    sector,
    phone,
    status,
    state,
    omsetGrowth,
    newJobs
}: ParticipantCardProps) {
    const growthColor = omsetGrowth > 0 ? "text-chart-2" : omsetGrowth < 0 ? "text-destructive" : "text-muted-foreground";
    const GrowthIcon = omsetGrowth > 0 ? TrendingUp : TrendingDown;

    const routingId = (id_tkm && id_tkm !== "N/A") ? id_tkm : id;

    return (
        <Link href={`/participants/${routingId}`}>
            <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30 h-full border-border bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border shadow-sm group-hover:border-primary/50 transition-colors">
                                <AvatarImage src={photo || undefined} className="object-cover" />
                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                    {name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                    {name}
                                </h3>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                                    ID: {id_tkm || id.slice(0, 8)}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    <Badge variant={statusVariant(status || state)} className="text-[9px] h-4 leading-none font-bold uppercase py-0 px-1.5">
                                        {status || state || "Unknown"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 pt-1 border-t border-border/40">
                            <div className="flex items-center gap-2.5 text-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{businessName}</p>
                                    <p className="text-[10px] text-muted-foreground truncate italic">{sector || "Tanpa Sektor"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="rounded-xl bg-muted/50 p-2.5 border border-border/40">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Growth</span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${growthColor}`}>
                                        <GrowthIcon className="h-3 w-3" />
                                        <span>{omsetGrowth.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-2.5 border border-border/40">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Users2 className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">New Jobs</span>
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                        +{newJobs} <span className="text-[10px] font-medium text-muted-foreground ml-0.5">Posisi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
