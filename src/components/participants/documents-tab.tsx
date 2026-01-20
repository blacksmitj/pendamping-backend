"use client";

import { useParticipantDocuments } from "@/hooks/use-participant-documents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, FileText, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import type { DocumentItem, DocumentItemWithMetadata, DocumentItemMultiple } from "@/types/participant";

function DocumentStatusBadge({ uploaded }: { uploaded: boolean }) {
    if (uploaded) {
        return (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Sudah Upload
            </Badge>
        );
    }
    return (
        <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Belum Upload
        </Badge>
    );
}

function DocumentCard({
    title,
    doc,
    multiple = false,
    metadata = false,
}: {
    title: string;
    doc: DocumentItem | DocumentItemWithMetadata | DocumentItemMultiple;
    multiple?: boolean;
    metadata?: boolean;
}) {
    const isMultiple = multiple && 'urls' in doc;
    const isUploaded = doc.uploaded;
    const itemWithMetadata = metadata ? (doc as DocumentItemWithMetadata) : null;

    return (
        <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{title}</p>
                </div>

                {metadata && itemWithMetadata && isUploaded && (
                    <div className="text-sm text-muted-foreground space-y-0.5">
                        {itemWithMetadata.number && <p>Nomor: {itemWithMetadata.number}</p>}
                        {itemWithMetadata.date && <p>Tanggal: {new Date(itemWithMetadata.date).toLocaleDateString("id-ID")}</p>}
                        {itemWithMetadata.signatory && <p>Penandatangan: {itemWithMetadata.signatory}</p>}
                    </div>
                )}

                <DocumentStatusBadge uploaded={isUploaded} />
            </div>

            <div className="flex flex-col gap-2">
                {isUploaded && (
                    <>
                        {isMultiple && 'urls' in doc ? (
                            (doc.urls || []).map((url, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(url, "_blank")}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Foto {index + 1}
                                </Button>
                            ))
                        ) : (
                            'url' in doc && doc.url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.url!, "_blank")}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Preview
                                </Button>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export function DocumentsTab({ participantId }: { participantId: string }) {
    const { data, isLoading, isError } = useParticipantDocuments(participantId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                        Gagal memuat dokumen peserta.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { documents, stats } = data;

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Sudah Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.uploadedDocuments}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Kelengkapan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.completionPercentage}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dokumen Pribadi */}
            <Card>
                <CardHeader>
                    <CardTitle>Dokumen Pribadi</CardTitle>
                    <CardDescription>KTP, KK, dan Pas Foto</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <DocumentCard title="KTP" doc={documents.personal.ktp} />
                    <DocumentCard title="Kartu Keluarga" doc={documents.personal.kk} />
                    <DocumentCard title="Pas Foto" doc={documents.personal.pasFoto} />
                </CardContent>
            </Card>

            {/* Dokumen Usaha */}
            <Card>
                <CardHeader>
                    <CardTitle>Dokumen Usaha</CardTitle>
                    <CardDescription>Legalitas dan profil usaha</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <DocumentCard title="Profil Usaha" doc={documents.business.profilUsaha} />
                    <DocumentCard title="Business Model Canvas (BMC)" doc={documents.business.bmc} />
                    <DocumentCard title="RAB" doc={documents.business.rab} />
                    <DocumentCard title="Rencana Pengembangan" doc={documents.business.rencanaPengembangan} />
                    <DocumentCard title="Video Usaha" doc={documents.business.videoUsaha} />
                    <DocumentCard title="Pencatatan Keuangan" doc={documents.business.pencatatanKeuangan} />
                    <div className="md:col-span-2">
                        <DocumentCard title="Foto Usaha" doc={documents.business.fotoUsaha} multiple />
                    </div>
                </CardContent>
            </Card>

            {/* Legalitas */}
            <Card>
                <CardHeader>
                    <CardTitle>Legalitas Usaha</CardTitle>
                    <CardDescription>NIB, SKU, dan dokumen lainnya</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <DocumentCard title="NIB" doc={documents.legality.nib} metadata />
                    <DocumentCard title="Surat Keterangan Usaha (SKU)" doc={documents.legality.sku} metadata />
                    <DocumentCard title="Dokumen Legalitas Lainnya" doc={documents.legality.legalitas} metadata />
                </CardContent>
            </Card>

            {/* Keuangan */}
            <Card>
                <CardHeader>
                    <CardTitle>Dokumen Keuangan</CardTitle>
                    <CardDescription>LPJ, BAST, dan dokumentasi</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <DocumentCard title="LPJ 2024" doc={documents.financial.lpj2024} />
                    <DocumentCard title="BAST 2024" doc={documents.financial.bast2024} />
                    <DocumentCard title="Dokumentasi Usaha" doc={documents.financial.dokumentasiUsaha} />
                </CardContent>
            </Card>

            {/* Aplikasi */}
            <Card>
                <CardHeader>
                    <CardTitle>Dokumen Aplikasi</CardTitle>
                    <CardDescription>Surat permohonan dan pernyataan</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <DocumentCard title="Surat Permohonan" doc={documents.application.suratPermohonan} />
                    <DocumentCard title="Surat Pernyataan" doc={documents.application.suratPernyataan} />
                </CardContent>
            </Card>
        </div>
    );
}
