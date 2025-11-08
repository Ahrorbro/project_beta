"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { MapPin, Navigation } from "lucide-react";

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

const defaultCenter: [number, number] = [-6.7924, 39.2083]; // Dar es Salaam

interface MapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  address?: string;
}

// Component to handle map clicks - must be inside MapContainer
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  // Import react-leaflet at the top level to avoid conditional hook calls
  const { useMapEvents } = require("react-leaflet");
  
  // Hooks must be called unconditionally - MapContainer is only rendered client-side
  useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  
  return null;
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export function MapPicker({ latitude, longitude, onLocationSelect, address }: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [center, setCenter] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : defaultCenter
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    // Don't allow clearing by clicking (NaN values) - only via button
    if (isNaN(lat) || isNaN(lng)) return;
    
    const location: [number, number] = [lat, lng];
    setSelectedLocation(location);
    setCenter(location);
    onLocationSelect(lat, lng);
  };

  const handleGeocodeAddress = async () => {
    if (!address) return;

    try {
      // Use Nominatim (OpenStreetMap geocoding) - free, no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setCenter(location);
        setSelectedLocation(location);
        onLocationSelect(location[0], location[1]);
      } else {
        alert("Address not found. Please try a more specific address or click on the map to set location.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Could not find address. Please click on the map to set location manually.");
    }
  };

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
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Pin Property Location on Map (Optional)
          </label>
          <p className="text-sm text-white/60 mb-4">
            Click on the map to set the exact location of your property. Tenants will be able to see this location and navigate to it. You can create the property without setting a location.
          </p>
          {address && (
            <GlassButton
              type="button"
              variant="secondary"
              onClick={handleGeocodeAddress}
              className="mb-4"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Find Address on Map
            </GlassButton>
          )}
        </div>

        <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: "400px" }}>
          <MapContainer
            center={center}
            zoom={selectedLocation ? 15 : 12}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            {selectedLocation && (
              <Marker position={selectedLocation}>
                <Popup>
                  <div className="text-sm">
                    <strong>Property Location</strong>
                    <br />
                    {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {selectedLocation && (
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm text-white/80 mb-2">
              <strong>Selected Location:</strong> {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
            </p>
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLocation(null);
                // Clear the location by setting to undefined
                onLocationSelect(NaN, NaN);
              }}
              className="text-xs"
            >
              Clear Location
            </GlassButton>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
