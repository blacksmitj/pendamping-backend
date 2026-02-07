"use client";

import * as React from "react";
import {
    Filter,
    ArrowUpDown,
    RotateCcw,
    Check,
    X,
    Calendar,
    ShieldCheck,
    BarChart3,
} from "lucide-react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";

interface FilterSortDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Filters
    filterCondition: string;
    filterVerified: string;
    filterDate: string;
    onConditionChange: (value: string) => void;
    onVerifiedChange: (value: string) => void;
    onDateChange: (value: string) => void;
    // Sort
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortByChange: (value: string) => void;
    onSortOrderChange: (value: "asc" | "desc") => void;
    // Options
    conditionOptions: string[];
    verifiedOptions: string[];
    // Actions
    onReset: () => void;
}

const fieldOptions = [
    { value: "date", label: "Tanggal" },
    { value: "verified", label: "Status Verifikasi" },
    { value: "pendamping", label: "Pendamping" },
    { value: "condition", label: "Kondisi Usaha" },
    { value: "id_tkm", label: "ID TKM" },
];

const orderOptions = [
    { value: "desc", label: "Terbaru/Terbesar (Z-A)" },
    { value: "asc", label: "Terlama/Terkecil (A-Z)" },
];

export function FilterSortDrawer({
    open,
    onOpenChange,
    filterCondition,
    filterVerified,
    filterDate,
    onConditionChange,
    onVerifiedChange,
    onDateChange,
    sortBy,
    sortOrder,
    onSortByChange,
    onSortOrderChange,
    conditionOptions,
    verifiedOptions,
    onReset,
}: FilterSortDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="h-full w-full sm:max-w-md flex flex-col focus:outline-none inset-y-0 right-0">
                <DrawerHeader className="p-6 pb-4 flex-shrink-0 border-b">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Filter className="h-5 w-5" />
                                </div>
                                Filter & Urutkan
                            </DrawerTitle>
                            <DrawerDescription>
                                Sesuaikan tampilan daftar capaian output.
                            </DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-muted">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <Tabs defaultValue="filter" className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                        <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger
                                value="filter"
                                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </TabsTrigger>
                            <TabsTrigger
                                value="sort"
                                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                            >
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Urutkan
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <TabsContent value="filter" className="mt-0 space-y-6 animate-in fade-in-50 duration-300 outline-none">
                            <div className="space-y-6">
                                {/* Condition Filter */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <BarChart3 className="h-3 w-3" /> Kondisi Usaha
                                    </label>
                                    <Select
                                        value={filterCondition || "all"}
                                        onValueChange={(val) => onConditionChange(val === "all" ? "" : val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                                            <SelectValue placeholder="Semua Kondisi" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="all">Semua Kondisi</SelectItem>
                                            {conditionOptions.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Verified Filter */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3" /> Status Verifikasi
                                    </label>
                                    <Select
                                        value={filterVerified || "all"}
                                        onValueChange={(val) => onVerifiedChange(val === "all" ? "" : val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            {verifiedOptions.map((v) => (
                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Filter */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Tanggal Output
                                    </label>
                                    <DatePicker
                                        value={filterDate}
                                        onChange={onDateChange}
                                        className="w-full h-11 rounded-xl bg-muted/30 border-muted-foreground/10"
                                        placeholder="Pilih Tanggal"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="sort" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <ArrowUpDown className="h-3 w-3" /> Urutkan Berdasarkan
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {fieldOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => onSortByChange(option.value)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${sortBy === option.value
                                                    ? "bg-primary/5 border-primary text-primary font-semibold shadow-sm"
                                                    : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                                                    }`}
                                            >
                                                {option.label}
                                                {sortBy === option.value && <Check className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <ArrowUpDown className="h-3 w-3" /> Arah Urutan
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {orderOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => onSortOrderChange(option.value as "asc" | "desc")}
                                                className={`flex items-center justify-between px-4 py-4 rounded-xl border text-sm transition-all ${sortOrder === option.value
                                                    ? "bg-primary/5 border-primary text-primary font-semibold shadow-sm"
                                                    : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                                                    }`}
                                            >
                                                <span className="font-medium">{option.label}</span>
                                                {sortOrder === option.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DrawerFooter className="p-6 pt-0 border-t flex flex-row items-center gap-3 bg-background flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onReset}
                        className="flex-1 h-11 rounded-xl hover:bg-destructive/5 hover:text-destructive group"
                    >
                        <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-[-45deg] transition-transform" />
                        Reset
                    </Button>
                    <DrawerClose asChild>
                        <Button
                            className="flex-[1.5] h-11 rounded-xl shadow-lg shadow-primary/20"
                        >
                            Terapkan
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
