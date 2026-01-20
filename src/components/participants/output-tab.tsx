"use client";

import { useMemo } from "react";
import { useParticipantOutputs } from "@/hooks/use-participant-outputs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, TrendingUp, Users, DollarSign, AlertCircle, FileText } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import type { Output } from "@/types/participant";

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

function MonthlyOutputCard({ output }: { output: Output }) {
    const hasEmployees = output.newEmployees && output.newEmployees.length > 0;

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Bulan {output.month_report}</CardTitle>
                    {output.isverified === "approved" ? (
                        <Badge className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Verifikasi</Badge>
                    ) : output.isverified === "rejected" ? (
                        <Badge variant="destructive">Ditolak</Badge>
                    ) : (
                        <Badge variant="secondary">Pending</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {/* Metrics */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Omset:</span>
                        <span className="font-medium">{formatCurrency(output.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume Penjualan:</span>
                        <span className="font-medium">
                            {output.sales_volume ? `${output.sales_volume} ${output.sales_volume_unit || ''}` : '-'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Kapasitas Produksi:</span>
                        <span className="font-medium">
                            {output.production_capacity ? `${output.production_capacity} ${output.production_capacity_unit || ''}` : '-'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Laba:</span>
                        <span className="font-medium">{formatCurrency(output.revenue ? output.revenue * 0.2 : 0)} {/* Estimated */}</span>
                    </div>
                </div>

                {/* Financial Records */}
                <div className="rounded-md bg-muted p-2">
                    <p className="mb-2 font-medium flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Pencatatan Keuangan
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-muted-foreground block">Cashflow</span>
                            <span>{output.bookkeeping_cashflow || "-"}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Laba Rugi</span>
                            <span>{output.bookkeeping_income_statement || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* New Employees */}
                {hasEmployees && (
                    <div className="rounded-md border p-2">
                        <p className="mb-2 font-medium flex items-center gap-2 text-primary">
                            <Users className="h-3 w-3" /> {output.newEmployees.length} Tenaga Kerja Baru
                        </p>
                        <ul className="space-y-1 text-xs">
                            {output.newEmployees.map(emp => (
                                <li key={emp.id} className="flex justify-between">
                                    <span>{emp.name}</span>
                                    <span className="text-muted-foreground">{emp.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function OutputTab({ participantId }: { participantId: string }) {
    const { data, isLoading, isError } = useParticipantOutputs(participantId);

    const chartData = useMemo(() => {
        if (!data?.outputs) return [];
        return data.outputs
            .map(o => ({
                month: `Bulan ${o.month_report}`,
                revenue: o.revenue || 0,
                sales: o.sales_volume || 0,
            }))
            .sort((a, b) => {
                const monthA = parseInt(a.month.replace("Bulan ", ""));
                const monthB = parseInt(b.month.replace("Bulan ", ""));
                return monthA - monthB;
            });
    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-80 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-60" />
                    <Skeleton className="h-60" />
                    <Skeleton className="h-60" />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
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
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Bulan Lapor
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalMonthsReported} <span className="text-sm font-normal text-muted-foreground">/ 12</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rata-rata Omset
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.averageRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Tenaga Kerja
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalNewEmployees}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tren Omset</CardTitle>
                            <CardDescription>Perkembangan pendapatan per bulan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={80}
                                        />
                                        <Tooltip
                                            formatter={(value: number | undefined) => formatCurrency(value)}
                                            labelStyle={{ color: 'black' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sales Volume Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Volume Penjualan</CardTitle>
                            <CardDescription>Perkembangan penjualan per bulan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            labelStyle={{ color: 'black' }}
                                        />
                                        <Bar
                                            dataKey="sales"
                                            fill="#16a34a"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Monthly Cards Grid */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Detail Laporan Bulanan</h3>
                {outputs.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {outputs.map((output) => (
                            <MonthlyOutputCard key={output.id} output={output} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                            Belum ada laporan outcome yang tersedia.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
