"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
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

const sortOptions = [
  { value: "revenue_growth", label: "Highest Growth %", sortBy: "revenue_growth", sortOrder: "desc" },
  { value: "omset_highest", label: "Highest Revenue", sortBy: "omset_highest", sortOrder: "desc" },
  { value: "omset_lowest", label: "Lowest Revenue", sortBy: "omset_lowest", sortOrder: "asc" },
  { value: "name_asc", label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
  { value: "name_desc", label: "Name Z-A", sortBy: "name", sortOrder: "desc" },
  { value: "status", label: "Status", sortBy: "status", sortOrder: "asc" },
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
  const [sortOption, setSortOption] = useState(sortOptions[0].value);

  // Filters State
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  // Filter Options State
  const [filterOptions, setFilterOptions] = useState<{
    statuses: string[];
    provinces: string[];
    cities: string[];
  }>({ statuses: [], provinces: [], cities: [] });

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
          });
        }
      })
      .catch((err) => console.error("Failed to fetch filters", err));
  }, []);

  const activeSort =
    sortOptions.find((option) => option.value === sortOption) ?? sortOptions[0];

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
    sortBy: activeSort.sortBy,
    sortOrder: activeSort.sortOrder as "asc" | "desc",
    status: statusFilter !== "all" ? statusFilter : undefined,
    province: provinceFilter !== "all" ? provinceFilter : undefined,
    city: cityFilter !== "all" ? cityFilter : undefined,
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
          <h1 className="text-3xl font-semibold text-slate-950 lg:text-4xl">
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
        columns={["Photo", "Name & business", "Location", "Status", "Growth", "New Employees"]}
        customHeader={
          <div className="flex flex-col gap-6">
            {/* Row 1: Title */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Participant list</h3>
              <p className="text-sm text-muted-foreground">Filter and manage program participants.</p>
            </div>

            {/* Row 2: Filters & Sort */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap items-center">
              {/* Filters */}
              <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                <SelectTrigger className="h-9 w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {filterOptions.statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={provinceFilter} onValueChange={handleFilterChange(setProvinceFilter)}>
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {filterOptions.provinces.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={handleFilterChange(setCityFilter)}>
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filterOptions.cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* General Sort */}
              <Select
                value={sortOption}
                onValueChange={(value) => {
                  setSortOption(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Search (Left) & Page Size (Right) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Input
                placeholder="Search by name, business, or city"
                value={participantSearch}
                onChange={(e) => {
                  setParticipantSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-80 bg-muted border-input text-foreground placeholder:text-muted-foreground h-9"
              />

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-[80px]">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
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
        }
      >
        {participantsLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : participants.length > 0 ? (
          participants.map((participant: Participant) => (
            <TableRow
              key={participant.no}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/participants/${participant.id_tkm}`)}
            >
              <TableCell>
                <AvatarBubble photo={participant.photo} name={participant.nama} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="max-w-[220px] truncate font-medium">
                    {participant.nama ?? "No name"}
                  </span>
                  <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {participant.nama_usaha ?? "No business name"}
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
                <span className={`font-medium ${(participant.omset_growth || 0) > 0 ? 'text-green-600' :
                  (participant.omset_growth || 0) < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                  {participant.omset_growth ? `${participant.omset_growth.toFixed(1)}%` : "0%"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-medium ${(participant.new_employees || 0) > 0 ? 'text-green-600' : 'text-slate-700'}`}>
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
