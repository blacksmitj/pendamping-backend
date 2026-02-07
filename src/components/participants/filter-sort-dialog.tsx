"use client";

import * as React from "react";
import {
  Filter,
  ArrowUpDown,
  Activity,
  MapPin,
  Tag,
  Layers,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface FilterSortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Filters
  statusFilter: string;
  provinceFilter: string;
  cityFilter: string;
  sectorFilter: string;
  batchFilter: string;
  onStatusChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  // Sort
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  // Filter options
  filterOptions: {
    statuses: string[];
    provinces: string[];
    cities: string[];
    sectors: string[];
    batches: string[];
  };
  // Select options (fieldOptions, orderOptions)
  fieldOptions: { value: string; label: string }[];
  orderOptions: { value: string; label: string }[];
  // Actions
  onReset: () => void;
}

export function FilterSortDialog({
  open,
  onOpenChange,
  statusFilter,
  provinceFilter,
  cityFilter,
  sectorFilter,
  batchFilter,
  onStatusChange,
  onProvinceChange,
  onCityChange,
  onSectorChange,
  onBatchChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  filterOptions,
  fieldOptions,
  orderOptions,
  onReset,
}: FilterSortDialogProps) {
  const activeFiltersCount = [
    statusFilter !== "all",
    provinceFilter !== "all",
    cityFilter !== "all",
    sectorFilter !== "all",
    batchFilter !== "all",
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[80vw] lg:max-w-[80%] gap-0 p-0 overflow-hidden sm:rounded-2xl h-fit max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Filter className="h-5 w-5" />
                </div>
                Filter & Urutkan
              </DialogTitle>
              <DialogDescription>
                Sesuaikan tampilan daftar peserta program.
              </DialogDescription>
            </div>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-6 gap-1 px-2 rounded-full bg-primary/10 text-primary border-none">
                {activeFiltersCount} Aktif
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="filter" className="w-full">
          <div className="px-6 pt-6">
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

          <div className="p-6 overflow-y-auto">
            <TabsContent value="filter" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Status Kepesertaan
                  </label>
                  <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Semua Status</SelectItem>
                      {filterOptions.statuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Region Grid - Split into individual columns for wide layout */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Provinsi
                  </label>
                  <Select value={provinceFilter} onValueChange={onProvinceChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Semua Provinsi</SelectItem>
                      {filterOptions.provinces.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Kota/Kabupaten
                  </label>
                  <Select value={cityFilter} onValueChange={onCityChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Semua Kota</SelectItem>
                      {filterOptions.cities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sector & Batch */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <Tag className="h-3 w-3" /> Bidang Usaha (Industri)
                  </label>
                  <Select value={sectorFilter} onValueChange={onSectorChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10">
                      <SelectValue placeholder="Semua Industri" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Semua Industri</SelectItem>
                      {filterOptions.sectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Batch Program
                  </label>
                  <Select value={batchFilter} onValueChange={onBatchChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10">
                      <SelectValue placeholder="Semua Batch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Semua Batch</SelectItem>
                      {filterOptions.batches.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sort" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <ArrowUpDown className="h-3 w-3" /> Urutkan Berdasarkan
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {fieldOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onSortByChange(option.value)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${sortBy === option.value
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

                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Arah Urutan
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

        <DialogFooter className="p-6 pt-0 flex flex-row items-center gap-3">
          <Button
            variant="ghost"
            onClick={onReset}
            className="flex-1 h-11 rounded-xl hover:bg-destructive/5 hover:text-destructive group"
          >
            <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-[-45deg] transition-transform" />
            Reset Semua
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-[1.5] h-11 rounded-xl shadow-lg shadow-primary/20"
          >
            Terapkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
