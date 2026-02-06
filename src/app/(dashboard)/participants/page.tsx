"use client";

import { useEffect, useMemo, useState } from "react";
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
    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
      <div className="absolute inset-0 flex items-center justify-center uppercase">
        {getInitials(name)}
      </div>
      {photo ? (
        <img
          src={photo}
          alt={name ?? "Profile photo"}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </div>
  );
}

export default function ParticipantsPage() {
  const router = useRouter();
  const [participantSearch, setParticipantSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy] = useState(fieldOptions[0].value);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filters State
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

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
            {/* Row 1: Search & Rows Per Page */}
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
                  className="pl-10 bg-muted/50 border-input h-10"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto self-end">
                <span className="text-sm font-medium text-muted-foreground">Tampilkan</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-[100px] bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} Baris
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Filters Group */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Filter Peserta</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Status</label>
                  <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                    <SelectTrigger className="h-10 w-full bg-background border-border/60">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {filterOptions.statuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Provinsi</label>
                  <Select value={provinceFilter} onValueChange={handleFilterChange(setProvinceFilter)}>
                    <SelectTrigger className="h-10 w-full bg-background border-border/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Provinsi" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Provinsi</SelectItem>
                      {filterOptions.provinces.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Kota/Kabupaten</label>
                  <Select value={cityFilter} onValueChange={handleFilterChange(setCityFilter)}>
                    <SelectTrigger className="h-10 w-full bg-background border-border/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Kota" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kota</SelectItem>
                      {filterOptions.cities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Industri</label>
                  <Select value={sectorFilter} onValueChange={handleFilterChange(setSectorFilter)}>
                    <SelectTrigger className="h-10 w-full bg-background border-border/60">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Bidang Usaha" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Industri</SelectItem>
                      {filterOptions.sectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Batch</label>
                  <Select value={batchFilter} onValueChange={handleFilterChange(setBatchFilter)}>
                    <SelectTrigger className="h-10 w-full bg-background border-border/60">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Batch" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Batch</SelectItem>
                      {filterOptions.batches.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Row 3: Sorting Group */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Urutkan</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full">
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-full sm:w-[220px] bg-background border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Berdasarkan:</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(value) => {
                    setSortOrder(value as "asc" | "desc");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-full sm:w-[220px] bg-background border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Urutan:</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {orderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
