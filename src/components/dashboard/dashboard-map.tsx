"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapDistribution } from "@/types/dashboard";

// Centroids for Indonesian Provinces
const PROVINCE_COORDINATES: Record<string, [number, number]> = {
    "Aceh": [4.6951, 96.7494],
    "Sumatera Utara": [2.1154, 99.5451],
    "Sumatera Barat": [-0.7399, 100.8000],
    "Riau": [0.2933, 101.7068],
    "Jambi": [-1.6101, 103.6131],
    "Sumatera Selatan": [-3.3194, 104.9144],
    "Bengkulu": [-3.5778, 102.3464],
    "Lampung": [-4.5586, 105.4068],
    "Kepulauan Bangka Belitung": [-2.7411, 106.4406],
    "Kepulauan Riau": [3.9456, 108.1428],
    "DKI Jakarta": [-6.2088, 106.8456],
    "Jawa Barat": [-6.9175, 107.6191],
    "Jawa Tengah": [-7.150975, 110.140259], // Central Java
    "DI Yogyakarta": [-7.7956, 110.3695],
    "Jawa Timur": [-7.5360, 112.2384],
    "Banten": [-6.4058, 106.0640],
    "Bali": [-8.3405, 115.0920],
    "Nusa Tenggara Barat": [-8.6529, 117.3616],
    "Nusa Tenggara Timur": [-8.6573, 121.0794],
    "Kalimantan Barat": [-0.2787, 111.4753],
    "Kalimantan Tengah": [-1.6815, 113.3824],
    "Kalimantan Selatan": [-3.0926, 115.2838],
    "Kalimantan Timur": [0.5387, 116.4194],
    "Kalimantan Utara": [3.0731, 116.0414],
    "Sulawesi Utara": [0.6247, 123.9750],
    "Sulawesi Tengah": [-1.4300, 121.4456],
    "Sulawesi Selatan": [-3.6687, 119.9740],
    "Sulawesi Tenggara": [-4.1449, 122.1746],
    "Gorontalo": [0.6999, 122.4467],
    "Sulawesi Barat": [-2.8441, 119.2321],
    "Maluku": [-3.2385, 129.4936],
    "Maluku Utara": [1.5709, 127.8080],
    "Papua Barat": [-1.3361, 133.1747],
    "Papua": [-4.2699, 138.0804],
    // New Provinces (approximate)
    "Papua Selatan": [-7.4000, 139.0000],
    "Papua Tengah": [-4.0000, 136.0000],
    "Papua Pegunungan": [-4.5000, 139.5000],
    "Papua Barat Daya": [-1.0000, 131.5000]
};

interface DashboardMapProps {
    data: MapDistribution[];
}

export default function DashboardMap({ data }: DashboardMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted/20" />;
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <MapContainer
                center={[-2.5489, 118.0149]}
                zoom={5}
                scrollWheelZoom={false}
                className="h-[400px] w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {data.map((item) => {
                    // Fuzzy match or exact match province name
                    const coords = PROVINCE_COORDINATES[item.name] ||
                        Object.entries(PROVINCE_COORDINATES).find(([k]) => k.includes(item.name))?.[1];

                    if (!coords) return null;

                    // Scale radius by value
                    const radius = Math.max(5, Math.min(30, Math.sqrt(item.value) * 3));

                    return (
                        <CircleMarker
                            key={item.name}
                            center={coords}
                            radius={radius}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.6,
                                weight: 1
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-sm">{item.name}</span>
                                    <span className="text-xs text-muted-foreground">{item.value} Participants</span>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
