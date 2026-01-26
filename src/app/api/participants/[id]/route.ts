import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        // Legacy IDs were integers, but stored as strings in new DB 'legacy_tkm_id'
        const id = String(idParam);

        // Fetch participant with all related data
        const participant = await prisma.participants.findFirst({
            where: { legacy_tkm_id: id },
            include: {
                businesses: true,
                batches: true,
                participant_groups: true,
                profiles: {
                    include: {
                        users: true,
                        addresses: {
                            include: {
                                regencies: true,
                                provinces: true,
                                districts: true,
                                villages: true
                            }
                        }
                    }
                },
                emergency_contacts: true
            },
        });

        if (!participant) {
            return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            );
        }

        const profile = participant.profiles;
        const user = profile?.users;
        const business = participant.businesses[0] || null;
        
        // Address filtering
        const addresses = profile?.addresses || [];
        const ktpAddress = addresses.find(a => a.label?.toLowerCase().includes('ktp')) || addresses[0];
        const domAddress = addresses.find(a => a.label?.toLowerCase().includes('domisili')) || addresses[1] || addresses[0];

        // Format response
        const response = {
            participant: {
                // Basic Info
                id_tkm: participant.legacy_tkm_id,
                nama: profile?.full_name || user?.username || "Unknown",
                nik: profile?.id_number,
                status: participant.status,
                no_whatsapp: profile?.whatsapp_number,

                // Personal Data
                tempat_lahir: profile?.pob,
                tgl_lahir: profile?.dob,
                umur: null, // Need to calculate from dob?
                pendidikan_terakhir: participant.last_education,
                jenis_kelamin: profile?.gender,
                foto: profile?.avatar_url,
                penyandang_disabilitas: participant.disability_status,
                jenis_disabilitas: participant.disability_type,

                // Address Data - KTP
                alamat_ktp: ktpAddress?.address_line,
                provinsi_ktp: ktpAddress?.provinces?.name,
                kota_ktp: ktpAddress?.regencies?.name,
                kecamatan_ktp: ktpAddress?.districts?.name,
                kelurahan_ktp: ktpAddress?.villages?.name,
                kode_pos_ktp: ktpAddress?.postal_code,

                // Address Data - Domisili
                alamat_domisili_dan_alamat_ktp_sama: null, // Data not available directly
                alamat_domisili: domAddress?.address_line,
                provinsi_domisili: domAddress?.provinces?.name,
                kota_domisili: domAddress?.regencies?.name,
                kecamatan_domisili: domAddress?.districts?.name,
                kelurahan_domisili: domAddress?.villages?.name,
                kode_pos_domisili: domAddress?.postal_code,

                // Business Data
                nama_usaha: business?.name,
                sektor_usaha: business?.sector,
                jenis_usaha: business?.type,
                deskripsi_usaha: business?.description,
                produk_utama: business?.main_product,
                aktivitas_saat_ini: participant.current_activity,
                omset_per_periode: Number(business?.revenue_per_period),
                laba_per_periode: Number(business?.profit_per_period),
                jumlah_produk_per_periode: business?.production_volume,
                satuan_jumlah_produk_per_periode: business?.production_unit,
                saluran_pemasaran: business?.marketing_channels,
                wilayah_pemasaran: business?.marketing_areas,
                mitra_usaha: business?.partner_name,
                jumlah_mitra_usaha: business?.partner_count,

                // Business Location
                lokasi_usaha: null, // addr?
                kepemilikan_lokasi_usaha: business?.location_ownership,
                alamat_usaha_dan_alamat_domisili_sama: null,
                alamat_usaha: null, 
                provinsi_usaha: null,
                kota_usaha: null,
                kecamatan_usaha: null,
                kelurahan_usaha: null,
                kode_pos_usaha: null,

                // Legality
                nomor_nib: business?.nib_number,
                nomor_dokumen_nib: null,
                nama_usaha_dokumen_nib: null,
                nomor_dokumen_legalitas: null,
                nama_dokumen_legalitas: null,
                nomor_dokumen_sku: null,
                tanggal_dokumen_sku: null,

                // Status & Batch
                batch_pembekalan: participant.batches?.code,
                kelompok: participant.participant_groups?.name,
                tanggal_daftar: participant.created_at,
                tanggal_submit_pendaftaran: null,
                pleno: null,
                ptn_pts: null,

                // Contact
                jenis_medsos: null,
                nama_medsos: null,
                link_media_sosial: null,
                nama_kerabat_1: participant.emergency_contacts?.[0]?.full_name,
                no_kerabat_1: participant.emergency_contacts?.[0]?.phone_number,
                status_kerabat_1: participant.emergency_contacts?.[0]?.relationship,
                nama_kerabat_2: participant.emergency_contacts?.[1]?.full_name,
                no_kerabat_2: participant.emergency_contacts?.[1]?.phone_number,
                status_kerabat_2: participant.emergency_contacts?.[1]?.relationship,

                // Peserta Detail - Merged into Participant
                pesertaDetail: {
                    communicationStatus: participant.communication_status,
                    fundDisbursement: participant.fund_disbursement,
                    presenceStatus: participant.presence_status,
                    willingToBeAssisted: participant.willing_to_be_assisted,
                    reasonNotWilling: participant.reason_not_willing,
                    statusApplicant: participant.status_applicant,
                    reasonDrop: participant.reason_drop,
                    no_wa: profile?.whatsapp_number,
                    link_map: null,
                    bmcFile: null,
                    actionPlanFile: null,
                },

                // University - Removed in new schema?
                university: null
            },
        };

        // Helper to serialize BigInt if needed (though we used Number() mostly)
        return NextResponse.json(JSON.parse(JSON.stringify(response, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
        )));

    } catch (error) {
        console.error("Error fetching participant detail:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
