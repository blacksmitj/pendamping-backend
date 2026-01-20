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
    const sortBy = searchParams.get("sortBy") ?? "id";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * pageSize;

    const orderBy: Prisma.ProfileOrderByWithRelationInput =
      sortBy === "name"
        ? { user: { name: sortOrder as Prisma.SortOrder } }
        : sortBy === "email"
        ? { user: { email: sortOrder as Prisma.SortOrder } }
        : { id: sortOrder as Prisma.SortOrder };

    const where = search
      ? {
          OR: [
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
            { no_wa: { contains: search } },
            { university: { is: { name: { contains: search } } } },
          ],
        }
      : undefined;

    const profileSelect = {
      id: true,
      univ_id: true,
      jenis_kelamin: true,
      no_wa: true,
      foto: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      university: {
        select: {
          id: true,
          name: true,
          city: { select: { city_name: true } },
          province: { select: { prov_name: true } },
        },
      },
    } as const satisfies Prisma.ProfileSelect;

    type ProfileWithUser = Prisma.ProfileGetPayload<{
      select: typeof profileSelect;
    }>;

    const profiles = (await prisma.profile.findMany({
      take: pageSize,
      skip,
      orderBy,
      where,
      select: profileSelect,
    })) as ProfileWithUser[];

    const total = await prisma.profile.count({ where });

    const data = profiles.map((profile) => ({
      id: profile.id,
      name: profile.user?.name ?? "Unknown",
      email: profile.user?.email ?? "",
      phone: profile.no_wa ?? "",
      gender: profile.jenis_kelamin ?? "",
      photo: profile.foto ?? null,
      university: profile.university
        ? {
            id: profile.university.id,
            name: profile.university.name,
            city: profile.university.city?.city_name ?? "",
            province: profile.university.province?.prov_name ?? "",
          }
        : null,
    }));

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[mentors] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}
