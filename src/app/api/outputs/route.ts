import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 10)
    );
    const search = (searchParams.get("search") ?? "").trim();
    const sortBy = searchParams.get("sortBy") ?? "month_report";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * pageSize;

    const filterCondition = searchParams.get("condition") ?? "";
    const filterVerified = searchParams.get("verified") ?? "";
    const filterDate = searchParams.get("date") ?? "";

    const orderBy: Prisma.CapaianOutputOrderByWithRelationInput =
      sortBy === "verified"
        ? { isverified: sortOrder as Prisma.SortOrder }
        : sortBy === "pendamping"
          ? { id_pendamping: sortOrder as Prisma.SortOrder }
          : sortBy === "id_tkm"
            ? { id_tkm: sortOrder as Prisma.SortOrder }
            : sortBy === "condition"
              ? { business_condition: sortOrder as Prisma.SortOrder }
              : { updated_at: sortOrder as Prisma.SortOrder };

    let pendampingIdsFromSearch: bigint[] = [];
    let tkmIdsFromSearch: number[] = [];

    if (search) {
      const [pendampingUsers, pesertaMatches, universities] = await Promise.all([
        prisma.user.findMany({
          where: { name: { contains: search } },
          select: { id: true },
        }),
        prisma.peserta.findMany({
          where: { nama: { contains: search } },
          select: { id_tkm: true },
        }),
        prisma.university.findMany({
          where: { name: { contains: search } },
          select: { id: true },
        }),
      ]);

      pendampingIdsFromSearch = pendampingUsers.map((u) => u.id);
      tkmIdsFromSearch = pesertaMatches
        .map((p) => p.id_tkm)
        .filter((id): id is number => Number.isFinite(id));

      if (universities.length) {
        const profiles = await prisma.profile.findMany({
          where: { univ_id: { in: universities.map((u) => u.id) } },
          select: { user_id: true },
        });
        pendampingIdsFromSearch.push(
          ...profiles.map((p) => p.user_id).filter((id): id is bigint => typeof id === "bigint")
        );
      }
    }

    const dateRange =
      filterDate && !Number.isNaN(Date.parse(filterDate))
        ? {
          gte: new Date(filterDate),
          lt: new Date(new Date(filterDate).getTime() + 24 * 60 * 60 * 1000),
        }
        : undefined;

    const searchNumber = Number(search);
    const hasSearchNumber = Number.isFinite(searchNumber);

    const where = {
      ...(search
        ? {
          OR: [
            ...(hasSearchNumber ? [{ id_tkm: searchNumber }] : []),
            { id_pendamping: { in: pendampingIdsFromSearch } },
            { id_tkm: { in: tkmIdsFromSearch } },
            { obstacle: { contains: search } },
            { business_condition: { contains: search } },
          ],
        }
        : undefined),
      ...(filterCondition ? { business_condition: filterCondition } : undefined),
      ...(filterVerified ? { isverified: filterVerified } : undefined),
      ...(dateRange ? { updated_at: dateRange } : undefined),
    } as const;

    const outputs = await prisma.capaianOutput.findMany({
      take: pageSize,
      skip,
      orderBy,
      where,
      select: {
        id: true,
        id_pendamping: true,
        id_tkm: true,
        month_report: true,
        bookkeeping_cashflow: true,
        bookkeeping_income_statement: true,
        cashflow_proof_url: true,
        income_proof_url: true,
        sales_volume: true,
        sales_volume_unit: true,
        production_capacity: true,
        production_capacity_unit: true,
        marketing_area: true,
        revenue: true,
        obstacle: true,
        business_condition: true,
        created_at: true,
        updated_at: true,
        isverified: true,
      },
    });

    const pendampingIds = Array.from(
      new Set(outputs.map((item) => item.id_pendamping).filter((id): id is bigint => typeof id === "bigint"))
    );

    const tkmIds = Array.from(
      new Set(outputs.map((item) => item.id_tkm).filter((id) => Number.isFinite(id)))
    );

    const [pendampingProfiles, peserta] = await Promise.all([
      pendampingIds.length
        ? prisma.profile.findMany({
          where: { user_id: { in: pendampingIds } },
          select: {
            user_id: true,
            univ_id: true,
            user: { select: { name: true } },
          },
        })
        : [],
      tkmIds.length
        ? prisma.peserta.findMany({
          where: { id_tkm: { in: tkmIds } },
          select: { id_tkm: true, nama: true },
        })
        : [],
    ]);

    const universityIds = Array.from(
      new Set(
        pendampingProfiles
          .map((p) => p.univ_id)
          .filter((id): id is number => Number.isFinite(id))
      )
    );

    const universities = universityIds.length
      ? await prisma.university.findMany({
        where: { id: { in: universityIds } },
        select: { id: true, name: true },
      })
      : [];

    const pendampingMap = new Map(
      pendampingProfiles.map((profile) => [
        profile.user_id,
        { name: profile.user?.name ?? null, univ_id: profile.univ_id ?? null },
      ])
    );

    const pesertaMap = new Map(
      peserta.map((item) => [item.id_tkm, item.nama ?? null])
    );

    const universityMap = new Map(universities.map((u) => [u.id, u.name]));

    const data = outputs.map((item) => {
      const pendampingId =
        item.id_pendamping !== null ? Number(item.id_pendamping) : null;
      const pendamping = item.id_pendamping
        ? pendampingMap.get(item.id_pendamping) ?? null
        : null;
      const pendampingUniversity =
        pendamping?.univ_id && universityMap.get(pendamping.univ_id)
          ? universityMap.get(pendamping.univ_id)!
          : null;

      return {
        ...item,
        id_pendamping: pendampingId,
        pendampingName: pendamping?.name ?? null,
        pendampingUniversity,
        tkmName: pesertaMap.get(item.id_tkm) ?? null,
      };
    });

    const total = await prisma.capaianOutput.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[outputs] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch capaian output" },
      { status: 500 }
    );
  }
}
