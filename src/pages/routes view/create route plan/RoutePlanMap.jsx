
import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RoutePlanMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 6); // Center on Pakistan

      L.tileLayer(
        "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
        {
          minZoom: 3,
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "© Google",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
      {/* Zoom Controls */}
      {mapLoaded && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-2 bg-white/90 rounded-lg p-1 shadow border border-gray-200">
          <button
            onClick={handleZoomIn}
            className="cursor-pointer p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="cursor-pointer p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      )}
    </div>
  );
};

export default RoutePlanMap;