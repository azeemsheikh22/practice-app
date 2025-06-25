import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Globe,
  Satellite,
  Maximize,
  Trash2,
  MapPin,
  ChevronDown,
} from "lucide-react"; // ChevronDown add kiya
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import polygonIcon from "../../../assets/polygon.PNG";
import circleIcon from "../../../assets/circle.PNG";
import rectangleIcon from "../../../assets/rectangle.PNG";
import polylineIcon from "../../../assets/polyline.PNG";
import { useSelector, useDispatch } from "react-redux";
import { clearSelectedLocation } from "../../../features/locationSearchSlice";
import GeofenceAdvancedOptionsModal from "./GeofenceAdvancedOptionsModal";

const GeofenceMap = ({
  mapType,
  setMapType,
  activeTool,
  setActiveTool,
  onGeofenceDrawn,
}) => {
  // Existing state variables...
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const currentDrawingRef = useRef(null);

  const [hasDrawnGeofence, setHasDrawnGeofence] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingPolygonPoints, setPendingPolygonPoints] = useState([]);
  const [tempPolygon, setTempPolygon] = useState(null);
  const [pendingPolylinePoints, setPendingPolylinePoints] = useState([]);
  const [tempPolyline, setTempPolyline] = useState(null);

  // New state for Add to Map dropdown
  const [isAddToMapOpen, setIsAddToMapOpen] = useState(false);
  const [suggestedGeofenceChecked, setSuggestedGeofenceChecked] =
    useState(false);
  const [geofencesChecked, setGeofencesChecked] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  const dispatch = useDispatch();
  const { selectedLocation } = useSelector((state) => state.locationSearch);
  const [locationMarker, setLocationMarker] = useState(null);

  // Handle Add to Map dropdown
  const handleAddToMapClick = () => {
    setIsAddToMapOpen(!isAddToMapOpen);
  };

  // Handle checkbox changes
  const handleSuggestedGeofenceChange = (e) => {
    setSuggestedGeofenceChecked(e.target.checked);
  };

  const handleGeofencesChange = (e) => {
    setGeofencesChecked(e.target.checked);
  };

  // handleAdvanceOptions function update karein
  const handleAdvanceOptions = () => {
    setShowAdvanceModal(true);
    setIsAddToMapOpen(false);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAddToMapOpen && !event.target.closest(".add-to-map-container")) {
        setIsAddToMapOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddToMapOpen]);
  // Enhanced drawing tool handlers
  const handleDrawingTool = (toolType) => {
    if (!mapInstanceRef.current) return;

    // Stop any active drawing
    if (currentDrawingRef.current) {
      mapInstanceRef.current.off("click", currentDrawingRef.current);
      mapInstanceRef.current.off("dblclick");
      mapInstanceRef.current.off("mousemove");
      currentDrawingRef.current = null;
    }

    // If same tool clicked, deactivate it
    if (activeTool === toolType) {
      setActiveTool(null);
      setIsDrawing(false);
      return;
    }

    setActiveTool(toolType);
    setIsDrawing(true);

    // Clear previous drawings with confirmation if exists
    if (hasDrawnGeofence) {
      const confirmed = window.confirm(
        "This will clear your current geofence. Continue?"
      );
      if (!confirmed) {
        setActiveTool(null);
        setIsDrawing(false);
        return;
      }
    }

    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setHasDrawnGeofence(false);
    }

    switch (toolType) {
      case "rectangle":
        startRectangleDrawing();
        break;
      case "circle":
        startCircleDrawing();
        break;
      case "polygon":
        startPolygonDrawing();
        break;
      case "polyline":
        startPolylineDrawing();
        break;
      default:
        setActiveTool(null);
        setIsDrawing(false);
    }
  };

  // Rectangle drawing
  const startRectangleDrawing = () => {
    let startPoint = null;
    let rectangle = null;

    const onMapClick = (e) => {
      if (!startPoint) {
        startPoint = e.latlng;

        rectangle = L.rectangle([startPoint, startPoint], {
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.25,
          weight: 3,
          dashArray: "10, 5",
        }).addTo(mapInstanceRef.current);

        const onMouseMove = (e) => {
          if (rectangle) {
            rectangle.setBounds([startPoint, e.latlng]);
          }
        };

        mapInstanceRef.current.on("mousemove", onMouseMove);

        const onSecondClick = (e) => {
          mapInstanceRef.current.off("mousemove", onMouseMove);
          mapInstanceRef.current.off("click", onSecondClick);

          rectangle.setStyle({
            color: "#D52B1E",
            fillColor: "#D52B1E",
            fillOpacity: 0.2,
            weight: 2,
            dashArray: null,
          });

          rectangle.setBounds([startPoint, e.latlng]);
          drawnItemsRef.current.addLayer(rectangle);

          setHasDrawnGeofence(true);
          setIsDrawing(false);
          setActiveTool(null);

          const geofenceData = {
            type: "rectangle",
            bounds: rectangle.getBounds(),
            area: calculateRectangleArea(rectangle.getBounds()),
          };
          onGeofenceDrawn && onGeofenceDrawn(geofenceData);

          currentDrawingRef.current = null;
        };

        mapInstanceRef.current.once("click", onSecondClick);
      }
    };

    currentDrawingRef.current = onMapClick;
    mapInstanceRef.current.on("click", onMapClick);
  };

  // Circle drawing
  const startCircleDrawing = () => {
    let centerPoint = null;
    let circle = null;

    const onMapClick = (e) => {
      if (!centerPoint) {
        centerPoint = e.latlng;

        circle = L.circle(centerPoint, {
          radius: 100,
          color: "#10B981",
          fillColor: "#10B981",
          fillOpacity: 0.25,
          weight: 3,
          dashArray: "10, 5",
        }).addTo(mapInstanceRef.current);

        const onMouseMove = (e) => {
          if (circle) {
            const radius = centerPoint.distanceTo(e.latlng);
            circle.setRadius(radius);
          }
        };

        mapInstanceRef.current.on("mousemove", onMouseMove);

        const onSecondClick = (e) => {
          mapInstanceRef.current.off("mousemove", onMouseMove);
          mapInstanceRef.current.off("click", onSecondClick);

          const radius = centerPoint.distanceTo(e.latlng);

          circle.setStyle({
            color: "#D52B1E",
            fillColor: "#D52B1E",
            fillOpacity: 0.2,
            weight: 2,
            dashArray: null,
          });

          circle.setRadius(radius);
          drawnItemsRef.current.addLayer(circle);

          setHasDrawnGeofence(true);
          setIsDrawing(false);
          setActiveTool(null);

          const geofenceData = {
            type: "circle",
            center: centerPoint,
            radius: radius,
            area: Math.PI * radius * radius,
          };
          onGeofenceDrawn && onGeofenceDrawn(geofenceData);

          currentDrawingRef.current = null;
        };

        mapInstanceRef.current.once("click", onSecondClick);
      }
    };

    currentDrawingRef.current = onMapClick;
    mapInstanceRef.current.on("click", onMapClick);
  };

  // Polygon drawing with finish button
  const startPolygonDrawing = () => {
    let points = [];
    let polygon = null;
    let markers = []; // Add markers array to track point markers
    setPendingPolygonPoints([]);

    const onMapClick = (e) => {
      points.push(e.latlng);
      setPendingPolygonPoints([...points]);

      // Create a visible marker for each point
      const marker = L.circleMarker(e.latlng, {
        radius: 8, // Point size
        fillColor: "#8B5CF6",
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current);

      markers.push(marker);

      if (points.length === 1) {
        polygon = L.polygon([points], {
          color: "#8B5CF6",
          fillColor: "#8B5CF6",
          fillOpacity: 0.25,
          weight: 3,
          dashArray: "10, 5",
        }).addTo(mapInstanceRef.current);
        setTempPolygon(polygon);
      } else {
        polygon.setLatLngs([points]);
      }
    };

    currentDrawingRef.current = onMapClick;
    mapInstanceRef.current.on("click", onMapClick);
  };

  // Finish polygon drawing
  const finishPolygonDrawing = () => {
    if (pendingPolygonPoints.length >= 3 && tempPolygon) {
      tempPolygon.setStyle({
        color: "#D52B1E",
        fillColor: "#D52B1E",
        fillOpacity: 0.2,
        weight: 2,
        dashArray: null,
      });

      drawnItemsRef.current.addLayer(tempPolygon);

      // Remove temporary point markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (
          layer instanceof L.CircleMarker &&
          layer.options.fillColor === "#8B5CF6"
        ) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      setHasDrawnGeofence(true);
      setIsDrawing(false);
      setActiveTool(null);
      setPendingPolygonPoints([]);
      setTempPolygon(null);

      // Clean up event listeners
      if (currentDrawingRef.current) {
        mapInstanceRef.current.off("click", currentDrawingRef.current);
        currentDrawingRef.current = null;
      }

      const geofenceData = {
        type: "polygon",
        coordinates: pendingPolygonPoints,
        area: calculatePolygonArea(pendingPolygonPoints),
      };
      onGeofenceDrawn && onGeofenceDrawn(geofenceData);
    }
  };

  // Helper functions for area calculation (make sure this exists)
  const calculateRectangleArea = (bounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const width = ne.distanceTo(L.latLng(ne.lat, sw.lng));
    const height = ne.distanceTo(L.latLng(sw.lat, ne.lng));
    return ((width * height) / 1000000).toFixed(2); // Convert to km²
  };

  const calculatePolygonArea = (points) => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    return Math.abs(((area / 2) * 111320 * 111320) / 1000000).toFixed(2);
  };

  // Polyline drawing function add karein
  const startPolylineDrawing = () => {
    let points = [];
    let polyline = null;
    let markers = []; // Add markers array to track point markers
    setPendingPolylinePoints([]);

    const onMapClick = (e) => {
      points.push(e.latlng);
      setPendingPolylinePoints([...points]);

      // Create a visible marker for each point
      const marker = L.circleMarker(e.latlng, {
        radius: 8, // Point size
        fillColor: "#F59E0B",
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current);

      markers.push(marker);

      if (points.length === 1) {
        polyline = L.polyline([points], {
          color: "#F59E0B",
          weight: 4,
          dashArray: "10, 5",
          opacity: 0.8,
        }).addTo(mapInstanceRef.current);
        setTempPolyline(polyline);
      } else {
        polyline.setLatLngs(points);
      }
    };

    currentDrawingRef.current = onMapClick;
    mapInstanceRef.current.on("click", onMapClick);
  };

  // Finish polyline drawing
  const finishPolylineDrawing = () => {
    if (pendingPolylinePoints.length >= 2 && tempPolyline) {
      tempPolyline.setStyle({
        color: "#D52B1E",
        weight: 3,
        dashArray: null,
        opacity: 1,
      });

      drawnItemsRef.current.addLayer(tempPolyline);

      // Remove temporary point markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (
          layer instanceof L.CircleMarker &&
          layer.options.fillColor === "#F59E0B"
        ) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      setHasDrawnGeofence(true);
      setIsDrawing(false);
      setActiveTool(null);
      setPendingPolylinePoints([]);
      setTempPolyline(null);

      // Clean up event listeners
      if (currentDrawingRef.current) {
        mapInstanceRef.current.off("click", currentDrawingRef.current);
        currentDrawingRef.current = null;
      }

      const geofenceData = {
        type: "polyline",
        coordinates: pendingPolylinePoints,
        length: calculatePolylineLength(pendingPolylinePoints),
      };
      onGeofenceDrawn && onGeofenceDrawn(geofenceData);
    }
  };

  // Calculate polyline length
  const calculatePolylineLength = (points) => {
    if (points.length < 2) return 0;
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalLength += points[i].distanceTo(points[i + 1]);
    }
    return (totalLength / 1000).toFixed(2); // Convert to km
  };

  const handleClearAll = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setHasDrawnGeofence(false);
      setActiveTool(null);
      setIsDrawing(false);
      setPendingPolygonPoints([]);
      setPendingPolylinePoints([]);
      setTempPolygon(null);
      setTempPolyline(null);
      setLocationMarker(null); // Clear location marker
      onGeofenceDrawn && onGeofenceDrawn(null);
    }
  };

  // Fit to bounds function
  const handleFitToBounds = () => {
    if (mapInstanceRef.current && drawnItemsRef.current) {
      const group = drawnItemsRef.current;
      if (group.getLayers().length > 0) {
        mapInstanceRef.current.fitBounds(group.getBounds(), {
          padding: [20, 20],
        });
      } else {
        mapInstanceRef.current.setView([30.3753, 69.3451], 6);
      }
    }
  };

  // useEffect for handling selected location - With editable corners
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      // Remove previous marker
      if (locationMarker) {
        mapInstanceRef.current.removeLayer(locationMarker);
      }

      const lat = selectedLocation.lat;
      const lon = selectedLocation.lon;

      // Create rectangle bounds
      const offset = 0.0045;
      const bounds = [
        [lat - offset, lon - offset],
        [lat + offset, lon + offset],
      ];

      // Create rectangle
      const rectangle = L.rectangle(bounds, {
        color: "#D52B1E",
        fillColor: "#D52B1E",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(mapInstanceRef.current);

      // Add corner markers for editing
      const cornerMarkers = [];
      const corners = [
        { pos: [lat - offset, lon - offset], name: "SW" }, // Southwest
        { pos: [lat - offset, lon + offset], name: "SE" }, // Southeast
        { pos: [lat + offset, lon + offset], name: "NE" }, // Northeast
        { pos: [lat + offset, lon - offset], name: "NW" }, // Northwest
      ];

      corners.forEach((corner, index) => {
        const marker = L.circleMarker(corner.pos, {
          radius: 8,
          fillColor: "#FFFFFF",
          color: "#D52B1E",
          weight: 3,
          opacity: 1,
          fillOpacity: 1,
          draggable: false,
        }).addTo(mapInstanceRef.current);

        // Add tooltip
        marker.bindTooltip(`Drag to resize (${corner.name})`, {
          permanent: false,
          direction: "top",
          offset: [0, -10],
        });

        // Make corner draggable
        let isDragging = false;

        marker.on("mousedown", function (e) {
          isDragging = true;
          mapInstanceRef.current.dragging.disable();

          // Change appearance when dragging
          marker.setStyle({
            radius: 10,
            fillColor: "#D52B1E",
            color: "#FFFFFF",
          });
        });

        // Handle drag movement
        mapInstanceRef.current.on("mousemove", function (e) {
          if (isDragging) {
            const newPos = e.latlng;
            marker.setLatLng(newPos);

            // Update rectangle bounds
            const currentBounds = rectangle.getBounds();
            let newBounds;

            switch (index) {
              case 0: // Southwest corner
                newBounds = L.latLngBounds(
                  newPos,
                  currentBounds.getNorthEast()
                );
                break;
              case 1: // Southeast corner
                newBounds = L.latLngBounds(
                  [newPos.lat, currentBounds.getWest()],
                  [currentBounds.getNorth(), newPos.lng]
                );
                break;
              case 2: // Northeast corner
                newBounds = L.latLngBounds(
                  currentBounds.getSouthWest(),
                  newPos
                );
                break;
              case 3: // Northwest corner
                newBounds = L.latLngBounds(
                  [currentBounds.getSouth(), newPos.lng],
                  [newPos.lat, currentBounds.getEast()]
                );
                break;
            }

            rectangle.setBounds(newBounds);

            // Update other corner markers positions
            updateCornerMarkers(rectangle, cornerMarkers);
          }
        });

        // Handle drag end
        mapInstanceRef.current.on("mouseup", function (e) {
          if (isDragging) {
            isDragging = false;
            mapInstanceRef.current.dragging.enable();

            // Reset appearance
            marker.setStyle({
              radius: 8,
              fillColor: "#FFFFFF",
              color: "#D52B1E",
            });

            // Update geofence data
            if (onGeofenceDrawn) {
              const geofenceData = {
                type: "rectangle",
                bounds: rectangle.getBounds(),
                area: calculateRectangleArea(rectangle.getBounds()),
                fromSearch: true,
                edited: true,
              };
              onGeofenceDrawn(geofenceData);
            }
          }
        });

        cornerMarkers.push(marker);
      });

      // Function to update corner markers when rectangle changes
      const updateCornerMarkers = (rect, markers) => {
        const bounds = rect.getBounds();
        const positions = [
          bounds.getSouthWest(), // SW
          bounds.getSouthEast(), // SE
          bounds.getNorthEast(), // NE
          bounds.getNorthWest(), // NW
        ];

        markers.forEach((marker, i) => {
          marker.setLatLng(positions[i]);
        });
      };

      // Add to drawn items
      if (drawnItemsRef.current) {
        drawnItemsRef.current.addLayer(rectangle);
        cornerMarkers.forEach((marker) => {
          drawnItemsRef.current.addLayer(marker);
        });
        setHasDrawnGeofence(true);
      }

      // Set view
      mapInstanceRef.current.setView([lat, lon], 15);

      setLocationMarker({ rectangle, corners: cornerMarkers });

      // Callback
      if (onGeofenceDrawn) {
        const geofenceData = {
          type: "rectangle",
          bounds: rectangle.getBounds(),
          area: calculateRectangleArea(rectangle.getBounds()),
          fromSearch: true,
        };
        onGeofenceDrawn(geofenceData);
      }

      // Clear immediately
      dispatch(clearSelectedLocation());
    }
  }, [selectedLocation, dispatch]);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 6);

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

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Component ke end mein yeh updated style add karein
  useEffect(() => {
    // Add custom CSS for point tooltips
    const style = document.createElement("style");
    style.textContent = `

    .polyline-point-tooltip {
      background: #F59E0B !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      font-size: 11px !important;
      font-weight: bold !important;
      padding: 2px 6px !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    }
    .polyline-point-tooltip::before {
      border-top-color: #F59E0B !important;
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
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

  return (
    <div className="relative h-full">
      {showAdvanceModal && (
        <GeofenceAdvancedOptionsModal
          isOpen={showAdvanceModal}
          onClose={() => setShowAdvanceModal(false)}
        />
      )}
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
                ? "bg-[#D52B1E] text-white shadow-sm"
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
                ? "bg-[#D52B1E] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Satellite size={14} className="mr-1.5" />
            <span className="hidden sm:inline">Satellite</span>
          </motion.button>
        </div>
      </div>
      {/* Add to Map Button - New Addition */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[1000] add-to-map-container">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToMapClick}
            className="flex items-center px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 text-sm font-medium transition-all duration-200"
          >
            <MapPin size={16} className="mr-2" />
            Add to Map
            <ChevronDown
              size={14}
              className={`ml-2 transition-transform duration-200 ${
                isAddToMapOpen ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isAddToMapOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[1001]"
              >
                {/* Suggested Geofence Option */}
                <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-150">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={suggestedGeofenceChecked}
                      onChange={handleSuggestedGeofenceChange}
                      className="w-4 h-4 text-[#D52B1E] bg-gray-100 border-gray-300 rounded focus:ring-[#D52B1E] focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Suggested Geofence
                    </span>
                  </label>
                </div>

                {/* Geofences Option */}
                <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-150">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={geofencesChecked}
                      onChange={handleGeofencesChange}
                      className="w-4 h-4 text-[#D52B1E] bg-gray-100 border-gray-300 rounded focus:ring-[#D52B1E] focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Geofences
                    </span>
                  </label>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-2"></div>

                {/* Advance Options */}
                <div className="px-4 py-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdvanceOptions}
                    className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-[#D52B1E] to-[#B8241A] text-white rounded-md hover:from-[#B8241A] hover:to-[#A01E17] transition-all duration-200 text-sm font-medium shadow-sm"
                  >
                    <Plus size={14} className="mr-2" />
                    Advance Options
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

          {/* Drawing Tools - Moved below zoom controls */}
          <div className="flex flex-col space-y-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDrawingTool("rectangle")}
              className={`flex items-center justify-center cursor-pointer p-2 rounded-md transition-all duration-200 ${
                activeTool === "rectangle"
                  ? "bg-blue-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              title="Rectangle Tool"
            >
              <img src={rectangleIcon} alt="rectangle" className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDrawingTool("circle")}
              className={`flex items-center justify-center cursor-pointer p-2 rounded-md transition-all duration-200 ${
                activeTool === "circle"
                  ? "bg-green-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              title="Circle Tool"
            >
              <img src={circleIcon} alt="circle" className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDrawingTool("polygon")}
              className={`flex items-center justify-center cursor-pointer p-2 rounded-md transition-all duration-200 ${
                activeTool === "polygon"
                  ? "bg-purple-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              title="Polygon Tool"
            >
              <img src={polygonIcon} alt="polygon" className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDrawingTool("polyline")}
              className={`flex items-center justify-center cursor-pointer p-2 rounded-md transition-all duration-200 ${
                activeTool === "polyline"
                  ? "bg-yellow-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              title="Polyline Tool"
            >
              <img src={polylineIcon} alt="polyline" className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
      {/* Action Controls */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <div className="flex items-center space-x-2">
          {/* Fit to Bounds */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFitToBounds}
            className="flex items-center px-3 py-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 text-xs font-medium transition-all duration-200"
          >
            <Maximize size={14} className="mr-1.5" />
            Fit View
          </motion.button>

          {/* Clear All */}
          {hasDrawnGeofence && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAll}
              className="flex items-center px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-lg text-xs font-medium transition-all duration-200"
            >
              <Trash2 size={14} className="mr-1.5" />
              Clear
            </motion.button>
          )}
        </div>
      </div>
      {/* Polygon Finish Button */}
      <AnimatePresence>
        {activeTool === "polygon" && pendingPolygonPoints.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-[1000]"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={finishPolygonDrawing}
              className="flex items-center px-6 py-3 bg-[#D52B1E] text-white hover:bg-red-600 rounded-lg shadow-lg text-sm font-medium transition-all duration-200"
            >
              Finish Polygon ({pendingPolygonPoints.length} points)
            </motion.button>
          </motion.div>
        )}

        {activeTool === "polyline" && pendingPolylinePoints.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-[1000]"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={finishPolylineDrawing}
              className="flex items-center px-6 py-3 bg-[#D52B1E] text-white hover:bg-red-600 rounded-lg shadow-lg text-sm font-medium transition-all duration-200"
            >
              Finish Polyline ({pendingPolylinePoints.length} points)
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Drawing Status */}
      <AnimatePresence>
        {isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000]"
          >
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
              {activeTool === "rectangle" &&
                "Click to start, click again to finish rectangle"}
              {activeTool === "circle" &&
                "Click center, then click to set radius"}
              {activeTool === "polygon" &&
                `Click to add points (${pendingPolygonPoints.length} added)`}
              {activeTool === "polyline" &&
                `Click to add points (${pendingPolylinePoints.length} added)`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeofenceMap;
