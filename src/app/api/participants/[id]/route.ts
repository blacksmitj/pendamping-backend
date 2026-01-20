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

        // Fetch participant with all related data
        const participant = await prisma.peserta.findUnique({
            where: { id_tkm: id },
            include: {
                pesertaDetails: {
                    take: 1,
                    orderBy: { created_at: "desc" },
                },
                user: {
                    include: {
                        profiles: {
                            include: {
                                university: {
                                    include: {
                                        city: true,
                                        province: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!participant) {
            return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            );
        }

        // Get the latest peserta detail
        const pesertaDetail = participant.pesertaDetails[0] || null;
        const profile = participant.user?.profiles[0] || null;

        // Format response
        const response = {
            participant: {
                // Basic Info
                id_tkm: participant.id_tkm,
                nama: participant.nama,
                nik: participant.nik,
                status: participant.status,
                no_whatsapp: participant.no_whatsapp,

                // Personal Data
                tempat_lahir: participant.tempat_lahir,
                tgl_lahir: participant.tgl_lahir,
                umur: participant.umur,
                pendidikan_terakhir: participant.pendidikan_terakhir,
                jenis_kelamin: profile?.jenis_kelamin,
                foto: profile?.foto || participant.link_pas_foto,
                penyandang_disabilitas: participant.penyandang_disabilitas,
                jenis_disabilitas: participant.jenis_disabilitas,

                // Address Data - KTP
                alamat_ktp: participant.alamat_ktp,
                provinsi_ktp: participant.provinsi_ktp,
                kota_ktp: participant.kota_ktp,
                kecamatan_ktp: participant.kecamatan_ktp,
                kelurahan_ktp: participant.kelurahan_ktp,
                kode_pos_ktp: participant.kode_pos_ktp,

                // Address Data - Domisili
                alamat_domisili_dan_alamat_ktp_sama:
                    participant.alamat_domisili_dan_alamat_ktp_sama,
                alamat_domisili: participant.alamat_domisili,
                provinsi_domisili: participant.provinsi_domisili,
                kota_domisili: participant.kota_domisili,
                kecamatan_domisili: participant.kecamatan_domisili,
                kelurahan_domisili: participant.kelurahan_domisili,
                kode_pos_domisili: participant.kode_pos_domisili,

                // Business Data
                nama_usaha: participant.nama_usaha,
                sektor_usaha: participant.sektor_usaha,
                jenis_usaha: participant.jenis_usaha,
                deskripsi_usaha: participant.deskripsi_usaha,
                produk_utama: participant.produk_utama,
                aktivitas_saat_ini: participant.aktivitas_saat_ini,
                omset_per_periode: participant.omset_per_periode,
                laba_per_periode: participant.laba_per_periode,
                jumlah_produk_per_periode: participant.jumlah_produk_per_periode,
                satuan_jumlah_produk_per_periode:
                    participant.satuan_jumlah_produk_per_periode,
                saluran_pemasaran: participant.saluran_pemasaran,
                wilayah_pemasaran: participant.wilayah_pemasaran,
                mitra_usaha: participant.mitra_usaha,
                jumlah_mitra_usaha: participant.jumlah_mitra_usaha,

                // Business Location
                lokasi_usaha: participant.lokasi_usaha,
                kepemilikan_lokasi_usaha: participant.kepemilikan_lokasi_usaha,
                alamat_usaha_dan_alamat_domisili_sama:
                    participant.alamat_usaha_dan_alamat_domisili_sama,
                alamat_usaha: participant.alamat_usaha,
                provinsi_usaha: participant.provinsi_usaha,
                kota_usaha: participant.kota_usaha,
                kecamatan_usaha: participant.kecamatan_usaha,
                kelurahan_usaha: participant.kelurahan_usaha,
                kode_pos_usaha: participant.kode_pos_usaha,

                // Legality
                nomor_nib: participant.nomor_nib,
                nomor_dokumen_nib: participant.nomor_dokumen_nib,
                nama_usaha_dokumen_nib: participant.nama_usaha_dokumen_nib,
                nomor_dokumen_legalitas: participant.nomor_dokumen_legalitas,
                nama_dokumen_legalitas: participant.nama_dokumen_legalitas,
                nomor_dokumen_sku: participant.nomor_dokumen_sku,
                tanggal_dokumen_sku: participant.tanggal_dokumen_sku,

                // Status & Batch
                batch_pembekalan: participant.batch_pembekalan,
                tanggal_daftar: participant.tanggal_daftar,
                tanggal_submit_pendaftaran: participant.tanggal_submit_pendaftaran,
                pleno: participant.pleno,
                ptn_pts: participant.ptn_pts,

                // Contact
                jenis_medsos: participant.jenis_medsos,
                nama_medsos: participant.nama_medsos,
                link_media_sosial: participant.link_media_sosial,
                nama_kerabat_1: participant.nama_kerabat_1,
                no_kerabat_1: participant.no_kerabat_1,
                status_kerabat_1: participant.status_kerabat_1,
                nama_kerabat_2: participant.nama_kerabat_2,
                no_kerabat_2: participant.no_kerabat_2,
                status_kerabat_2: participant.status_kerabat_2,

                // Peserta Detail
                pesertaDetail: pesertaDetail
                    ? {
                        communicationStatus: pesertaDetail.communicationStatus,
                        fundDisbursement: pesertaDetail.fundDisbursement,
                        presenceStatus: pesertaDetail.presenceStatus,
                        willingToBeAssisted: pesertaDetail.willingToBeAssisted,
                        reasonNotWilling: pesertaDetail.reasonNotWilling,
                        statusApplicant: pesertaDetail.statusApplicant,
                        reasonDrop: pesertaDetail.reasonDrop,
                        no_wa: pesertaDetail.no_wa,
                        link_map: pesertaDetail.link_map,
                        bmcFile: pesertaDetail.bmcFile,
                        actionPlanFile: pesertaDetail.actionPlanFile,
                    }
                    : null,

                // University (from profile)
                university: profile?.university
                    ? {
                        name: profile.university.name,
                        city: profile.university.city?.city_name,
                        province: profile.university.province?.prov_name,
                    }
                    : null,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching participant detail:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
