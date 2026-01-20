
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serialize(data: any): any {
    if (data === undefined) return null;
    return JSON.parse(
        JSON.stringify(data, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

export async function GET() {
    try {
        const targetId = 489062;

        const p = await prisma.peserta.findUnique({
            where: { id_tkm: targetId },
            include: {
                userPesertas: {
                    include: {
                        admin: {
                            include: {
                                profiles: {
                                    include: { university: true }
                                },
                                model_has_roles: {
                                    include: { role: true }
                                }
                            }
                        }
                    }
                },
                user: { // Relation "PesertaPendaftar"
                    include: {
                        profiles: {
                            include: { university: true }
                        }
                    }
                }
            }
        });

        if (!p) return NextResponse.json({ error: "Participant not found" });

        return NextResponse.json({
            id_tkm: p.id_tkm,
            nama: p.nama,
            id_pendaftar: serialize(p.id_pendaftar),
            pendaftarUser: serialize(p.user),
            userPesertasCount: p.userPesertas.length,
            rawUserPesertas: serialize(p.userPesertas)
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
