import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        take: 50,
        orderBy: { id: "desc" },
        select: {
          id: true,
          univ_id: true,
          jenis_kelamin: true,
          no_wa: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.profile.count(),
    ]);

    const universityIds = profiles
      .map((profile) => profile.univ_id)
      .filter((value): value is number => Boolean(value));

    const universities = universityIds.length
      ? await prisma.university.findMany({
          where: { id: { in: universityIds } },
          select: { id: true, name: true, city: true, province: true },
        })
      : [];

    const universityMap = new Map(
      universities.map((university) => [university.id, university])
    );

    const data = profiles.map((profile) => ({
      id: profile.id,
      name: profile.user.name,
      email: profile.user.email ?? "",
      phone: profile.no_wa ?? "",
      gender: profile.jenis_kelamin ?? "",
      university: profile.univ_id
        ? universityMap.get(profile.univ_id) ?? null
        : null,
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("[mentors] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}
