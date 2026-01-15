"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  GraduationCap,
  RefreshCw,
  Users,
  Phone,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useMentors } from "@/hooks/use-mentors";
import { useParticipants } from "@/hooks/use-participants";
import { useUniversities } from "@/hooks/use-universities";
import { Mentor, Participant, University } from "@/types/dashboard";

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function statusVariant(status?: string | null) {
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

export default function Home() {
  const {
    data: participantsResponse,
    isLoading: participantsLoading,
    isError: participantsError,
    refetch: refetchParticipants,
    isFetching: participantsFetching,
  } = useParticipants();

  const {
    data: mentorsResponse,
    isLoading: mentorsLoading,
    isError: mentorsError,
    refetch: refetchMentors,
    isFetching: mentorsFetching,
  } = useMentors();

  const {
    data: universitiesResponse,
    isLoading: universitiesLoading,
    isError: universitiesError,
    refetch: refetchUniversities,
    isFetching: universitiesFetching,
  } = useUniversities();

  const [participantSearch, setParticipantSearch] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");

  const participants = useMemo(
    () => participantsResponse?.data ?? [],
    [participantsResponse]
  );
  const mentors = useMemo(
    () => mentorsResponse?.data ?? [],
    [mentorsResponse]
  );
  const universities = useMemo(
    () => universitiesResponse?.data ?? [],
    [universitiesResponse]
  );

  const filteredParticipants = useMemo(() => {
    if (!participantSearch) return participants;
    const query = participantSearch.toLowerCase();
    return participants.filter(
      (participant) =>
        (participant.nama ?? "").toLowerCase().includes(query) ||
        (participant.nama_usaha ?? "").toLowerCase().includes(query) ||
        (participant.kota_domisili ?? "").toLowerCase().includes(query)
    );
  }, [participants, participantSearch]);

  const filteredMentors = useMemo(() => {
    if (!mentorSearch) return mentors;
    const query = mentorSearch.toLowerCase();
    return mentors.filter(
      (mentor) =>
        mentor.name.toLowerCase().includes(query) ||
        (mentor.email ?? "").toLowerCase().includes(query) ||
        (mentor.university?.name ?? "").toLowerCase().includes(query)
    );
  }, [mentors, mentorSearch]);

  const filteredUniversities = useMemo(() => {
    if (!universitySearch) return universities;
    const query = universitySearch.toLowerCase();
    return universities.filter(
      (university) =>
        university.name.toLowerCase().includes(query) ||
        (university.city ?? "").toLowerCase().includes(query) ||
        (university.province ?? "").toLowerCase().includes(query)
    );
  }, [universities, universitySearch]);

  const totalParticipants = participantsResponse?.total ?? 0;
  const totalMentors = mentorsResponse?.total ?? 0;
  const totalUniversities = universitiesResponse?.total ?? 0;

  const isRefreshing =
    participantsFetching || mentorsFetching || universitiesFetching;

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchParticipants(),
      refetchMentors(),
      refetchUniversities(),
    ]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.08),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl space-y-10 px-6 py-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">App Router</Badge>
              <Badge variant="outline">Prisma live data</Badge>
              <Badge variant="outline">TanStack Query</Badge>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-semibold leading-tight text-slate-950 lg:text-4xl">
                Participants, Mentors, and Universities in one glance
              </h1>
              <p className="mt-2 max-w-3xl text-base text-muted-foreground">
                Pulled directly from your Prisma schema, filtered on the client
                with TanStack Query, and styled with shadcn-inspired components.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin text-primary" : ""
                }`}
              />
              Refresh data
            </Button>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Participants"
            value={participantsLoading ? "..." : totalParticipants.toString()}
            icon={<Users className="h-5 w-5 text-primary" />}
            hint="Latest 50 sign-ups"
          />
          <StatCard
            label="Mentors"
            value={mentorsLoading ? "..." : totalMentors.toString()}
            icon={<Phone className="h-5 w-5 text-emerald-600" />}
            hint="Profiles with user links"
          />
          <StatCard
            label="Universities"
            value={universitiesLoading ? "..." : totalUniversities.toString()}
            icon={<GraduationCap className="h-5 w-5 text-sky-600" />}
            hint="Active partner campuses"
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <DataCard
            title="Participant list"
            description="Business owners enrolled in the program"
            isLoading={participantsLoading}
            isError={participantsError}
            emptyCopy="No participants match your search."
            searchPlaceholder="Search by name, business, or city"
            searchValue={participantSearch}
            onSearchChange={setParticipantSearch}
            columns={[
              "Name & business",
              "Location",
              "Status",
              "Registered",
            ]}
          >
            {participantsLoading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant: Participant) => (
                <TableRow key={participant.no}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {participant.nama ?? "No name"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {participant.nama_usaha ?? "No business name"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[participant.kota_domisili, participant.provinsi_domisili]
                      .filter(Boolean)
                      .join(", ") || "Not set"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(participant.status)}>
                      {participant.status ?? "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary/80" />
                      {formatDate(participant.tanggal_daftar)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : null}
          </DataCard>

          <DataCard
            title="Mentor list"
            description="Profiles linked to users and universities"
            isLoading={mentorsLoading}
            isError={mentorsError}
            emptyCopy="No mentors match your search."
            searchPlaceholder="Search by mentor, email, or university"
            searchValue={mentorSearch}
            onSearchChange={setMentorSearch}
            columns={["Mentor", "University", "Contact", "Gender"]}
          >
            {mentorsLoading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : filteredMentors.length > 0 ? (
              filteredMentors.map((mentor: Mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{mentor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {mentor.email || "No email"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4 text-sky-600" />
                      <div className="flex flex-col">
                        <span>{mentor.university?.name ?? "Not linked"}</span>
                        <span className="text-xs">
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
        </section>

        <section>
          <Card className="backdrop-blur">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>University list</CardTitle>
                <CardDescription>
                  Partner campuses connected to mentors and participants
                </CardDescription>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-80">
                <Input
                  placeholder="Search by name or region"
                  value={universitySearch}
                  onChange={(event) => setUniversitySearch(event.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universitiesLoading ? (
                    <TableSkeleton rows={6} columns={4} />
                  ) : filteredUniversities.length > 0 ? (
                    filteredUniversities.map((university: University) => (
                      <TableRow key={university.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            <Building2 className="h-4 w-4 text-primary" />
                            {university.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {university.city}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {university.province}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {university.alamat ?? "No address"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyRow message="No universities match your search." />
                  )}
                </TableBody>
              </Table>
              {universitiesError && (
                <p className="mt-4 text-sm text-destructive">
                  Failed to load universities. Please refresh.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
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

function DataCard({
  title,
  description,
  isLoading,
  isError,
  emptyCopy,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  columns,
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
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full backdrop-blur">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="sm:w-72"
        />
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

function TableSkeleton({ rows, columns }: { rows: number; columns: number }) {
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

function EmptyRow({
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
