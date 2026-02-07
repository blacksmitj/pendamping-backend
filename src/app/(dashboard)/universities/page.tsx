"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { Building2, RefreshCw, Power, PowerOff, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { FilterSortDrawer } from "@/components/universities/filter-sort-drawer";
import { Badge } from "@/components/ui/badge";

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
    <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
      {photo && <AvatarImage src={photo} alt={name ?? ""} className="object-cover" />}
      <AvatarFallback className="bg-muted text-xs font-bold text-muted-foreground uppercase">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default function UniversitiesPage() {
  const [universitySearch, setUniversitySearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortOption, setSortOption] = usePersistentState("universities-sortOption", sortOptions[0].value);
  const [showActiveOnly, setShowActiveOnly] = usePersistentState("universities-showActiveOnly", true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
    status: showActiveOnly ? "active" : undefined,
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

  const handleResetFilters = () => {
    setShowActiveOnly(true);
    setSortOption(sortOptions[0].value);
    setPage(1);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Universities
          </p>
          <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">
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
            className={`h-4 w-4 ${universitiesFetching ? "animate-spin text-primary" : ""
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
              className="w-full sm:w-64 bg-muted/50 border-border/60 rounded-xl"
            />

            <Button
              variant="outline"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`h-10 gap-2 px-4 rounded-xl border-border/60 hover:bg-primary/5 hover:border-primary/30 transition-all ${!showActiveOnly ? "bg-primary/5 border-primary/30 text-primary font-medium" : "bg-muted/50"
                }`}
            >
              <Filter className={`h-4 w-4 ${!showActiveOnly ? "text-primary" : "text-muted-foreground"}`} />
              <span>Filter & Urutkan</span>
              {!showActiveOnly && (
                <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground border-none text-[10px] font-bold">
                  1
                </Badge>
              )}
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
              showActiveOnly={showActiveOnly}
              onShowActiveOnlyChange={setShowActiveOnly}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              sortOptions={sortOptions}
              onReset={handleResetFilters}
            />
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universitiesLoading ? (
                <TableSkeleton rows={6} columns={5} />
              ) : universities.length > 0 ? (
                universities.map((university: University) => (
                  <TableRow key={university.id}>
                    <TableCell>
                      <Link href={`/universities/${university.id}`}>
                        <AvatarBubble
                          photo={university.photo}
                          name={university.name}
                        />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/universities/${university.id}`} className="flex items-center gap-2 font-medium group">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="max-w-[220px] truncate group-hover:text-primary transition-colors">
                          {university.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                      <Link href={`/universities/${university.id}`}>
                        {university.city}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                      <Link href={`/universities/${university.id}`}>
                        {university.province}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      <Link href={`/universities/${university.id}`}>
                        {university.alamat ?? "No address"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/universities/${university.id}`}>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${university.status === "active"
                            ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                            : "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20"
                            }`}
                        >
                          {university.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const newStatus =
                            university.status === "active" ? "deactive" : "active";
                          try {
                            const res = await fetch(
                              `/api/universities/${university.id}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus }),
                              }
                            );
                            if (!res.ok) throw new Error("Failed to update");
                            toast.success(
                              `University ${newStatus === "active" ? "activated" : "deactivated"
                              } successfully`
                            );
                            refetchUniversities();
                          } catch (error) {
                            toast.error("Failed to update university status");
                          }
                        }}
                        className={
                          university.status === "active"
                            ? "text-destructive hover:bg-destructive/10"
                            : "text-primary hover:bg-primary/10"
                        }
                      >
                        {university.status === "active" ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
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
