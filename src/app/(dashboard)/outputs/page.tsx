"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOutputs } from "@/hooks/use-outputs";
import { OutputTable } from "../_components/output-table";
import { CapaianOutput } from "@/types/dashboard";

const pageSizeOptions = [10, 20, 50];

export default function OutputsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const {
    data: outputsResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useOutputs({
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
    () => (outputsResponse?.data ?? []) as CapaianOutput[],
    [outputsResponse]
  );

  const totalPages = outputsResponse?.totalPages ?? 1;
  const conditionOptions = useMemo(() => {
    const values = (outputsResponse?.data ?? [])
      .map((item) => item.business_condition as string | null)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).toSorted();
  }, [outputsResponse]);
  const verifiedOptions = useMemo(() => {
    const values = (outputsResponse?.data ?? [])
      .map((item) => item.isverified as string | null)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).toSorted();
  }, [outputsResponse]);
  const dateOptions = useMemo(() => {
    const values = (outputsResponse?.data ?? [])
      .map((item) => (item.updated_at ?? item.created_at) as string | null)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).toSorted();
  }, [outputsResponse]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Capaian Output
        </p>
        <h1 className="text-3xl font-semibold text-slate-950 lg:text-4xl">
          Rekap capaian output
        </h1>
        <p className="text-base text-muted-foreground">
          Data capaian output pendamping dengan filter dan pencarian.
        </p>
      </div>

      <Card className="backdrop-blur">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Capaian output list</CardTitle>
            <CardDescription>Filter dan urutkan capaian output.</CardDescription>
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

          <OutputTable
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
