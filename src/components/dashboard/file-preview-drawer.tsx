"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Image as ImageIcon, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePreviewDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileUrl: string | null;
    fileName?: string | null;
    fileType?: 'image' | 'pdf' | 'video' | 'other';
}

export function FilePreviewDrawer({
    open,
    onOpenChange,
    fileUrl,
    fileName,
    fileType: initialFileType,
}: FilePreviewDrawerProps) {
    if (!fileUrl) return null;

    const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || initialFileType === 'pdf';
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl) || initialFileType === 'image';
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(fileUrl) || initialFileType === 'video';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    "p-0 border-l-0 shadow-2xl flex flex-col h-full bg-background transition-all duration-500 sm:max-w-none",
                    isImage ? "w-auto min-w-[300px] max-w-[95vw]" :
                        isVideo ? "w-full sm:w-[600px] md:w-[800px]" :
                            "w-full sm:w-[500px] md:w-[700px] lg:w-[900px] xl:w-[1100px]"
                )}
            >
                <SheetHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3 min-w-0 pr-8">
                        <div className="p-2 bg-background rounded-lg shadow-sm">
                            {isImage ? <ImageIcon className="w-4 h-4 text-primary" /> :
                                isVideo ? <PlayCircle className="w-4 h-4 text-primary" /> :
                                    <FileText className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="min-w-0">
                            <SheetTitle className="text-sm font-bold truncate">
                                {fileName || "Preview Berkas"}
                            </SheetTitle>
                            <SheetDescription className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                {isImage ? "Format Gambar" : isVideo ? "Format Video" : isPdf ? "Format PDF" : "Berkas"}
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleDownload}>
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => window.open(fileUrl, "_blank")}>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-auto bg-muted/10 p-4 flex items-center justify-center">
                    {isImage ? (
                        <div className="relative group max-h-full">
                            <img
                                src={fileUrl}
                                alt={fileName || "Preview"}
                                className="max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-lg border bg-background"
                            />
                        </div>
                    ) : isVideo ? (
                        <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10">
                            <video
                                src={fileUrl}
                                controls
                                autoPlay
                                className="w-full h-full"
                            >
                                Peramban Anda tidak mendukung elemen video.
                            </video>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-full rounded-lg border bg-background shadow-inner"
                            title={fileName || "PDF Preview"}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-background p-12 rounded-2xl border-2 border-dashed shadow-sm max-w-md text-center">
                            <div className="p-4 bg-primary/5 rounded-full mb-4">
                                <FileText className="w-12 h-12 text-primary opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Pratinjau Tidak Tersedia</h3>
                            <p className="text-sm text-muted-foreground mb-6">Berkas ini tidak mendukung pratinjau langsung. Silakan unduh atau buka di tab baru.</p>
                            <Button onClick={handleDownload} className="rounded-full px-8">
                                <Download className="w-4 h-4 mr-2" /> Unduh Berkas
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
