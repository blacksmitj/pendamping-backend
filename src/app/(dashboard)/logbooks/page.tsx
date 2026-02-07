"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLogbooks } from "@/hooks/use-logbooks";
import { LogbookTable } from "../_components/logbook-table";
import { LogbookEntry } from "@/types/dashboard";
import { FilterSortDrawer } from "@/components/logbooks/filter-sort-drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

const pageSizeOptions = [10, 20, 50];

export default function LogbooksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy] = usePersistentState("logbooks-sortBy", "date");
  const [sortOrder, setSortOrder] = usePersistentState<"asc" | "desc">("logbooks-sortOrder", "desc");

  const [filterVerified, setFilterVerified] = usePersistentState("logbooks-filterVerified", "");
  const [filterDate, setFilterDate] = usePersistentState("logbooks-filterDate", "");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const activeFilterCount = [
    filterVerified !== "",
    filterDate !== "",
  ].filter(Boolean).length;

  const {
    data: logbookResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useLogbooks({
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,

    filterVerified,
    filterDate,
  });

  const entries = useMemo(
    () => (logbookResponse?.data ?? []) as LogbookEntry[],
    [logbookResponse]
  );

  const totalPages = logbookResponse?.totalPages ?? 1;


  const verifiedOptions = useMemo(() => {
    const values = (logbookResponse?.data ?? [])
      .map((item) => item.verified as string | null)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).toSorted();
  }, [logbookResponse]);

  const dateOptions = useMemo(() => {
    const values = (logbookResponse?.data ?? [])
      .map((item) => item.logbookDate as string | null)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).toSorted();
  }, [logbookResponse]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleResetFilters = () => {
    setFilterVerified("");
    setFilterDate("");
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Logbooks
        </p>
        <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">
          Logbook harian
        </h1>
        <p className="text-base text-muted-foreground">
          Catatan aktivitas pendamping, dapat diurutkan dan difilter.
        </p>
      </div>

      <Card className="backdrop-blur">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Logbook list</CardTitle>
            <CardDescription>
              Filter dan urutkan logbook harian.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            </div>
          </div>

          <FilterSortDrawer
            open={isFilterDrawerOpen}
            onOpenChange={setIsFilterDrawerOpen}
            filterVerified={filterVerified}
            filterDate={filterDate}
            onVerifiedChange={setFilterVerified}
            onDateChange={setFilterDate}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            verifiedOptions={verifiedOptions}
            onReset={handleResetFilters}
          />

          <LogbookTable
            entries={entries}
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            page={page}
            totalPages={totalPages}
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onPageChange={setPage}
            onRefresh={() => refetch()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
