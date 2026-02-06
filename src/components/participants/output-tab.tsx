"use client";

import { useMemo } from "react";
import { useParticipantOutputs } from "@/hooks/use-participant-outputs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Users, DollarSign, AlertCircle, FileText, TrendingUp } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

// Chart configuration for shadcn theming
const chartConfig = {
    revenue: {
        label: "Omset",
        color: "var(--chart-1)",
    },
    sales: {
        label: "Volume Penjualan",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

// Helper for currency formatting
const formatCurrency = (value: number | undefined | null) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Compact currency for table
const formatCompactCurrency = (value: number | undefined | null) => {
    if (value === null || value === undefined || value === 0) return "-";
    if (value >= 1000000) {
        return `Rp${(value / 1000000).toFixed(1)}jt`;
    }
    if (value >= 1000) {
        return `Rp${(value / 1000).toFixed(0)}rb`;
    }
    return `Rp${value}`;
};

// Status badge component
function StatusBadge({ status }: { status: string | null }) {
    // Handle both 'approved' and 'success' as verified status
    if (status === "approved" || status === "success") {
        return (
            <Badge variant="outline" className="text-chart-2 border-chart-2/20 bg-chart-2/10 text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
            </Badge>
        );
    }
    if (status === "rejected") {
        return (
            <Badge variant="destructive" className="text-xs gap-1">
                <XCircle className="h-3 w-3" />
                Ditolak
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            Pending
        </Badge>
    );
}

// Bookkeeping badge
function BookkeepingBadge({ value }: { value: string | null }) {
    if (!value || value === "F") return <span className="text-muted-foreground">-</span>;
    if (value === "T") return <CheckCircle2 className="h-4 w-4 text-chart-2 mx-auto" />;

    // Handle raw string values (manual, excel, aplikasi, etc)
    return (
        <Badge variant="outline" className="capitalize font-normal bg-chart-1/10 text-chart-1 border-chart-1/20">
            {value.replace(/_/g, " ")}
        </Badge>
    );
}

export function OutputTab({ participantId }: { participantId: string }) {
    const { data, isLoading, isError } = useParticipantOutputs(participantId);

    const chartData = useMemo(() => {
        if (!data?.outputs) return [];
        return data.outputs
            .map(o => ({
                month: `B${o.month_report}`,
                revenue: o.revenue || 0,
                sales: o.sales_volume || 0,
            }))
            .sort((a, b) => {
                const monthA = parseInt(a.month.replace("B", ""));
                const monthB = parseInt(b.month.replace("B", ""));
                return monthA - monthB;
            });
    }, [data]);

    // Calculate verification stats
    const verificationStats = useMemo(() => {
        if (!data?.outputs) return { approved: 0, pending: 0, rejected: 0 };
        return data.outputs.reduce((acc, o) => {
            // Handle both 'approved' and 'success' as verified
            if (o.isverified === "approved" || o.isverified === "success") acc.approved++;
            else if (o.isverified === "rejected") acc.rejected++;
            else acc.pending++;
            return acc;
        }, { approved: 0, pending: 0, rejected: 0 });
    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        Gagal memuat data capaian output.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { outputs, summary } = data;

    return (
        <div className="space-y-6">
            {/* Stats Overview - 4 columns */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Bulan Lapor</p>
                            <p className="text-xl font-bold">{summary.totalMonthsReported}<span className="text-sm font-normal text-muted-foreground">/12</span></p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-chart-1/10">
                            <DollarSign className="h-4 w-4 text-chart-1" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Avg. Omset</p>
                            <p className="text-xl font-bold">{formatCompactCurrency(summary.averageRevenue)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-chart-3/10">
                            <Users className="h-4 w-4 text-chart-3" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tenaga Kerja</p>
                            <p className="text-xl font-bold">{summary.totalNewEmployees}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-chart-2/10">
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Verifikasi</p>
                            <p className="text-xl font-bold">
                                {verificationStats.approved}
                                <span className="text-sm font-normal text-muted-foreground">/{outputs.length}</span>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts - Side by side, more compact */}
            {chartData.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-medium">Tren Omset</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <LineChart data={chartData} accessibilityLayer margin={{ left: 0, right: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={4}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--color-revenue)"
                                        strokeWidth={2}
                                        dot={{ fill: "var(--color-revenue)", r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-medium">Volume Penjualan</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart data={chartData} accessibilityLayer margin={{ left: 0, right: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={4}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={30}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar
                                        dataKey="sales"
                                        fill="var(--color-sales)"
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Monthly Reports Table - Compact */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Detail Laporan Bulanan</CardTitle>
                    <CardDescription>Ringkasan capaian output per bulan</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {outputs.length > 0 ? (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-16 text-xs">Bulan</TableHead>
                                        <TableHead className="text-xs">Omset</TableHead>
                                        <TableHead className="text-xs hidden sm:table-cell">Volume</TableHead>
                                        <TableHead className="text-xs hidden md:table-cell">Produksi</TableHead>
                                        <TableHead className="text-xs text-center w-16">Kas</TableHead>
                                        <TableHead className="text-xs text-center w-16">L/R</TableHead>
                                        <TableHead className="text-xs text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outputs
                                        .sort((a, b) => a.month_report - b.month_report)
                                        .map((output) => (
                                            <TableRow key={output.id} className="text-sm">
                                                <TableCell className="font-medium py-2">
                                                    {output.month_report}
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    {formatCompactCurrency(output.revenue)}
                                                </TableCell>
                                                <TableCell className="py-2 hidden sm:table-cell text-muted-foreground">
                                                    {output.sales_volume || "-"}
                                                    {output.sales_volume_unit && <span className="text-xs ml-1">{output.sales_volume_unit}</span>}
                                                </TableCell>
                                                <TableCell className="py-2 hidden md:table-cell text-muted-foreground">
                                                    {output.production_capacity || "-"}
                                                    {output.production_capacity_unit && <span className="text-xs ml-1">{output.production_capacity_unit}</span>}
                                                </TableCell>
                                                <TableCell className="py-2 text-center">
                                                    <BookkeepingBadge value={output.bookkeeping_cashflow} />
                                                </TableCell>
                                                <TableCell className="py-2 text-center">
                                                    <BookkeepingBadge value={output.bookkeeping_income_statement} />
                                                </TableCell>
                                                <TableCell className="py-2 text-right">
                                                    <StatusBadge status={output.isverified} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                            Belum ada laporan output yang tersedia.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
