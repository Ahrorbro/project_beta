"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/ui/GlassCard";
import { MapPin, Navigation } from "lucide-react";

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
  location?: string | null;
}

export function PropertyMap({ latitude, longitude, address, location }: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const center: [number, number] = [latitude, longitude];
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  if (!isClient) {
    return (
      <GlassCard>
        <div className="p-6 text-center">
          <p className="text-white/60">Loading map...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Property Location</h3>
            <p className="text-white/80 text-sm">{address}</p>
            {location && <p className="text-white/60 text-sm">📍 {location}</p>}
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: "300px" }}>
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
              <Popup>
                <div className="text-sm">
                  <strong>{address}</strong>
                  {location && <div>📍 {location}</div>}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="flex gap-3">
          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button flex items-center gap-2 flex-1 justify-center text-sm"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </a>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button flex items-center gap-2 flex-1 justify-center text-sm"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </a>
        </div>
      </div>
    </GlassCard>
  );
}
