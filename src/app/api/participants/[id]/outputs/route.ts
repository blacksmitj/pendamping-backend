import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = String(idParam); // legacy_tkm_id

        // Find participant first to get UUID
        const participant = await prisma.participants.findFirst({
            where: { legacy_tkm_id: id },
            include: {
                businesses: {
                    include: {
                        business_employees: {
                            where: { is_active: true }
                        }
                    }
                }
            }
        });

        if (!participant) {
            return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            );
        }

        // Fetch all outputs for this participant
        const outputs = await prisma.monthly_reports.findMany({
            where: {
                participant_id: participant.id,
            },
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
            orderBy: [
                { report_year: 'asc' },
                { report_month: 'asc' }
            ],
        });

        // Employees are now at business level, not report level. 
        // We will attach all active business employees to every report for now, 
        // or just return them if the UI can handle it.
        // To maintain backward compat, we'll map business_employees to the expected structure
        // for each output, effectively showing the current employee list.
        const businessEmployees = participant.businesses[0]?.business_employees || [];

        // Format response
        const formattedOutputs = outputs.map((output) => {
            const mentorUser = output.mentors?.users;
            const mentorProfile = (mentorUser as any)?.profiles;
            
            return {
                id: output.id,
                id_tkm: participant.legacy_tkm_id,
                id_pendamping: output.mentor_id,
                month_report: output.report_month, 

                // Financial Records
                bookkeeping_cashflow: output.bookkeeping_cashflow ? "T" : "F",
                bookkeeping_income_statement: output.bookkeeping_income_statement ? "T" : "F", 
                cashflow_proof_url: null, 
                income_proof_url: null,

                // Business Metrics
                sales_volume: output.sales_volume ? Number(output.sales_volume) : 0,
                sales_volume_unit: output.sales_unit,
                production_capacity: output.production_capacity ? Number(output.production_capacity) : 0,
                production_capacity_unit: output.production_unit,
                revenue: output.revenue ? Number(output.revenue) : 0,
                marketing_area: output.marketing_area,

                // Conditions
                obstacle: output.obstacles,
                business_condition: output.business_condition,

                // Verification
                isverified: output.is_verified,
                note_verified: output.verification_note,
                note_confirmation: output.note_confirmation,

                // LPJ
                lpj: output.lpj_status ? "T" : "F",

                // Timestamps
                created_at: output.created_at,
                updated_at: output.updated_at,

                // Mentor
                pendamping: output.mentors
                    ? {
                        id: output.mentors.id,
                        name: mentorProfile?.full_name || mentorUser?.username || "Unknown",
                        email: mentorUser?.email,
                        photo: mentorProfile?.avatar_url || null,
                    }
                    : null,

                // New Employees - Using current business employees as fallback
                newEmployees: businessEmployees.map((emp) => ({
                    id: emp.id,
                    name: emp.name,
                    nik: emp.nik,
                    role: emp.role,
                    employment_status: emp.employment_status,
                    gender: emp.gender,
                    disability: emp.disability ? true : false,
                    disabilityType: emp.disability_type,
                    bpjs_status: emp.bpjs_status,
                    bpjs_number: emp.bpjs_number,
                    bpjs_type: emp.bpjs_type,
                    bpjs_card_url: null, 
                    ktp_url: null,
                    salary_slip_url: null,
                })),
            };
        });

        // Calculate summary statistics
        const totalMonthsReported = outputs.length;
        const revenueValues = outputs
            .filter((o) => o.revenue !== null)
            .map((o) => Number(o.revenue));
        const averageRevenue =
            revenueValues.length > 0
                ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
                : 0;
                
        // Total new employees might be static now
        const totalNewEmployees = businessEmployees.length;

        return NextResponse.json({
            outputs: formattedOutputs,
            summary: {
                totalMonthsReported,
                averageRevenue: Math.round(averageRevenue),
                totalNewEmployees,
            },
        });
    } catch (error) {
        console.error("Error fetching participant outputs:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
