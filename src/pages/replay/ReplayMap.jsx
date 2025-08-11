import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Plus, 
  Minus, 
  Globe, 
  Satellite, 
  Maximize, 
  Minimize,
  Navigation,
  Printer
} from "lucide-react";
import { motion } from "framer-motion";

// Fix Leaflet default markers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ReplayMap = forwardRef(({ replayData, isPlaying, currentTime, isMobileMenuOpen }, ref) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapType, setMapType] = useState("street");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 6); // Pakistan center

      mapInstanceRef.current = map;

      // Add tile layer
      const tileLayer = L.tileLayer(
        "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
        {
          minZoom: 3,
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "© Google",
        }
      ).addTo(map);

      map.tileLayer = tileLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle map type change
  const handleMapTypeChange = (type) => {
    setMapType(type);
    if (mapInstanceRef.current && mapInstanceRef.current.tileLayer) {
      mapInstanceRef.current.removeLayer(mapInstanceRef.current.tileLayer);

      const tileUrl =
        type === "satellite"
          ? "https://{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
          : "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}";

      const newTileLayer = L.tileLayer(tileUrl, {
        minZoom: 3,
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google",
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.tileLayer = newTileLayer;
    }
  };

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

  // Fit to bounds
  const handleFitToBounds = () => {
    if (mapInstanceRef.current && replayData && replayData.length > 0) {
      const bounds = L.latLngBounds(
        replayData.map(point => [point.latitude, point.longitude])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([30.3753, 69.3451], 6);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Print map
  const handlePrintMap = () => {
    window.print();
  };

  // Draw track
  const drawTrack = () => {
    if (!replayData || replayData.length === 0) return;

    // Remove existing route
    if (routeLayer) {
      mapInstanceRef.current.removeLayer(routeLayer);
    }

    // Create route line
    const coordinates = replayData.map(point => [point.latitude, point.longitude]);
    const polyline = L.polyline(coordinates, {
      color: '#25689f',
      weight: 4,
      opacity: 0.8,
    }).addTo(mapInstanceRef.current);

    setRouteLayer(polyline);

    // Add start and end markers
    if (coordinates.length > 0) {
      const startIcon = L.divIcon({
        className: 'start-marker',
        html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">S</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const endIcon = L.divIcon({
        className: 'end-marker',
        html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">E</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(coordinates[0], { icon: startIcon }).addTo(mapInstanceRef.current);
      L.marker(coordinates[coordinates.length - 1], { icon: endIcon }).addTo(mapInstanceRef.current);
    }
  };

  // Update current position marker
  useEffect(() => {
    if (replayData && replayData.length > 0 && currentTime !== null) {
      const currentPoint = replayData[Math.floor(currentTime * replayData.length / 100)];
      
      if (currentPoint) {
        // Remove existing marker
        if (currentMarker) {
          mapInstanceRef.current.removeLayer(currentMarker);
        }

        // Create current position marker
        const currentIcon = L.divIcon({
          className: 'current-marker',
          html: '<div style="background: #f59e0b; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">●</div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([currentPoint.latitude, currentPoint.longitude], { 
          icon: currentIcon 
        }).addTo(mapInstanceRef.current);

        setCurrentMarker(marker);
      }
    }
  }, [currentTime, replayData]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    fitToBounds: handleFitToBounds,
    drawTrack: drawTrack,
    printMap: handlePrintMap,
  }));

  // Adjust z-index for map controls based on mobile menu state
  const controlsZIndex = isMobileMenuOpen ? 10 : 1000;

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls - Adjust z-index based on mobile menu state */}
      <div className={`absolute top-4 left-4 z-[${controlsZIndex}]`} style={{ zIndex: controlsZIndex }}>
        <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleMapTypeChange("street")}
            className={`flex items-center cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mapType === "street"
                ? "bg-[#25689f] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Globe size={14} className="mr-1.5" />
            <span className="hidden sm:inline">Street</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleMapTypeChange("satellite")}
            className={`flex items-center cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mapType === "satellite"
              ? "bg-[#25689f] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          <Satellite size={14} className="mr-1.5" />
          <span className="hidden sm:inline">Satellite</span>
        </motion.button>
      </div>
    </div>

    {/* Zoom Controls */}
    <div className={`absolute top-4 right-4`} style={{ zIndex: controlsZIndex }}>
      <div className="flex flex-col space-y-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleZoomIn}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
        >
          <Plus size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleZoomOut}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
        >
          <Minus size={16} />
        </motion.button>
      </div>
    </div>

    {/* Additional Controls */}
    <div className={`absolute bottom-20 right-4`} style={{ zIndex: controlsZIndex }}>
      <div className="flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFitToBounds}
          className="flex items-center px-3 py-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 text-xs font-medium transition-all cursor-pointer duration-200"
        >
          <Navigation size={14} />
    
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleFullscreen}
          className="flex items-center px-3 py-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 text-xs font-medium transition-all cursor-pointer duration-200"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
 
        </motion.button>

        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrintMap}
          className="flex items-center px-3 py-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 text-xs font-medium transition-all duration-200"
        >
          <Printer size={14} className="mr-1.5" />
  
        </motion.button> */}
      </div>
    </div>
  </div>
);
});

ReplayMap.displayName = "ReplayMap";

export default ReplayMap;

