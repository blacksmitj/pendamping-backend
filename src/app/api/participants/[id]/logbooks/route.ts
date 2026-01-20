import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid participant ID" },
                { status: 400 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const month = searchParams.get("month");
        const verified = searchParams.get("verified");
        const sortBy = searchParams.get("sortBy") || "logbookDate";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Build where clause
        const where: any = {
            id_tkm: id,
        };

        if (month) {
            where.month_report = parseInt(month);
        }

        if (verified) {
            where.verified = verified;
        }

        // Get total count
        const totalItems = await prisma.logbookHarian.count({ where });

        // Fetch logbooks with pagination
        const logbooks = await prisma.logbookHarian.findMany({
            where,
            include: {
                pendamping: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder as "asc" | "desc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        // Format response
        const data = logbooks.map((logbook) => ({
            id: logbook.id,
            logbookDate: logbook.logbookDate,
            activitySummary: logbook.activitySummary,
            deliveryMethod: logbook.deliveryMethod,
            visitType: logbook.visitType,
            meetingType: logbook.meetingType,
            mentoringMaterial: logbook.mentoringMaterial,
            obstacle: logbook.obstacle,
            solutions: logbook.solutions,
            jpl: logbook.jpl,
            startTime: logbook.startTime,
            endTime: logbook.endTime,
            totalExpense: logbook.totalExpense,
            reasonNoExpense: logbook.reasonNoExpense,
            verified: logbook.verified,
            note_verified: logbook.note_verified,
            month_report: logbook.month_report,
            groupID: logbook.groupID,
            documentationFiles: logbook.documentationFiles
                ? logbook.documentationFiles.split(",").filter(Boolean)
                : [],
            expenseProofFile: logbook.expenseProofFile,
            pendamping: logbook.pendamping
                ? {
                    id: logbook.pendamping.id,
                    name: logbook.pendamping.name,
                    email: logbook.pendamping.email,
                }
                : null,
            created_at: logbook.created_at,
            updated_at: logbook.updated_at,
        }));

        const totalPages = Math.ceil(totalItems / pageSize);

        return NextResponse.json({
            data,
            pagination: {
                page,
                pageSize,
                totalPages,
                totalItems,
            },
        });
    } catch (error) {
        console.error("Error fetching participant logbooks:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
