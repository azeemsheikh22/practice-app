import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
// Helper: get icon by status
// Vehicle icon with rotation for moving, no rotation for idle/stop
const getVehicleIcon = (status, head = 0) => {
  let iconImg = stoppedIcon;
  let statusKey = "stop";
  if (typeof status === "string") {
    const s = status.toLowerCase();
    if (s.includes("moving")) {
      iconImg = movingIcon;
      statusKey = "moving";
    } else if (s.includes("idle")) {
      iconImg = idleIcon;
      statusKey = "idle";
    } else if (s.includes("stop") || s.includes("ign_off")) {
      iconImg = stoppedIcon;
      statusKey = "stop";
    }
  }
  // For moving, rotate icon using CSS transform
  const rotation = statusKey === "moving" ? (head || 0) - 140 : 0;
  return L.divIcon({
    className: "vehicle-marker",
    html: `<div style=\"width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;\">\n      <img src=\"${iconImg}\" alt=\"${statusKey}\" style=\"width: 18px; height: 18px; transform: rotate(${rotation}deg); display: block; margin: 0 auto;\" />\n    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};
import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSelector } from "react-redux";
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
  Printer,
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

const ReplayMap = forwardRef(
  (
    { replayData, isPlaying, currentTime, isMobileMenuOpen, sidebarExpanded },
    ref
  ) => {
    // Redux: get displayMode from replaySlice
    const displayMode = useSelector(state => state.replay.filters?.displayMode || 'line');  

    // Invalidate map size when sidebar expands/collapses
    useEffect(() => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 300); // match sidebar transition duration
      }
    }, [sidebarExpanded]);
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

    // Auto zoom state
    const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);


    // Jab bhi replayData aaye ya displayMode change ho, drawTrack ko call karein
    useEffect(() => {
      if (replayData && replayData.length > 0) {
        drawTrack();
        setAutoZoomEnabled(true); // Naya data aaya ya displayMode change hua to auto-zoom allow
      }
      // eslint-disable-next-line
    }, [displayMode, replayData ? replayData.length : 0]);

    // Sirf pehli dafa ya jab autoZoomEnabled true ho, fitToBounds
    useEffect(() => {
      if (autoZoomEnabled && replayData && replayData.length > 0) {
        setTimeout(() => {
          handleFitToBounds();
        }, 200);
      }
    }, [autoZoomEnabled, replayData]);

    // User ne zoom/drag kiya to auto-zoom disable ho jaye
    useEffect(() => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;
      const disableAutoZoom = () => setAutoZoomEnabled(false);
      map.on('zoomstart', disableAutoZoom);
      map.on('dragstart', disableAutoZoom);
      return () => {
        map.off('zoomstart', disableAutoZoom);
        map.off('dragstart', disableAutoZoom);
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
          replayData.map((point) => [point.latitude, point.longitude])
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

    // Draw track, status change icons, and prepare for animation
    const drawTrack = () => {
      if (!replayData || replayData.length === 0) return;

      // Remove existing route
      if (routeLayer) {
        mapInstanceRef.current.removeLayer(routeLayer);
      }
      // Remove previous vehicle markers
      if (mapInstanceRef.current._vehicleMarkers) {
        mapInstanceRef.current._vehicleMarkers.forEach((m) =>
          mapInstanceRef.current.removeLayer(m)
        );
      }
      mapInstanceRef.current._vehicleMarkers = [];

      // Remove current animated marker
      if (currentMarker) {
        mapInstanceRef.current.removeLayer(currentMarker);
        setCurrentMarker(null);
      }

      // --- DisplayMode: marker ---
      if (displayMode === 'marker') {
        // Har data point par marker banao (moving, idle, stop sab)
        const allMarkers = [];
        replayData.forEach((point) => {
          if (point.latitude && point.longitude) {
            const status = point.status || point.status1 || "";
            const marker = L.marker([point.latitude, point.longitude], {
              icon: getVehicleIcon(status, point.head),
              title: point.car_name || "",
              zIndexOffset: 1500,
            });
            marker.bindPopup(
              `<div style=\"min-width:120px\"><b>${point.car_name || ''}</b><br/>${point.gps_time || ''}<br/>Status: ${status || ''}<br/>Speed: ${point.speed ?? '-'} km/h</div>`
            );
            allMarkers.push(marker);
          }
        });
        mapInstanceRef.current._vehicleMarkers = allMarkers;
        if (!isPlaying) {
          allMarkers.forEach(marker => marker.addTo(mapInstanceRef.current));
        }
        // Polyline, S/E marker kuch bhi na banao
        return;
      }

      // --- DisplayMode: line ---
      if (displayMode === 'line') {
        // Sirf polyline aur start/end par marker
        const coordinates = replayData.map((point) => [
          point.latitude,
          point.longitude,
        ]);
        const polyline = L.polyline(coordinates, {
          color: "#25689f",
          weight: 4,
          opacity: 0.8,
        }).addTo(mapInstanceRef.current);
        setRouteLayer(polyline);

        // Sirf start/end par marker
        const statusMarkers = [];
        replayData.forEach((point, idx) => {
          if (point.latitude && point.longitude) {
            const status = point.status || point.status1 || "";
            if (idx === 0 || idx === replayData.length - 1) {
              const marker = L.marker([point.latitude, point.longitude], {
                icon: getVehicleIcon(status, point.head),
                title: point.car_name || "",
                zIndexOffset: 1500, // Status icon bhi upar
              });
              marker.bindPopup(
                `<div style=\"min-width:120px\"><b>${point.car_name || ''}</b><br/>${point.gps_time || ''}<br/>Status: ${status || ''}<br/>Speed: ${point.speed ?? '-'} km/h</div>`
              );
              statusMarkers.push(marker);
            }
          }
        });
        mapInstanceRef.current._vehicleMarkers = statusMarkers;
        if (!isPlaying) {
          statusMarkers.forEach(marker => marker.addTo(mapInstanceRef.current));
        }

        // Add start and end markers (sab se upar)
        if (coordinates.length > 0) {
          const startIcon = L.divIcon({
            className: "start-marker",
            html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">S</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          const endIcon = L.divIcon({
            className: "end-marker",
            html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">E</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          L.marker(coordinates[0], { icon: startIcon, zIndexOffset: 5000 }).addTo(
            mapInstanceRef.current
          );
          L.marker(coordinates[coordinates.length - 1], { icon: endIcon, zIndexOffset: 5000 }).addTo(
            mapInstanceRef.current
          );
        }
        return;
      }

      // --- DisplayMode: all ---
      // Polyline + all data point markers
      const coordinates = replayData.map((point) => [
        point.latitude,
        point.longitude,
      ]);
      const polyline = L.polyline(coordinates, {
        color: "#25689f",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapInstanceRef.current);
      setRouteLayer(polyline);

      // All data point markers (moving, idle, stop sab)
      const allMarkers = [];
      replayData.forEach((point) => {
        if (point.latitude && point.longitude) {
          const status = point.status || point.status1 || "";
          const marker = L.marker([point.latitude, point.longitude], {
            icon: getVehicleIcon(status, point.head),
            title: point.car_name || "",
            zIndexOffset: 1500,
          });
          marker.bindPopup(
            `<div style=\"min-width:120px\"><b>${point.car_name || ''}</b><br/>${point.gps_time || ''}<br/>Status: ${status || ''}<br/>Speed: ${point.speed ?? '-'} km/h</div>`
          );
          allMarkers.push(marker);
        }
      });
      mapInstanceRef.current._vehicleMarkers = allMarkers;
      if (!isPlaying) {
        allMarkers.forEach(marker => marker.addTo(mapInstanceRef.current));
      }

      // Add start and end markers (sab se upar)
      if (coordinates.length > 0) {
        const startIcon = L.divIcon({
          className: "start-marker",
          html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">S</div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const endIcon = L.divIcon({
          className: "end-marker",
          html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">E</div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker(coordinates[0], { icon: startIcon, zIndexOffset: 5000 }).addTo(
          mapInstanceRef.current
        );
        L.marker(coordinates[coordinates.length - 1], { icon: endIcon, zIndexOffset: 5000 }).addTo(
          mapInstanceRef.current
        );
      }
    };
    // Jab play ho ya displayMode change ho to status markers hide/show karo
    useEffect(() => {
      if (!mapInstanceRef.current || !mapInstanceRef.current._vehicleMarkers) return;
      if (isPlaying || displayMode !== 'marker') {
        mapInstanceRef.current._vehicleMarkers.forEach(marker => {
          if (mapInstanceRef.current.hasLayer(marker)) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
      } else {
        mapInstanceRef.current._vehicleMarkers.forEach(marker => {
          if (!mapInstanceRef.current.hasLayer(marker)) {
            marker.addTo(mapInstanceRef.current);
          }
        });
      }
    }, [isPlaying, displayMode]);

    // Smooth animated vehicle marker
    useEffect(() => {
      if (replayData && replayData.length > 0 && currentTime !== null) {
        // Interpolate position for smooth animation
        const total = replayData.length - 1;
        const floatIdx = (currentTime / 100) * total;
        let idx = Math.floor(floatIdx);
        let nextIdx = Math.ceil(floatIdx);
        if (idx < 0) idx = 0;
        if (nextIdx >= replayData.length) nextIdx = replayData.length - 1;
        const p1 = replayData[idx];
        const p2 = replayData[nextIdx];
        // Linear interpolation
        let lat = p1.latitude;
        let lng = p1.longitude;
        let head = p1.head || 0;
        let status = p1.status || p1.status1 || "";
        if (p2 && p2 !== p1 && floatIdx !== idx) {
          const t = floatIdx - idx;
          lat = p1.latitude + (p2.latitude - p1.latitude) * t;
          lng = p1.longitude + (p2.longitude - p1.longitude) * t;
          head = p1.head + (p2.head - p1.head) * t;
          // If status changes between p1 and p2, prefer p2 if t > 0.5
          if (t > 0.5) status = p2.status || p2.status1 || status;
        }
        if (lat && lng) {
          // Remove existing marker
          if (currentMarker) {
            mapInstanceRef.current.removeLayer(currentMarker);
          }
          // Use the correct icon for the current status and heading
          const marker = L.marker(
            [lat, lng],
            {
              icon: getVehicleIcon(status, head),
              title: p1.car_name || "",
              zIndexOffset: 4000, // Animated vehicle icon sab se upar (S/E se neeche)
            }
          );
          marker.bindPopup(
            `<div style=\"min-width:120px\"><b>${p1.car_name || ''}</b><br/>${p1.gps_time || ''}<br/>Status: ${status || ''}<br/>Speed: ${p1.speed ?? '-'} km/h</div>`
          );
          marker.addTo(mapInstanceRef.current);
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
        <div
          className={`absolute top-4 left-4 z-[${controlsZIndex}]`}
          style={{ zIndex: controlsZIndex }}
        >
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
        <div
          className={`absolute top-4 right-4`}
          style={{ zIndex: controlsZIndex }}
        >
          <div className="flex flex-col space-y-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleZoomIn}
              className="p-2 cursor-pointer text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
            >
              <Plus size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleZoomOut}
              className="p-2 cursor-pointer text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
            >
              <Minus size={16} />
            </motion.button>
          </div>
        </div>

        {/* Additional Controls */}
        <div
          className={`absolute bottom-20 right-4`}
          style={{ zIndex: controlsZIndex }}
        >
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
  }
);

ReplayMap.displayName = "ReplayMap";

export default ReplayMap;
