import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Globe, Satellite, Maximize } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RouteMap = ({
  startLocation,
  endLocation,
  waypoints,
  onRouteCalculated,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapType, setMapType] = useState("street");
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [waypointMarkers, setWaypointMarkers] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 6); // Pakistan center

      mapInstanceRef.current = map;

      const tileLayer = L.tileLayer(
        "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
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
          ? "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

      const newTileLayer = L.tileLayer(tileUrl, {
        minZoom: 3,
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google",
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.tileLayer = newTileLayer;
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

  // Fit to bounds function
  const handleFitToBounds = () => {
    if (mapInstanceRef.current) {
      const bounds = [];
      
      if (startMarker) bounds.push(startMarker.getLatLng());
      if (endMarker) bounds.push(endMarker.getLatLng());
      waypointMarkers.forEach(marker => bounds.push(marker.getLatLng()));

      if (bounds.length > 0) {
        const group = new L.featureGroup(bounds.map(latlng => L.marker(latlng)));
        mapInstanceRef.current.fitBounds(group.getBounds(), {
          padding: [20, 20],
        });
      } else {
        mapInstanceRef.current.setView([30.3753, 69.3451], 6);
      }
    }
  };

  // Create custom icons
  const createCustomIcon = (color, text) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">${text}</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  // Geocode location (simplified - you might want to use a proper geocoding service)
  const geocodeLocation = async (locationString) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationString
        )}&limit=1&countrycodes=pk`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
  };

  // Update markers when locations change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;

      // Clear existing markers
      if (startMarker) {
        mapInstanceRef.current.removeLayer(startMarker);
        setStartMarker(null);
      }
      if (endMarker) {
        mapInstanceRef.current.removeLayer(endMarker);
        setEndMarker(null);
      }
      waypointMarkers.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      setWaypointMarkers([]);

      // Add start marker
      if (startLocation) {
        const coords = await geocodeLocation(startLocation);
        if (coords) {
          const marker = L.marker([coords.lat, coords.lng], {
            icon: createCustomIcon('#22c55e', 'S')
          }).addTo(mapInstanceRef.current);
          
          marker.bindPopup(`<b>Start:</b> ${startLocation}`);
          setStartMarker(marker);
        }
      }

      // Add end marker
      if (endLocation) {
        const coords = await geocodeLocation(endLocation);
        if (coords) {
          const marker = L.marker([coords.lat, coords.lng], {
            icon: createCustomIcon('#ef4444', 'E')
          }).addTo(mapInstanceRef.current);
          
          marker.bindPopup(`<b>End:</b> ${endLocation}`);
          setEndMarker(marker);
        }
      }

      // Add waypoint markers
      if (waypoints && waypoints.length > 0) {
        const newWaypointMarkers = [];
        for (let i = 0; i < waypoints.length; i++) {
          if (waypoints[i]) {
            const coords = await geocodeLocation(waypoints[i]);
            if (coords) {
              const marker = L.marker([coords.lat, coords.lng], {
                icon: createCustomIcon('#3b82f6', (i + 1).toString())
              }).addTo(mapInstanceRef.current);
              
              marker.bindPopup(`<b>Waypoint ${i + 1}:</b> ${waypoints[i]}`);
              newWaypointMarkers.push(marker);
            }
          }
        }
        setWaypointMarkers(newWaypointMarkers);
      }
    };

    updateMarkers();
  }, [startLocation, endLocation, waypoints]);

  // Calculate route when start and end locations are available
  useEffect(() => {
    const calculateRoute = async () => {
      if (!startLocation || !endLocation || !mapInstanceRef.current) return;

      try {
        const startCoords = await geocodeLocation(startLocation);
        const endCoords = await geocodeLocation(endLocation);

        if (startCoords && endCoords) {
          // Simple route calculation using OSRM (you can replace with your preferred routing service)
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`
          );
          
          const data = await response.json();
          
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            // Remove existing route
            if (routeLayer) {
              mapInstanceRef.current.removeLayer(routeLayer);
            }

            // Add new route
            const routeLine = L.geoJSON(route.geometry, {
              style: {
                color: '#3b82f6',
                weight: 4,
                opacity: 0.8,
              }
            }).addTo(mapInstanceRef.current);

            setRouteLayer(routeLine);

            // Fit map to route
            mapInstanceRef.current.fitBounds(routeLine.getBounds(), {
              padding: [20, 20],
            });

            // Call callback with route data
            if (onRouteCalculated) {
              onRouteCalculated({
                distance: `${(route.distance / 1000).toFixed(1)} km`,
                duration: `${Math.round(route.duration / 60)} min`,
                geometry: route.geometry,
              });
            }
          }
        }
      } catch (error) {
        console.error("Route calculation error:", error);
      }
    };

    calculateRoute();
  }, [startLocation, endLocation, onRouteCalculated]);

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Type Toggle */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleMapTypeChange("street")}
            className={`flex items-center cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mapType === "street"
                ? "bg-blue-500 text-white shadow-sm"
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
                ? "bg-blue-500 text-white shadow-sm"
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
          {/* Zoom Buttons */}
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
