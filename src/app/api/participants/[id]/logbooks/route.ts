import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = String(idParam); // legacy_tkm_id

        // Find participant first
        const participant = await prisma.participants.findFirst({
            where: { legacy_tkm_id: id },
            include: { profiles: true }
        });

        if (!participant) {
             return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const month = searchParams.get("month");
        const verified = searchParams.get("verified");
        // Update valid sort keys
        const sortByParam = searchParams.get("sortBy") || "logbookDate";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const sortByMap: Record<string, string> = {
            logbookDate: 'activity_date',
            created_at: 'created_at',
            verified: 'is_verified'
        };
        const sortBy = sortByMap[sortByParam] || 'activity_date';

        // Build where clause
        const where: any = {
            participant_id: participant.id,
        };

        if (month) {
            // New schema doesn't have month_report directly on logbooks?
            // Actually it doesn't seem to. It has activity_date. We might filter by date range if needed.
            // Or assume month param is just ignored for now or implement month extraction filter.
        }

        if (verified) {
            where.is_verified = verified;
        }

        // Get total count
        const totalItems = await prisma.logbooks.count({ where });

        // Fetch logbooks with pagination
        const logbooks = await prisma.logbooks.findMany({
            where,
            include: {
                mentors: {
                    include: {
                        users: {
                            include: {
                                profiles: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder as "asc" | "desc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        // Format response
        const data = logbooks.map((logbook) => {
            const mentorUser = logbook.mentors?.users;
            const mentorProfile = (mentorUser as any)?.profiles;
            
            return {
                id: logbook.id,
                id_tkm: participant.legacy_tkm_id,
                id_pendamping: logbook.mentor_id,
                logbookDate: logbook.activity_date,
                activitySummary: logbook.activity_summary || "",
                deliveryMethod: logbook.delivery_method || "",
                visitType: logbook.visit_type || "",
                meetingType: logbook.meeting_type || "",
                mentoringMaterial: logbook.mentoring_material || "",
                obstacle: logbook.obstacles || "",
                solutions: logbook.solutions || "",
                startTime: logbook.start_time,
                endTime: logbook.end_time,
                totalExpense: Number(logbook.expense_amount || 0),
                reasonNoExpense: logbook.no_expense_reason || "",
                verified: logbook.is_verified,
                note_verified: logbook.verification_note,
                month_report: 0, 
                groupID: null,
                documentationFiles: [], 
                expenseProofFile: null,
                pendamping: logbook.mentors
                    ? {
                        id: logbook.mentors.id,
                        name: mentorProfile?.full_name || mentorUser?.username || "Unknown",
                        email: mentorUser?.email,
                        photo: mentorProfile?.avatar_url || null,
                    }
                    : null,
                pendampingName: mentorProfile?.full_name || mentorUser?.username || "Unknown",
                pendampingPhoto: mentorProfile?.avatar_url || null,
                pendampingUniversity: "",
                tkmName: participant.profiles?.full_name || "Participant",
                created_at: logbook.created_at,
                updated_at: logbook.updated_at,
            };
        });

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
