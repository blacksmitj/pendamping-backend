"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  formatDate,
  statusVariant,
} from "../_components/dashboard-ui";
import { TableCell, TableRow } from "@/components/ui/table";

const sortOptions = [
  { value: "recent", label: "Newest", sortBy: "no", sortOrder: "desc" },
  { value: "oldest", label: "Oldest", sortBy: "no", sortOrder: "asc" },
  { value: "name_asc", label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
  { value: "name_desc", label: "Name Z-A", sortBy: "name", sortOrder: "desc" },
  { value: "status", label: "Status", sortBy: "status", sortOrder: "asc" },
  { value: "registered", label: "Registered date", sortBy: "registered", sortOrder: "desc" },
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
  const [participantSearch, setParticipantSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortOption, setSortOption] = useState(sortOptions[0].value);

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
            className={`h-4 w-4 ${
              participantsFetching ? "animate-spin text-primary" : ""
            }`}
          />
          Refresh data
        </Button>
      </header>

      <DataCard
        title="Participant list"
        description="Filter by name, business, or city"
        isLoading={participantsLoading}
        isError={participantsError}
        emptyCopy="No participants match your search."
        searchPlaceholder="Search by name, business, or city"
        searchValue={participantSearch}
        onSearchChange={(value) => {
      setParticipantSearch(value);
      setPage(1);
    }}
        columns={["Photo", "Name & business", "Location", "Status", "Registered"]}
        headerActions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={sortOption}
              onValueChange={(value) => {
                setSortOption(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-48">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    Sort: {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-32">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {participantsLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : participants.length > 0 ? (
          participants.map((participant: Participant) => (
            <TableRow key={participant.no}>
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
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary/80" />
                  {formatDate(participant.tanggal_daftar)}
                </div>
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
