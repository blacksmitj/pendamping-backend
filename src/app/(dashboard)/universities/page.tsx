"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUniversities } from "@/hooks/use-universities";
import { University } from "@/types/dashboard";
import {
  EmptyRow,
  PaginationControls,
  TableSkeleton,
} from "../_components/dashboard-ui";

const sortOptions = [
  { value: "name_asc", label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
  { value: "name_desc", label: "Name Z-A", sortBy: "name", sortOrder: "desc" },
  { value: "city", label: "City", sortBy: "city", sortOrder: "asc" },
  { value: "province", label: "Province", sortBy: "province", sortOrder: "asc" },
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
          alt={name ?? "University logo"}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </div>
  );
}

export default function UniversitiesPage() {
  const [universitySearch, setUniversitySearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortOption, setSortOption] = useState(sortOptions[0].value);

  const activeSort =
    sortOptions.find((option) => option.value === sortOption) ?? sortOptions[0];

  const {
    data: universitiesResponse,
    isLoading: universitiesLoading,
    isError: universitiesError,
    refetch: refetchUniversities,
    isFetching: universitiesFetching,
  } = useUniversities({
    page,
    pageSize,
    search: universitySearch,
    sortBy: activeSort.sortBy,
    sortOrder: activeSort.sortOrder as "asc" | "desc",
  });

  const universities = useMemo(
    () => universitiesResponse?.data ?? [],
    [universitiesResponse]
  );

  const totalPages = universitiesResponse?.totalPages ?? 1;

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
            Universities
          </p>
          <h1 className="text-3xl font-semibold text-slate-950 lg:text-4xl">
            University list
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Partner campuses connected to mentors and participants.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchUniversities()}
          disabled={universitiesFetching}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              universitiesFetching ? "animate-spin text-primary" : ""
            }`}
          />
          Refresh data
        </Button>
      </header>

      <Card className="backdrop-blur">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>University list</CardTitle>
            <CardDescription>
              Filter by name or campus region.
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              placeholder="Search by name or region"
              value={universitySearch}
              onChange={(event) => {
                setUniversitySearch(event.target.value);
                setPage(1);
              }}
            />
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>University</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universitiesLoading ? (
                <TableSkeleton rows={6} columns={5} />
              ) : universities.length > 0 ? (
                universities.map((university: University) => (
                  <TableRow key={university.id}>
                    <TableCell>
                      <AvatarBubble
                        photo={university.photo}
                        name={university.name}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="max-w-[220px] truncate">
                          {university.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                      {university.city}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                      {university.province}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {university.alamat ?? "No address"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyRow message="No universities match your search." />
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isLoading={universitiesFetching}
          />
          {universitiesError && (
            <p className="mt-4 text-sm text-destructive">
              Failed to load universities. Please refresh.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
