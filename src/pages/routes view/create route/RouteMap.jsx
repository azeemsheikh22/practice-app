import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
  Plus,
  Minus,
  Globe,
  Satellite,
  Maximize,
  Copy,
  MapPin,
  Navigation,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { setRouteCalculationData } from "../../../features/routeSlice";
import { showAddLocationSuccessMessage } from "./mapMessages";
import {
  handleShowCoordinates,
  handleCopyCoordinates,
  geocodeLocation,
  calculateMultiWaypointRoute,
  initializeMapTileLayer,
  createDraggableWaypointMarker,
} from "./RouteMapUtils";
// Internal styles for route interactions
const routeStyles = `
  /* Hide Leaflet Routing Machine default panels but NOT leaflet-bar */
  .leaflet-routing-container {
    display: none !important;
  }
  
  .leaflet-routing-alternatives-container {
    display: none !important;
  }
  
  /* Route drag tooltip */
  .route-drag-tooltip {
    position: absolute;
    background: rgba(37, 104, 159, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
    z-index: 10000;
    transform: translate(-50%, -100%);
    margin-top: -10px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
  }
  
  .route-drag-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(37, 104, 159, 0.9);
  }
  
  /* Route line interactions */
  .leaflet-routing-container path {
    cursor: grab !important;
    stroke-width: 6;
    transition: all 0.2s ease;
  }
  
  .leaflet-routing-container path:hover {
    stroke-width: 8 !important;
    cursor: grab !important;
    filter: drop-shadow(0 2px 6px rgba(37, 104, 159, 0.4));
  }
  
  .leaflet-routing-line {
    cursor: grab !important;
    transition: all 0.2s ease;
  }
  
  .leaflet-routing-line:hover {
    cursor: grab !important;
    filter: brightness(1.1) drop-shadow(0 0 5px rgba(37, 104, 159, 0.5)) !important;
  }
  
  /* Waypoint marker interactions */
  .leaflet-routing-container .leaflet-marker-icon {
    transition: transform 0.2s ease;
    cursor: grab;
  }
  
  .leaflet-routing-container .leaflet-marker-icon:hover {
    transform: scale(1.1);
    cursor: grab;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const RouteMap = ({
  waypoints = [],
  onRouteCalculated,
  onAddLocationToRoute,
  onWaypointLocationChange,
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapType, setMapType] = useState("street");
  const [waypointMarkers, setWaypointMarkers] = useState([]);
  const [routeFitted, setRouteFitted] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    lat: null,
    lng: null,
  });

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Inject route styles
      if (!document.getElementById('route-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'route-styles';
        styleElement.textContent = routeStyles;
        document.head.appendChild(styleElement);
      }

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 6);

      mapInstanceRef.current = map;
      map.tileLayer = initializeMapTileLayer(map, "street");

      map.getContainer().addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
      });

      map.on("contextmenu", function (e) {
        const { lat, lng } = e.latlng;
        const { x, y } = e.containerPoint;
        const mapContainer = map.getContainer();
        const rect = mapContainer.getBoundingClientRect();

        setContextMenu({
          visible: true,
          x: rect.left + x,
          y: rect.top + y,
          lat: lat,
          lng: lng,
        });
      });

      map.on("click", function () {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      });

      map.on("zoomstart movestart", function () {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mouse event handlers for drag feedback
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    let dragTooltip = null;

    // Add drag start feedback
    const handleMouseDown = (e) => {
      const target = e.originalEvent.target;
      if (target && target.tagName === 'path' && target.classList.contains('leaflet-interactive')) {
        // Create drag tooltip
        dragTooltip = document.createElement('div');
        dragTooltip.className = 'route-drag-tooltip';
        dragTooltip.textContent = '🖱️ Drag to modify route';
        dragTooltip.style.left = e.originalEvent.pageX + 'px';
        dragTooltip.style.top = e.originalEvent.pageY + 'px';
        document.body.appendChild(dragTooltip);
      }
    };

    // Update tooltip position during drag
    const handleMouseMove = (e) => {
      if (!mapInstanceRef.current) return;
      if (dragTooltip) {
        dragTooltip.style.left = e.originalEvent.pageX + 'px';
        dragTooltip.style.top = e.originalEvent.pageY + 'px';
      }
    }

    // Remove tooltip on drag end
    const handleMouseUp = () => {
      if (dragTooltip) {
        document.body.removeChild(dragTooltip);
        mapInstanceRef.current.removeControl(routeLayer);
        setRouteLayer(null);
      }
    };

    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);

    return () => {
      // Clean up dragTooltip if it exists
      if (typeof dragTooltip !== 'undefined' && dragTooltip && document.body.contains(dragTooltip)) {
        document.body.removeChild(dragTooltip);
      }
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
    };
  }, [routeLayer]);

  // Context Menu Functions
  const handleShowCoordinatesClick = () => {
    setContextMenu(handleShowCoordinates(contextMenu, mapInstanceRef));
  };

  const handleCopyCoordinatesClick = async () => {
    setContextMenu(await handleCopyCoordinates(contextMenu));
  };

  // Add Location to Route function
  const handleAddLocationToRoute = () => {
    if (contextMenu.lat && contextMenu.lng) {
      const lat = parseFloat(contextMenu.lat.toFixed(6));
      const lng = parseFloat(contextMenu.lng.toFixed(6));
      const coordinatesText = `${lat}, ${lng}`;

      if (onAddLocationToRoute) {
        onAddLocationToRoute(coordinatesText);
      }

      showAddLocationSuccessMessage(coordinatesText);
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Handle marker drag end
  const handleMarkerDragEnd = (waypointId, newLocation) => {
    if (onWaypointLocationChange) {
      onWaypointLocationChange(waypointId, newLocation);
    }
  };

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".route-context-menu")) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  // Handle map type change
  const handleMapTypeChange = (type) => {
    setMapType(type);
    if (mapInstanceRef.current && mapInstanceRef.current.tileLayer) {
      mapInstanceRef.current.removeLayer(mapInstanceRef.current.tileLayer);
      mapInstanceRef.current.tileLayer = initializeMapTileLayer(mapInstanceRef.current, type);
    }
  };

  // Handle zoom
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

  // Handle fit to bounds
  const handleFitToBounds = () => {
    if (mapInstanceRef.current && waypointMarkers.length > 0) {
      const group = new L.featureGroup(waypointMarkers);
      mapInstanceRef.current.fitBounds(group.getBounds(), {
        padding: [20, 20],
      });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([30.3753, 69.3451], 6);
    }
  };

  // Update markers and route when waypoints change
  useEffect(() => {
    const updateMarkersAndRoute = async () => {
      if (!mapInstanceRef.current) return;

      // Clear existing markers
      waypointMarkers.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      setWaypointMarkers([]);

      // Clear existing route
      if (routeLayer) {
        mapInstanceRef.current.removeControl(routeLayer);
        setRouteLayer(null);
      }

      // Check if waypoints array is empty or all locations are empty
      const hasValidWaypoints =
        waypoints &&
        waypoints.length > 0 &&
        waypoints.some((wp) => wp.location && wp.location.trim() !== "");

      if (!hasValidWaypoints) {
        dispatch(setRouteCalculationData(null));
        if (onRouteCalculated) {
          onRouteCalculated(null);
        }
        return;
      }

      // Filter waypoints with valid locations
      const validWaypoints = waypoints.filter((wp) => {
        if (!wp.location || !wp.location.trim()) return false;

        // Check if it's coordinates
        const coords = wp.location
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          return true;
        }

        // For text locations, only process if they seem complete
        return wp.location.length > 10;
      });

      // If no valid waypoints after filtering, clear everything
      if (validWaypoints.length === 0) {
        dispatch(setRouteCalculationData(null));
        if (onRouteCalculated) {
          onRouteCalculated(null);
        }
        return;
      }

      // If only 1 waypoint, show marker but no route
      if (validWaypoints.length === 1) {
        const waypoint = validWaypoints[0];
        const coords = await geocodeLocation(waypoint.location);

        if (coords) {
          const marker = createDraggableWaypointMarker(
            waypoint,
            coords,
            true,
            true,
            mapInstanceRef.current,
            handleMarkerDragEnd
          );
          setWaypointMarkers([marker]);
          // Center and zoom to the first waypoint
          mapInstanceRef.current.setView([coords.lat, coords.lng], 15, { animate: true });
        }

        dispatch(setRouteCalculationData(null));
        if (onRouteCalculated) {
          onRouteCalculated(null);
        }
        return;
      }

      const newMarkers = [];
      const waypointCoords = [];

      // Process each waypoint (only if 2 or more)
      for (let i = 0; i < validWaypoints.length; i++) {
        const waypoint = validWaypoints[i];
        const coords = await geocodeLocation(waypoint.location);

        if (coords) {
          waypointCoords.push(coords);

          const isStart = i === 0;
          const isEnd = i === validWaypoints.length - 1;

          const marker = createDraggableWaypointMarker(
            waypoint,
            coords,
            isStart,
            isEnd,
            mapInstanceRef.current,
            handleMarkerDragEnd
          );
          
          newMarkers.push(marker);
        }
      }

      setWaypointMarkers(newMarkers);

      // Calculate route with Leaflet Routing Machine
      if (waypointCoords.length >= 2) {
        await calculateMultiWaypointRoute(
          waypointCoords, 
          routeLayer, 
          mapInstanceRef, 
          setRouteLayer, 
          dispatch, 
          setRouteCalculationData, 
          onRouteCalculated
        );
      } else {
        dispatch(setRouteCalculationData(null));
        if (onRouteCalculated) {
          onRouteCalculated(null);
        }
      }

      // Auto-fit bounds only once when route is first calculated
      if (!routeFitted && newMarkers.length > 0) {
        const group = new L.featureGroup(newMarkers);
        mapInstanceRef.current.fitBounds(group.getBounds(), {
          padding: [20, 20],
        });
        setRouteFitted(true);
      }
    };

    updateMarkersAndRoute();
  }, [waypoints]);

  // Reset routeFitted when waypoints change
  useEffect(() => {
    setRouteFitted(false);
  }, [waypoints]);

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="route-context-menu fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-[10000]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            minWidth: "200px",
          }}
        >
          <button
            onClick={handleShowCoordinatesClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#25689f]/10 hover:text-[#25689f] flex items-center"
          >
            <MapPin size={16} className="mr-3 text-gray-500" />
            Show Coordinates
          </button>
          <button
            onClick={handleCopyCoordinatesClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#25689f]/10 hover:text-[#25689f] flex items-center"
          >
            <Copy size={16} className="mr-3 text-gray-500" />
            Copy Coordinates
          </button>
          <button
            onClick={handleAddLocationToRoute}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#25689f]/10 hover:text-[#25689f] flex items-center"
          >
            <Navigation size={16} className="mr-3 text-[#25689f]" />
            Add to Route
          </button>
        </div>
      )}

      {/* Map Type Toggle */}
      <div className="absolute top-3 left-3 z-[1000]">
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
      <div className="absolute top-3 right-3 z-[1000]">
        <div className="flex flex-col space-y-2">
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
      </div>

      {/* Fit to Bounds Button */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFitToBounds}
          className="flex items-center px-3 py-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 text-xs font-medium transition-all duration-200"
        >
          <Maximize size={14} className="mr-1.5" />
          Fit View
        </motion.button>
      </div>
    </div>
  );
};

export default RouteMap;

