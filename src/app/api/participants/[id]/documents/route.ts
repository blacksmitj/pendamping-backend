import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = String(idParam); // legacy_tkm_id

        // Fetch participant and related documents
        const participant = await prisma.participants.findFirst({
            where: { legacy_tkm_id: id },
            include: {
                participant_documents: {
                    include: {
                        documents: true
                    }
                },
                businesses: {
                    include: {
                        business_documents: {
                            include: {
                                documents: true
                            }
                        }
                    }
                }
            },
        });

        if (!participant) {
            return NextResponse.json(
                { error: "Participant not found" },
                { status: 404 }
            );
        }

        // Helper to find doc url by label
        const findDoc = (docs: any[], labelPattern: RegExp | string) => {
            const doc = docs.find(d => {
                const l = d.label?.toLowerCase() || "";
                if (labelPattern instanceof RegExp) return labelPattern.test(l);
                return l === String(labelPattern).toLowerCase();
            });
            return doc ? doc.file_url : null;
        };
        
        // Helper to find multiple docs
        const findDocs = (docs: any[], labelPattern: RegExp | string) => {
             return docs.filter(d => {
                const l = d.label?.toLowerCase() || "";
                if (labelPattern instanceof RegExp) return labelPattern.test(l);
                return l === String(labelPattern).toLowerCase();
            }).map(d => d.file_url);
        };

        // Collect all documents
        const pDocs = participant.participant_documents.map((pd: any) => pd.documents);
        const bDocs = participant.businesses.flatMap((b: any) => b.business_documents.map((bd: any) => bd.documents));
        const allDocs = [...pDocs, ...bDocs];

        // Mapping
        // Adjust labels based on expected values in new schema (assumed from legacy field names or standard names)
        const mappedDocs = {
            // Personal
            link_ktp: findDoc(allDocs, /ktp/i),
            upload_kartu_keluarga: findDoc(allDocs, /k.*k/i), // KK / Kartu Keluarga
            link_pas_foto: findDoc(allDocs, /foto.*diri|pas.*foto/i),

            // Business
            dokumen_profil_usaha: findDoc(allDocs, /profil.*usaha/i),
            dokumen_bmc_strategi_model_usaha: findDoc(allDocs, /bmc|model.*usaha/i),
            dokumen_rab: findDoc(allDocs, /rab/i),
            dokumen_rencana_pengembangan_usaha: findDoc(allDocs, /rencana.*pengembangan/i),
            link_video: findDoc(allDocs, /video/i),
            foto_usaha: findDocs(allDocs, /foto.*usaha/i).join(','), // Join for legacy string format
            dokumen_pencatatan_keuangan: findDoc(allDocs, /catatan.*keuangan/i),

            // Legality
            dokumen_nib: findDoc(allDocs, /nib/i),
            dokumen_legalitas: findDoc(allDocs, /legalitas|akta/i),
            dokumen_sku: findDoc(allDocs, /sku|keterangan.*usaha/i),

            // Financial (might be in monthly reports or here?)
            // Assuming if they were on peserta table, they are now docs linked to participant
            lpj_tkm_pemula_2024: findDoc(allDocs, /lpj/i),
            bast_tkm_pemula_2024: findDoc(allDocs, /bast/i),
            dokumentasi_usaha_tkm_pemula_2024: findDoc(allDocs, /dokumentasi.*usaha/i), // Separate from foto usaha?

            // Application
            dokumen_surat_permohonan_bantuan: findDoc(allDocs, /permohonan/i),
            dokumen_surat_pernyataan_kesanggupan: findDoc(allDocs, /pernyataan|kesanggupan/i),
        };
        
        // Manual metadata fields (numbers, names) - new schema stores these in specific columns or metadata json?
        // Checking schema: businesses has `nib_number`. 
        // Participant doesn't have explicit columns for these numbers in new schema except what we saw.
        // We'll try to find them in businesses table or return null/metadata.
        const biz = participant.businesses[0]; // Assume primary business

        const participantData = {
            ...mappedDocs,
            nomor_dokumen_nib: biz?.nib_number || null,
            nama_usaha_dokumen_nib: biz?.name || null, // Assuming business name matches NIB
            
            // Others might be missing or in metadata
            nomor_dokumen_legalitas: null,
            nama_dokumen_legalitas: null,
            nomor_dokumen_sku: null,
            tanggal_dokumen_sku: null,
            kelurahan_dokumen_sku: null,
            pejabat_penandatangan_dokumen_sku: null,
        };

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
                    url: participantData.link_ktp,
                    uploaded: isUploaded(participantData.link_ktp),
                },
                kk: {
                    url: participantData.upload_kartu_keluarga,
                    uploaded: isUploaded(participantData.upload_kartu_keluarga),
                },
                pasFoto: {
                    url: participantData.link_pas_foto,
                    uploaded: isUploaded(participantData.link_pas_foto),
                },
            },
            business: {
                profilUsaha: {
                    url: participantData.dokumen_profil_usaha,
                    uploaded: isUploaded(participantData.dokumen_profil_usaha),
                },
                bmc: {
                    url: participantData.dokumen_bmc_strategi_model_usaha,
                    uploaded: isUploaded(participantData.dokumen_bmc_strategi_model_usaha),
                },
                rab: {
                    url: participantData.dokumen_rab,
                    uploaded: isUploaded(participantData.dokumen_rab),
                },
                rencanaPengembangan: {
                    url: participantData.dokumen_rencana_pengembangan_usaha,
                    uploaded: isUploaded(participantData.dokumen_rencana_pengembangan_usaha),
                },
                videoUsaha: {
                    url: participantData.link_video,
                    uploaded: isUploaded(participantData.link_video),
                },
                fotoUsaha: {
                    urls: parseFiles(participantData.foto_usaha),
                    uploaded: parseFiles(participantData.foto_usaha).length > 0,
                },
                pencatatanKeuangan: {
                    url: participantData.dokumen_pencatatan_keuangan,
                    uploaded: isUploaded(participantData.dokumen_pencatatan_keuangan),
                },
            },
            legality: {
                nib: {
                    url: participantData.dokumen_nib,
                    number: participantData.nomor_dokumen_nib,
                    businessName: participantData.nama_usaha_dokumen_nib,
                    uploaded: isUploaded(participantData.dokumen_nib),
                },
                legalitas: {
                    url: participantData.dokumen_legalitas,
                    number: participantData.nomor_dokumen_legalitas,
                    name: participantData.nama_dokumen_legalitas,
                    uploaded: isUploaded(participantData.dokumen_legalitas),
                },
                sku: {
                    url: participantData.dokumen_sku,
                    number: participantData.nomor_dokumen_sku,
                    date: participantData.tanggal_dokumen_sku,
                    location: participantData.kelurahan_dokumen_sku,
                    signatory: participantData.pejabat_penandatangan_dokumen_sku,
                    uploaded: isUploaded(participantData.dokumen_sku),
                },
            },
            financial: {
                lpj2024: {
                    url: participantData.lpj_tkm_pemula_2024,
                    uploaded: isUploaded(participantData.lpj_tkm_pemula_2024),
                },
                bast2024: {
                    url: participantData.bast_tkm_pemula_2024,
                    uploaded: isUploaded(participantData.bast_tkm_pemula_2024),
                },
                dokumentasiUsaha: {
                    url: participantData.dokumentasi_usaha_tkm_pemula_2024,
                    uploaded: isUploaded(participantData.dokumentasi_usaha_tkm_pemula_2024),
                },
            },
            application: {
                suratPermohonan: {
                    url: participantData.dokumen_surat_permohonan_bantuan,
                    uploaded: isUploaded(participantData.dokumen_surat_permohonan_bantuan),
                },
                suratPernyataan: {
                    url: participantData.dokumen_surat_pernyataan_kesanggupan,
                    uploaded: isUploaded(
                        participantData.dokumen_surat_pernyataan_kesanggupan
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
