import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function PreventionMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Center on Pakistan
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [30.3753, 69.3451],
        zoom: 6, // better fit for Pakistan
        zoomControl: false,
        attributionControl: false,
      });
      // Use Google Maps tile layer (like GeofenceMap)
      L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        minZoom: 3,
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google",
        errorTileUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      }).addTo(mapInstanceRef.current);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Example: add dummy vehicle markers (replace with real data)
  useEffect(() => {
    if (mapInstanceRef.current) {
      const markers = [
        { lat: 24.8607, lng: 67.0011, label: "TMQ-981 [434]", color: "#2196f3" },
        { lat: 31.5497, lng: 74.3436, label: "TMN-357 [1160]", color: "#e53935" },
        { lat: 33.6844, lng: 73.0479, label: "C-3044 [526]", color: "#fbc02d" },
      ];
      markers.forEach(({ lat, lng, label, color }) => {
        const marker = L.circleMarker([lat, lng], {
          radius: 14,
          color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 2,
        }).addTo(mapInstanceRef.current);
        marker.bindTooltip(`<span style='color:${color};font-weight:bold;'>${label}</span>`, { permanent: true, direction: 'top', className: 'leaflet-tooltip-own' });
      });
    }
  }, []);

  return (
    <div ref={mapRef} className="w-full h-screen" />
  );
}
