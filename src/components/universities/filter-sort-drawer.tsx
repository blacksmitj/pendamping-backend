"use client";

import * as React from "react";
import {
    Filter,
    ArrowUpDown,
    RotateCcw,
    Check,
    X,
    Activity,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FilterSortDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Filters
    showActiveOnly: boolean;
    onShowActiveOnlyChange: (value: boolean) => void;
    // Sort
    sortOption: string;
    onSortOptionChange: (value: string) => void;
    // Options
    sortOptions: { value: string; label: string }[];
    // Actions
    onReset: () => void;
}

export function FilterSortDrawer({
    open,
    onOpenChange,
    showActiveOnly,
    onShowActiveOnlyChange,
    sortOption,
    onSortOptionChange,
    sortOptions,
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
                                Sesuaikan tampilan daftar universitas.
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
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Status Universitas
                                    </label>
                                    <Select
                                        value={showActiveOnly ? "active" : "all"}
                                        onValueChange={(val) => onShowActiveOnlyChange(val === "active")}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="active">Hanya Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="sort" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <ArrowUpDown className="h-3 w-3" /> Pilihan Urutan
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => onSortOptionChange(option.value)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${sortOption === option.value
                                                    ? "bg-primary/5 border-primary text-primary font-semibold shadow-sm"
                                                    : "bg-background border-border hover:bg-muted/50 text-muted-foreground"
                                                    }`}
                                            >
                                                {option.label}
                                                {sortOption === option.value && <Check className="h-4 w-4" />}
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
