"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  MapPin,
  Activity,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParticipants } from "@/hooks/use-participants";
import { Participant } from "@/types/dashboard";
import {
  DataCard,
  PaginationControls,
  TableSkeleton,
  statusVariant,
} from "../_components/dashboard-ui";
import { TableCell, TableRow } from "@/components/ui/table";
import { FilterSortDrawer } from "@/components/participants/filter-sort-drawer";

const fieldOptions = [
  { value: "registered", label: "Tanggal Daftar" },
  { value: "name", label: "Nama Peserta" },
  { value: "business_name", label: "Nama Usaha" },
  { value: "sector", label: "Bidang Usaha" },
  { value: "revenue_growth", label: "Pertumbuhan Omzet" },
  { value: "omset_highest", label: "Nilai Omzet" },
  { value: "status", label: "Status" },
];

const orderOptions = [
  { value: "desc", label: "Terbaru/Terbesar (Z-A)" },
  { value: "asc", label: "Terlama/Terkecil (A-Z)" },
];

const pageSizeOptions = [10, 20, 50];

function getInitials(value?: string | null) {
  if (!value) return "NA";
  const [first = "", second = ""] = value.trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || "NA";
}

function AvatarBubble({
  photo,
  name,
}: {
  photo?: string | null;
  name?: string | null;
}) {
  return (
    <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
      {photo && <AvatarImage src={photo} alt={name ?? ""} className="object-cover" />}
      <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground uppercase">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default function ParticipantsPage() {
  const router = useRouter();
  const [participantSearch, setParticipantSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy, resetSortBy] = usePersistentState("participants-sortBy", fieldOptions[0].value);
  const [sortOrder, setSortOrder, resetSortOrder] = usePersistentState<"asc" | "desc">("participants-sortOrder", "desc");

  // Filters State
  const [statusFilter, setStatusFilter, resetStatusFilter] = usePersistentState("participants-statusFilter", "all");
  const [provinceFilter, setProvinceFilter, resetProvinceFilter] = usePersistentState("participants-provinceFilter", "all");
  const [cityFilter, setCityFilter, resetCityFilter] = usePersistentState("participants-cityFilter", "all");
  const [sectorFilter, setSectorFilter, resetSectorFilter] = usePersistentState("participants-sectorFilter", "all");
  const [batchFilter, setBatchFilter, resetBatchFilter] = usePersistentState("participants-batchFilter", "all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const activeFilterCount = [
    statusFilter !== "all",
    provinceFilter !== "all",
    cityFilter !== "all",
    sectorFilter !== "all",
    batchFilter !== "all",
  ].filter(Boolean).length;

  // Filter Options State
  const [filterOptions, setFilterOptions] = useState<{
    statuses: string[];
    provinces: string[];
    cities: string[];
    sectors: string[];
    batches: string[];
  }>({ statuses: [], provinces: [], cities: [], sectors: [], batches: [] });

  useEffect(() => {
    // Fetch filter options
    fetch("/api/participants/filters")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setFilterOptions({
            statuses: data.statuses || [],
            provinces: data.provinces || [],
            cities: data.cities || [],
            sectors: data.sectors || [],
            batches: data.batches || [],
          });
        }
      })
      .catch((err) => console.error("Failed to fetch filters", err));
  }, []);

  // const activeSort =
  //   sortOptions.find((option) => option.value === sortOption) ?? sortOptions[0];

  const {
    data: participantsResponse,
    isLoading: participantsLoading,
    isError: participantsError,
    refetch: refetchParticipants,
    isFetching: participantsFetching,
  } = useParticipants({
    page,
    pageSize,
    search: participantSearch,
    sortBy: sortBy,
    sortOrder: sortOrder,
    status: statusFilter !== "all" ? statusFilter : undefined,
    province: provinceFilter !== "all" ? provinceFilter : undefined,
    city: cityFilter !== "all" ? cityFilter : undefined,
    sector: sectorFilter !== "all" ? sectorFilter : undefined,
    batch: batchFilter !== "all" ? batchFilter : undefined,
  });

  const participants = useMemo(
    () => participantsResponse?.data ?? [],
    [participantsResponse]
  );

  const totalPages = participantsResponse?.totalPages ?? 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    resetStatusFilter();
    resetProvinceFilter();
    resetCityFilter();
    resetSectorFilter();
    resetBatchFilter();
    resetSortBy();
    resetSortOrder();
    setPage(1);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Participants
          </p>
          <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">
            Participant list
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Business owners enrolled in the program.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchParticipants()}
          disabled={participantsFetching}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${participantsFetching ? "animate-spin text-primary" : ""
              }`}
          />
          Refresh data
        </Button>
      </header>

      <DataCard
        isLoading={participantsLoading}
        isError={participantsError}
        emptyCopy="No participants match your search."
        columns={["Peserta", "Usaha & Industri", "Lokasi", "Status", "Growth", "Karyawan"]}
        customHeader={
          <div className="flex flex-col gap-6">
            {/* Row 1: Search & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, usaha, atau kota..."
                  value={participantSearch}
                  onChange={(e) => {
                    setParticipantSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 bg-muted/50 border-input h-10 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className={`h-10 gap-2 px-4 rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all ${activeFilterCount > 0 ? "bg-primary/5 border-primary/30 text-primary font-medium" : "bg-muted/50"
                    }`}
                >
                  <Filter className={`h-4 w-4 ${activeFilterCount > 0 ? "text-primary" : "text-muted-foreground"}`} />
                  <span>Filter & Urutkan</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground border-none text-[10px] font-bold">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tampilkan</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 w-[90px] bg-muted/50 border-border/60 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <FilterSortDrawer
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
              statusFilter={statusFilter}
              provinceFilter={provinceFilter}
              cityFilter={cityFilter}
              sectorFilter={sectorFilter}
              batchFilter={batchFilter}
              onStatusChange={handleFilterChange(setStatusFilter)}
              onProvinceChange={handleFilterChange(setProvinceFilter)}
              onCityChange={handleFilterChange(setCityFilter)}
              onSectorChange={handleFilterChange(setSectorFilter)}
              onBatchChange={handleFilterChange(setBatchFilter)}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              filterOptions={filterOptions}
              fieldOptions={fieldOptions}
              orderOptions={orderOptions}
              onReset={handleResetFilters}
            />
          </div>
        }

      >
        {participantsLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : participants.length > 0 ? (
          participants.map((participant: Participant) => (
            <TableRow
              key={participant.id || participant.id_tkm}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/participants/${participant.id_tkm}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <AvatarBubble photo={participant.photo} name={participant.nama} />
                  <div className="flex flex-col">
                    <span className="max-w-[220px] truncate font-semibold text-foreground">
                      {participant.nama ?? "No name"}
                    </span>
                    <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                      ID: {participant.id_tkm}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="max-w-[220px] truncate font-medium">
                    {participant.nama_usaha ?? "No business name"}
                  </span>
                  <span className="max-w-[220px] truncate text-xs text-muted-foreground italic">
                    {participant.sektor_usaha ?? "No sector"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                {[participant.kota_domisili, participant.provinsi_domisili]
                  .filter(Boolean)
                  .join(", ") || "Not set"}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(participant.status)}>
                  {participant.status ?? "Unknown"}
                </Badge>
              </TableCell>

              {/* New Columns */}
              <TableCell>
                <span className={`font-medium ${(participant.omset_growth || 0) > 0 ? 'text-chart-2' :
                  (participant.omset_growth || 0) < 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                  {participant.omset_growth ? `${participant.omset_growth.toFixed(1)}%` : "0%"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-medium ${(participant.new_employees || 0) > 0 ? 'text-chart-2' : 'text-muted-foreground'}`}>
                  {(participant.new_employees || 0) > 0 ? `+${participant.new_employees}` : participant.new_employees || 0}
                </span>
              </TableCell>

            </TableRow>
          ))
        ) : null}
      </DataCard>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={participantsFetching}
      />
    </div>
  );
}
