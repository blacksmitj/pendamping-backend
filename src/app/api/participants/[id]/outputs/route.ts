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

        // Fetch all outputs for this participant
        const outputs = await prisma.capaianOutput.findMany({
            where: {
                id_tkm: id,
            },
            include: {
                tkm_new_employee: {
                    where: {
                        isaktif: "T",
                    },
                },
                pendamping: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                month_report: "asc",
            },
        });

        // Format response
        const formattedOutputs = outputs.map((output) => ({
            id: output.id,
            month_report: output.month_report,

            // Financial Records
            bookkeeping_cashflow: output.bookkeeping_cashflow,
            bookkeeping_income_statement: output.bookkeeping_income_statement,
            cashflow_proof_url: output.cashflow_proof_url,
            income_proof_url: output.income_proof_url,

            // Business Metrics
            sales_volume: output.sales_volume ? Number(output.sales_volume) : 0,
            sales_volume_unit: output.sales_volume_unit,
            production_capacity: output.production_capacity ? Number(output.production_capacity) : 0,
            production_capacity_unit: output.production_capacity_unit,
            revenue: output.revenue ? Number(output.revenue) : 0,
            marketing_area: output.marketing_area,

            // Conditions
            obstacle: output.obstacle,
            business_condition: output.business_condition,

            // Verification
            isverified: output.isverified,
            note_verified: output.note_verified,
            note_confirmation: output.note_confirmation,

            // LPJ
            lpj: output.lpj,

            // Timestamps
            created_at: output.created_at,
            updated_at: output.updated_at,

            // Mentor
            pendamping: output.pendamping
                ? {
                    id: output.pendamping.id.toString(),
                    name: output.pendamping.name,
                    email: output.pendamping.email,
                }
                : null,

            // New Employees
            newEmployees: output.tkm_new_employee.map((emp) => ({
                id: emp.id.toString(),
                name: emp.name,
                nik: emp.nik,
                role: emp.role,
                employment_status: emp.employment_status,
                gender: emp.gender,
                disability: emp.disability === "T",
                disabilityType: emp.disabilityType,
                bpjs_status: emp.bpjs_status,
                bpjs_number: emp.bpjs_number,
                bpjs_type: emp.bpjs_type,
                bpjs_card_url: emp.bpjs_card_url,
                ktp_url: emp.ktp_url,
                salary_slip_url: emp.salary_slip_url,
            })),
        }));

        // Calculate summary statistics
        const totalMonthsReported = outputs.length;
        const revenueValues = outputs
            .filter((o) => o.revenue !== null)
            .map((o) => Number(o.revenue));
        const averageRevenue =
            revenueValues.length > 0
                ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
                : 0;
        const totalNewEmployees = outputs.reduce(
            (sum, o) => sum + o.tkm_new_employee.length,
            0
        );

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
