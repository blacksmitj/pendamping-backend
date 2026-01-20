"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLogbooks } from "@/hooks/use-logbooks";
import { LogbookTable } from "../_components/logbook-table";
import { LogbookEntry } from "@/types/dashboard";

const pageSizeOptions = [10, 20, 50];

export default function LogbooksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterDate, setFilterDate] = useState("");

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
    filterCondition,
    filterVerified,
    filterDate,
  });

  const entries = useMemo(
    () => (logbookResponse?.data ?? []) as LogbookEntry[],
    [logbookResponse]
  );

  const totalPages = logbookResponse?.totalPages ?? 1;
  const conditionOptions = useMemo(() => {
    const values = (logbookResponse?.data ?? [])
      .map((item) => item.business_condition as string | null)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).toSorted();
  }, [logbookResponse]);

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Logbooks
        </p>
        <h1 className="text-3xl font-semibold text-slate-950 lg:text-4xl">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-52">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort: Tanggal</SelectItem>
                <SelectItem value="verified">Sort: Status</SelectItem>
                <SelectItem value="pendamping">Sort: Pendamping</SelectItem>
                <SelectItem value="condition">Sort: Kondisi</SelectItem>
                <SelectItem value="id_tkm">Sort: ID TKM</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterCondition}
              onValueChange={(value) => {
                setFilterCondition(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-52">
                <SelectValue placeholder="Filter kondisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua kondisi</SelectItem>
                {conditionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterVerified}
              onValueChange={(value) => {
                setFilterVerified(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-44">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua status</SelectItem>
                {verifiedOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePicker
              value={filterDate}
              onChange={(value) => {
                setFilterDate(value);
                setPage(1);
              }}
              className="w-full sm:w-44"
              placeholder="Filter tanggal"
            />
            <Select
              value={sortOrder}
              onValueChange={(value) =>
                setSortOrder(value as "asc" | "desc")
              }
            >
              <SelectTrigger className="h-10 w-full sm:w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
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
