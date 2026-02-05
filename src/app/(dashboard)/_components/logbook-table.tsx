"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, RefreshCw, Users } from "lucide-react";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
              <TableHead>Pelapor</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-destructive">
                  Gagal memuat logbook. Coba refresh.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableSkeleton rows={6} columns={5} />
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data logbook.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={`${entry.id}-${entry.id_pendamping}-${entry.id_tkm}`}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => window.location.href = `/logbooks/${entry.id}`}
                >
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={entry.pendampingPhoto || ""} alt={entry.pendampingName || ""} />
                        <AvatarFallback className="bg-primary/5 text-[10px] text-primary">
                          {(entry.pendampingName || "P").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="max-w-[180px] truncate font-medium text-foreground">{entry.pendampingName ?? "-"}</span>
                        <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                          {entry.pendampingUniversity ?? "Tidak ada universitas"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {!entry.isGroup && (
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarImage src={entry.tkmPhoto || ""} alt={entry.tkmName || ""} />
                          <AvatarFallback className="bg-primary/5 text-[10px] text-primary">
                            {(entry.tkmName || "T").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="max-w-[180px] truncate font-medium">
                            {entry.tkmName ?? "Tanpa nama"}
                          </span>
                          {entry.isGroup && (
                            <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                              <Users className="mr-0.5 h-2 w-2" />
                              Group
                            </Badge>
                          )}
                        </div>
                        <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                          {entry.isGroup ? `${entry.attendeeCount} Peserta` : entry.id_tkm}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[240px] truncate font-medium">
                          {entry.activitySummary ?? "Tidak ada ringkasan"}
                        </span>
                        {entry.visitType && (
                          <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal uppercase tracking-wider">
                            {entry.visitType}
                          </Badge>
                        )}
                      </div>
                      <span className="max-w-[240px] truncate text-xs text-muted-foreground">
                        {entry.mentoringMaterial ?? entry.obstacle ?? ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <CalendarClock className="h-4 w-4 text-primary/80" />
                      {formatDate(entry.logbookDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(entry.verified)}>
                      {entry.verified ?? "pending"}
                    </Badge>
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
