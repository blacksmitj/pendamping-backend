"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { GraduationCap, Phone, RefreshCw, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMentors } from "@/hooks/use-mentors";
import { Mentor } from "@/types/dashboard";
import { FilterSortDrawer } from "@/components/mentors/filter-sort-drawer";
import { Filter } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DataCard,
  PaginationControls,
  TableSkeleton,
} from "../_components/dashboard-ui";

const sortOptions = [
  { value: "recent", label: "Newest", sortBy: "id", sortOrder: "desc" },
  { value: "oldest", label: "Oldest", sortBy: "id", sortOrder: "asc" },
  { value: "name_asc", label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
  { value: "name_desc", label: "Name Z-A", sortBy: "name", sortOrder: "desc" },
  { value: "email", label: "Email", sortBy: "email", sortOrder: "asc" },
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

export default function MentorsPage() {
  const [mentorSearch, setMentorSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortOption, setSortOption] = usePersistentState("mentors-sortOption", sortOptions[0].value);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const activeSort =
    sortOptions.find((option) => option.value === sortOption) ?? sortOptions[0];

  const {
    data: mentorsResponse,
    isLoading: mentorsLoading,
    isError: mentorsError,
    refetch: refetchMentors,
    isFetching: mentorsFetching,
  } = useMentors({
    page,
    pageSize,
    search: mentorSearch,
    sortBy: activeSort.sortBy,
    sortOrder: activeSort.sortOrder as "asc" | "desc",
  });

  const mentors = useMemo(() => mentorsResponse?.data ?? [], [mentorsResponse]);

  const totalPages = mentorsResponse?.totalPages ?? 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleResetFilters = () => {
    setSortOption(sortOptions[0].value);
    setPage(1);
  };

  const handleDownload = () => {
    window.location.href = "/api/export/mentors";
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Mentors
          </p>
          <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">
            Mentor list
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Mentor profiles linked to users and universities.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchMentors()}
          disabled={mentorsFetching}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${mentorsFetching ? "animate-spin text-primary" : ""
              }`}
          />
          Refresh data
        </Button>
      </header>

      <DataCard
        title="Mentor list"
        description="Filter by name, email, or university"
        isLoading={mentorsLoading}
        isError={mentorsError}
        emptyCopy="No mentors match your search."
        searchPlaceholder="Search by name, email, or university"
        searchValue={mentorSearch}
        onSearchChange={(value) => {
          setMentorSearch(value);
          setPage(1);
        }}
        columns={["Foto", "Nama & Email", "Universitas", "Total Peserta", "Total Kunjungan"]}
        headerActions={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="h-10 gap-2 px-4 rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all bg-muted/50"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Download</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="h-10 gap-2 px-4 rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all bg-muted/50"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>Urutkan</span>
            </Button>

            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-32 bg-muted/50 border-border/60 rounded-xl font-medium">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FilterSortDrawer
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              sortOptions={sortOptions}
              onReset={handleResetFilters}
            />
          </div>
        }
      >
        {mentorsLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : mentors.length > 0 ? (
          mentors.map((mentor: Mentor) => (
            <TableRow key={mentor.id} className="border-border hover:bg-accent cursor-pointer group">
              <TableCell>
                <Link href={`/mentors/${mentor.id}`}>
                  <AvatarBubble photo={mentor.photo} name={mentor.name} />
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/mentors/${mentor.id}`} className="flex flex-col">
                  <span className="max-w-[220px] truncate font-medium text-foreground group-hover:text-primary transition-colors">{mentor.name}</span>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span className="truncate">{mentor.email || "No email"}</span>
                    {mentor.nik && <span className="truncate">NIK: {mentor.nik}</span>}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/mentors/${mentor.id}`}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4 text-chart-3" />
                    <div className="flex flex-col">
                      <span className="max-w-[220px] truncate">
                        {mentor.university?.name ?? "Not linked"}
                      </span>
                      <span className="max-w-[220px] truncate text-xs">
                        {[mentor.university?.city, mentor.university?.province]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-center font-medium">
                <Link href={`/mentors/${mentor.id}`}>
                  {mentor.stats?.totalParticipants ?? 0}
                </Link>
              </TableCell>
              <TableCell className="text-center font-medium">
                <Link href={`/mentors/${mentor.id}`}>
                  {mentor.stats?.totalLogbooks ?? 0}
                </Link>
              </TableCell>
            </TableRow>
          ))
        ) : null}
      </DataCard>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={mentorsFetching}
      />
    </div>
  );
}
