import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function statusVariant(status?: string | null) {
  if (!status) return "secondary";
  const normalized = status.toLowerCase();
  if (normalized.includes("aktif") || normalized.includes("active")) {
    return "success";
  }
  if (normalized.includes("pending")) return "warning";
  if (normalized.includes("drop") || normalized.includes("non")) {
    return "destructive";
  }
  return "secondary";
}

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  hint: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/80 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-3xl font-semibold text-slate-950">{value}</div>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DataCard({
  title,
  description,
  isLoading,
  isError,
  emptyCopy,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  columns,
  headerActions,
  children,
}: {
  title: string;
  description: string;
  isLoading: boolean;
  isError: boolean;
  emptyCopy: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  columns: string[];
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="h-full backdrop-blur">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="sm:w-72"
          />
          {headerActions}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-destructive"
                >
                  Failed to load data. Please refresh.
                </TableCell>
              </TableRow>
            ) : !isLoading && !children ? (
              <EmptyRow message={emptyCopy} colSpan={columns.length} />
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  isLoading,
}: {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={isLoading || page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function EmptyRow({
  message,
  colSpan = 4,
}: {
  message: string;
  colSpan?: number;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-8 text-center text-sm text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}
