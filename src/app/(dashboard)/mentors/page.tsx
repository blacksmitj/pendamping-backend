"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Phone, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useMentors } from "@/hooks/use-mentors";
import { Mentor } from "@/types/dashboard";
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

export default function MentorsPage() {
  const [mentorSearch, setMentorSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortOption, setSortOption] = useState(sortOptions[0].value);

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

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Mentors
          </p>
          <h1 className="text-3xl font-semibold text-slate-950 lg:text-4xl">
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
            className={`h-4 w-4 ${
              mentorsFetching ? "animate-spin text-primary" : ""
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
        columns={["Photo", "Mentor", "University", "Contact", "Gender"]}
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
        {mentorsLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : mentors.length > 0 ? (
          mentors.map((mentor: Mentor) => (
            <TableRow key={mentor.id}>
              <TableCell>
                <AvatarBubble photo={mentor.photo} name={mentor.name} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="max-w-[220px] truncate font-medium">{mentor.name}</span>
                  <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {mentor.email || "No email"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-sky-600" />
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  {mentor.phone || "No phone"}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {mentor.gender ? mentor.gender.toUpperCase() : "N/A"}
                </Badge>
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
