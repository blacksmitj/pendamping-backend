"use client";

import { useMemo } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PaginationControls, TableSkeleton, formatDate } from "./dashboard-ui";
import { LogbookEntry } from "@/types/dashboard";

type LogbookTableProps = {
  entries: LogbookEntry[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  page: number;
  totalPages: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
};

function formatTime(value?: string | null) {
  if (!value) return "Not set";
  try {
    const date = new Date(`1970-01-01T${value}`);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

export function LogbookTable({
  entries,
  isLoading,
  isError,
  isFetching,
  page,
  totalPages,
  searchValue,
  onSearchChange,
  onPageChange,
  onRefresh,
}: LogbookTableProps) {
  const getStatusVariant = useMemo(
    () => (value?: string | null) => {
      const normalized = (value ?? "").toLowerCase();
      if (["approved", "success", "true", "t", "verified", "done"].includes(normalized)) {
        return "success";
      }
      if (["pending", "inreview", "review", "waiting"].includes(normalized)) {
        return "warning";
      }
      if (["rejected", "failed", "false", "f", "deny", "denied"].includes(normalized)) {
        return "destructive";
      }
      return "secondary";
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Cari nama TKM, pendamping, universitas, atau aktivitas"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="sm:w-96"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin text-primary" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TKM</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Pendamping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-destructive">
                  Gagal memuat logbook. Coba refresh.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data logbook.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={`${entry.id}-${entry.id_pendamping}-${entry.id_tkm}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="max-w-[220px] truncate font-medium">
                          {entry.tkmName ?? "Tanpa nama"}
                        </span>
                        <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                          {entry.id_tkm}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="max-w-[260px] truncate font-medium">
                        {entry.activitySummary ?? "Tidak ada ringkasan"}
                      </span>
                      <span className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {entry.mentoringMaterial ?? entry.obstacle ?? ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary/80" />
                      {formatDate(entry.logbookDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(entry.verified)}>
                      {entry.verified ?? "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="max-w-[220px] truncate">{entry.pendampingName ?? "-"}</span>
                      <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {entry.pendampingUniversity ?? "Tidak ada universitas"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isLoading={isFetching}
      />
    </div>
  );
}
