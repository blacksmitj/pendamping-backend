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

        // Fetch participant document fields
        const participant = await prisma.peserta.findUnique({
            where: { id_tkm: id },
            select: {
                // Personal Documents
                link_ktp: true,
                upload_kartu_keluarga: true,
                link_pas_foto: true,

                // Business Documents
                dokumen_profil_usaha: true,
                dokumen_bmc_strategi_model_usaha: true,
                dokumen_rab: true,
                dokumen_rencana_pengembangan_usaha: true,
                link_video: true,
                foto_usaha: true,
                dokumen_pencatatan_keuangan: true,

                // Legality Documents
                dokumen_nib: true,
                nomor_dokumen_nib: true,
                nama_usaha_dokumen_nib: true,
                dokumen_legalitas: true,
                nomor_dokumen_legalitas: true,
                nama_dokumen_legalitas: true,
                dokumen_sku: true,
                nomor_dokumen_sku: true,
                tanggal_dokumen_sku: true,
                kelurahan_dokumen_sku: true,
                pejabat_penandatangan_dokumen_sku: true,

                // Financial Documents
                lpj_tkm_pemula_2024: true,
                bast_tkm_pemula_2024: true,
                dokumentasi_usaha_tkm_pemula_2024: true,

                // Application Documents
                dokumen_surat_permohonan_bantuan: true,
                dokumen_surat_pernyataan_kesanggupan: true,
            },
        });

        if (!participant) {
            return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            );
        }

        // Helper function to check if document is uploaded
        const isUploaded = (url: string | null): boolean => {
            return url !== null && url.trim() !== "";
        };

        // Helper function to parse multiple files (comma-separated)
        const parseFiles = (urls: string | null): string[] => {
            if (!urls) return [];
            return urls.split(",").filter((url) => url.trim() !== "");
        };

        // Categorize documents
        const documents = {
            personal: {
                ktp: {
                    url: participant.link_ktp,
                    uploaded: isUploaded(participant.link_ktp),
                },
                kk: {
                    url: participant.upload_kartu_keluarga,
                    uploaded: isUploaded(participant.upload_kartu_keluarga),
                },
                pasFoto: {
                    url: participant.link_pas_foto,
                    uploaded: isUploaded(participant.link_pas_foto),
                },
            },
            business: {
                profilUsaha: {
                    url: participant.dokumen_profil_usaha,
                    uploaded: isUploaded(participant.dokumen_profil_usaha),
                },
                bmc: {
                    url: participant.dokumen_bmc_strategi_model_usaha,
                    uploaded: isUploaded(participant.dokumen_bmc_strategi_model_usaha),
                },
                rab: {
                    url: participant.dokumen_rab,
                    uploaded: isUploaded(participant.dokumen_rab),
                },
                rencanaPengembangan: {
                    url: participant.dokumen_rencana_pengembangan_usaha,
                    uploaded: isUploaded(participant.dokumen_rencana_pengembangan_usaha),
                },
                videoUsaha: {
                    url: participant.link_video,
                    uploaded: isUploaded(participant.link_video),
                },
                fotoUsaha: {
                    urls: parseFiles(participant.foto_usaha),
                    uploaded: parseFiles(participant.foto_usaha).length > 0,
                },
                pencatatanKeuangan: {
                    url: participant.dokumen_pencatatan_keuangan,
                    uploaded: isUploaded(participant.dokumen_pencatatan_keuangan),
                },
            },
            legality: {
                nib: {
                    url: participant.dokumen_nib,
                    number: participant.nomor_dokumen_nib,
                    businessName: participant.nama_usaha_dokumen_nib,
                    uploaded: isUploaded(participant.dokumen_nib),
                },
                legalitas: {
                    url: participant.dokumen_legalitas,
                    number: participant.nomor_dokumen_legalitas,
                    name: participant.nama_dokumen_legalitas,
                    uploaded: isUploaded(participant.dokumen_legalitas),
                },
                sku: {
                    url: participant.dokumen_sku,
                    number: participant.nomor_dokumen_sku,
                    date: participant.tanggal_dokumen_sku,
                    location: participant.kelurahan_dokumen_sku,
                    signatory: participant.pejabat_penandatangan_dokumen_sku,
                    uploaded: isUploaded(participant.dokumen_sku),
                },
            },
            financial: {
                lpj2024: {
                    url: participant.lpj_tkm_pemula_2024,
                    uploaded: isUploaded(participant.lpj_tkm_pemula_2024),
                },
                bast2024: {
                    url: participant.bast_tkm_pemula_2024,
                    uploaded: isUploaded(participant.bast_tkm_pemula_2024),
                },
                dokumentasiUsaha: {
                    url: participant.dokumentasi_usaha_tkm_pemula_2024,
                    uploaded: isUploaded(participant.dokumentasi_usaha_tkm_pemula_2024),
                },
            },
            application: {
                suratPermohonan: {
                    url: participant.dokumen_surat_permohonan_bantuan,
                    uploaded: isUploaded(participant.dokumen_surat_permohonan_bantuan),
                },
                suratPernyataan: {
                    url: participant.dokumen_surat_pernyataan_kesanggupan,
                    uploaded: isUploaded(
                        participant.dokumen_surat_pernyataan_kesanggupan
                    ),
                },
            },
        };

        // Calculate statistics
        const allDocuments = [
            ...Object.values(documents.personal),
            ...Object.values(documents.business).filter((doc: any) => !doc.urls), // Exclude fotoUsaha from count
            documents.business.fotoUsaha,
            ...Object.values(documents.legality),
            ...Object.values(documents.financial),
            ...Object.values(documents.application),
        ];

        const totalDocuments = allDocuments.length;
        const uploadedDocuments = allDocuments.filter((doc: any) => doc.uploaded).length;
        const completionPercentage = Math.round(
            (uploadedDocuments / totalDocuments) * 100
        );

        return NextResponse.json({
            documents,
            stats: {
                totalDocuments,
                uploadedDocuments,
                completionPercentage,
            },
        });
    } catch (error) {
        console.error("Error fetching participant documents:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
