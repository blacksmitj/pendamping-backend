"use client";

import { Badge } from "@/components/ui/badge";
import { PaginationControls, TableSkeleton, formatDate } from "./dashboard-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CapaianOutput } from "@/types/dashboard";
import { RefreshCw } from "lucide-react";

type OutputTableProps = {
  entries: CapaianOutput[];
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

function formatRupiah(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OutputTable({
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
}: OutputTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Cari nama TKM, pendamping, universitas, atau kendala"
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
              <TableHead>Pendamping</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Verified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-destructive">
                  Gagal memuat capaian output. Coba refresh.
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
                  Tidak ada data capaian output.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={`${entry.id}-${entry.id_tkm}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="max-w-[220px] truncate font-medium">
                        {entry.tkmName ?? "Tanpa nama"}
                      </span>
                      <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {entry.id_tkm}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="max-w-[220px] truncate">
                        {entry.pendampingName ?? "-"}
                      </span>
                      <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {entry.id_pendamping ?? "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(entry.updated_at ?? entry.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRupiah(entry.revenue)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="max-w-[260px] truncate">
                        {entry.business_condition ?? "-"}
                      </span>
                      <span className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {entry.obstacle ?? ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(() => {
                        const normalized = (entry.isverified ?? "").toLowerCase();
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
                      })()}
                    >
                      {entry.isverified ?? "pending"}
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
