import React, { useRef, useEffect, useState } from "react";
import {
  Plus,
  Minus,
  Globe,
  Satellite,
  Maximize,
  // MapPin,
  // ChevronDown,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { useSelector, useDispatch } from "react-redux";
import { clearSelectedLocation } from "../../../features/locationSearchSlice";
import GeofenceAdvancedOptionsModal from "./GeofenceAdvancedOptionsModal";

// Import marker images directly
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Circle Edit Fix - Override L.Edit.Circle
L.Edit.Circle = L.Edit.CircleMarker.extend({
  _createResizeMarker: function () {
    var center = this._shape.getLatLng(),
      resizemarkerPoint = this._getResizeMarkerPoint(center);
    this._resizeMarkers = [];
    this._resizeMarkers.push(
      this._createMarker(resizemarkerPoint, this.options.resizeIcon)
    );
  },
  _getResizeMarkerPoint: function (latlng) {
    var delta = this._shape._radius * Math.cos(Math.PI / 4),
      point = this._map.project(latlng);
    return this._map.unproject([point.x + delta, point.y - delta]);
  },
  _resize: function (latlng) {
    var moveLatLng = this._moveMarker.getLatLng();
    var radius;
    if (L.GeometryUtil && L.GeometryUtil.isVersion07x()) {
      radius = moveLatLng.distanceTo(latlng);
    } else {
      radius = this._map.distance(moveLatLng, latlng);
    }
    // **** This fixes the circle resizing ****
    this._shape.setRadius(radius);
    this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape });
  },
});


const GeofenceMap = ({
  mapType,
  setMapType,
  onGeofenceDrawn,
  editMode,
  editGeofenceData,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const drawControlRef = useRef(null);
  const [isAddToMapOpen, setIsAddToMapOpen] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // For radius input UI
  const [activeCircle, setActiveCircle] = useState(null);
  const [radiusInput, setRadiusInput] = useState(0);

  const dispatch = useDispatch();
  const { selectedLocation } = useSelector((state) => state.locationSearch);
  const { selectedCategoryForDrawing } = useSelector((state) => state.geofence);

  // ✅ Get shape color based on selected category
  const getShapeColor = () => {
    if (selectedCategoryForDrawing && selectedCategoryForDrawing.color) {
      return `#${selectedCategoryForDrawing.color}`;
    }
    return "#25689f"; // Default color
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      try {
        setIsLoading(true);

        const map = L.map(mapRef.current, {
          center: [30.3753, 69.3451],
          zoom: 6,
          zoomControl: false,
          attributionControl: false,
          tap: true,
          touchZoom: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
        });

        const tileLayer = L.tileLayer(
          "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          {
            minZoom: 3,
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: "© Google",
            errorTileUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          }
        );

        tileLayer.on("tileerror", (e) => {
          // console.warn("Tile loading error:", e);
        });

        tileLayer.addTo(map);
        map.tileLayer = tileLayer;

        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        const drawControl = new L.Control.Draw({
          position: "topright",
          draw: {
            polyline: {
              shapeOptions: {
                color: getShapeColor(),
                weight: 4,
                opacity: 0.8,
              },
              allowIntersection: false,
              showLength: true,
              metric: true,
              feet: false,
              nautic: false,
            },
            polygon: {
              allowIntersection: false,
              drawError: {
                color: "#e74c3c",
                message: "<strong>Error:</strong> Shape edges cannot cross!",
                timeout: 2000,
              },
              shapeOptions: {
                color: getShapeColor(),
                fillColor: getShapeColor(),
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8,
              },
              metric: true,
              precision: {},
            },
            circle: {
              shapeOptions: {
                color: getShapeColor(),
                fillColor: getShapeColor(),
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8,
              },
              showRadius: true,
              metric: true,
              feet: false,
              nautic: false,
            },
            rectangle: {
              shapeOptions: {
                color: getShapeColor(),
                fillColor: getShapeColor(),
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8,
              },
              showArea: false,
              metric: true,
            },
            marker: false,
            circlemarker: false,
          },
          edit: {
            featureGroup: drawnItems,
            remove: true,
            edit: {
              selectedPathOptions: {
                maintainColor: true,
                opacity: 0.6,
                dashArray: "10, 10",
                fill: true,
                fillColor: "#fe57a1",
                fillOpacity: 0.1,
                weight: 2,
              },
            },
          },
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        // CREATED event - clear previous shapes
        map.on(L.Draw.Event.CREATED, (e) => {
          try {
            const layer = e.layer;
            const layerType = e.layerType;

            // Clear previous drawings
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);

            // If circle, set up radius input
            if (layerType === 'circle') {
              setActiveCircle(layer);
              setRadiusInput(Math.round(layer.getRadius()));
            } else {
              setActiveCircle(null);
            }

            const geofenceData = calculateGeofenceData(layer, layerType);
            if (geofenceData && onGeofenceDrawn) {
              onGeofenceDrawn(geofenceData);
            }

            setError(null);
          } catch (error) {
            console.error("Error creating geofence:", error);
            setError("Failed to create geofence. Please try again.");
          }
        });

        // EDITED event
        map.on(L.Draw.Event.EDITED, (e) => {
          try {
            const layers = e.layers;
            layers.eachLayer((layer) => {
              const layerType = getLayerType(layer);
              if (layerType === 'circle') {
                setActiveCircle(layer);
                setRadiusInput(Math.round(layer.getRadius()));
              } else {
                setActiveCircle(null);
              }
              const geofenceData = calculateGeofenceData(layer, layerType);
              if (geofenceData && onGeofenceDrawn) {
                onGeofenceDrawn(geofenceData);
              }
            });
            setError(null);
          } catch (error) {
            console.error("Error editing geofence:", error);
            setError("Failed to edit geofence. Please try again.");
          }
        });

        map.on(L.Draw.Event.DELETED, (e) => {
          try {
            if (drawnItems.getLayers().length === 0) {
              onGeofenceDrawn && onGeofenceDrawn(null);
            }
            setError(null);
          } catch (error) {
            console.error("Error deleting geofence:", error);
            setError("Failed to delete geofence. Please try again.");
          }
        });

        // Clear previous shapes when starting new draw
        map.on(L.Draw.Event.DRAWSTART, () => {
          drawnItems.clearLayers();
          setActiveCircle(null);
          setError(null);
        });

        // Listen for circle selection (edit mode)
        map.on('click', function (e) {
          let found = false;
          drawnItems.eachLayer((layer) => {
            if (layer instanceof L.Circle && layer.getBounds().contains(e.latlng)) {
              setActiveCircle(layer);
              setRadiusInput(Math.round(layer.getRadius()));
              found = true;
            }
          });
          if (!found) setActiveCircle(null);
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to initialize map. Please refresh the page.");
        setIsLoading(false);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, []);

  // ✅ Update existing shapes when category changes
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      drawnItemsRef.current &&
      selectedCategoryForDrawing
    ) {
      const currentColor = getShapeColor();

      // Update existing shapes color (polygon, rectangle, polyline, circle)
      drawnItemsRef.current.eachLayer((layer) => {
        // For polygons, rectangles, polylines
        if (
          layer instanceof L.Polygon ||
          layer instanceof L.Polyline ||
          layer instanceof L.Rectangle
        ) {
          layer.setStyle &&
            layer.setStyle({
              color: currentColor,
              fillColor: currentColor,
              fillOpacity: 0.2,
              weight: 3,
              opacity: 0.8,
            });
        } else if (layer instanceof L.Circle) {
          // For circles, set color and fillColor
          layer.setStyle &&
            layer.setStyle({
              color: currentColor,
              fillColor: currentColor,
              fillOpacity: 0.2,
              weight: 3,
              opacity: 0.8,
            });
        }
      });

      // Update draw control colors for new shapes
      if (drawControlRef.current) {
        mapInstanceRef.current.removeControl(drawControlRef.current);

        const newDrawControl = new L.Control.Draw({
          position: "topright",
          draw: {
            polyline: {
              shapeOptions: {
                color: currentColor,
                weight: 4,
                opacity: 0.8,
              },
              allowIntersection: false,
              showLength: true,
              metric: true,
              feet: false,
              nautic: false,
            },
            polygon: {
              allowIntersection: false,
              drawError: {
                color: "#e74c3c",
                message: "<strong>Error:</strong> Shape edges cannot cross!",
                timeout: 2000,
              },
              shapeOptions: {
                color: currentColor,
                fillColor: currentColor,
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8,
              },
              metric: true,
              precision: {},
            },
            circle: {
              shapeOptions: {
                color: currentColor,
                fillColor: currentColor,
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8,
              },
              showRadius: true,
              metric: true,
              feet: false,
              nautic: false,
            },
            rectangle: {
              shapeOptions: {
                color: currentColor,
                fillColor: currentColor,
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8,
              },
              showArea: false,
              metric: true,
            },
            marker: false,
            circlemarker: false,
          },
          edit: {
            featureGroup: drawnItemsRef.current,
            remove: true,
            edit: {
              selectedPathOptions: {
                maintainColor: true,
                opacity: 0.6,
                dashArray: "10, 10",
                fill: true,
                fillColor: "#fe57a1",
                fillOpacity: 0.1,
                weight: 2,
              },
            },
          },
        });

        mapInstanceRef.current.addControl(newDrawControl);
        drawControlRef.current = newDrawControl;
      }
    }
  }, [selectedCategoryForDrawing]);

  const calculateGeofenceData = (layer, layerType) => {
    try {
      switch (layerType) {
        case "rectangle":
          const bounds = layer.getBounds();
          const area = calculateRectangleArea(bounds);
          return {
            type: "rectangle",
            bounds: bounds,
            area: area,
            coordinates: [
              [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
              [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
            ],
          };

        case "circle":
          const center = layer.getLatLng();
          const radius = layer.getRadius();
          const circleArea = ((Math.PI * radius * radius) / 1000000).toFixed(2);
          return {
            type: "circle",
            center: center,
            radius: radius,
            area: circleArea,
            coordinates: [center.lat, center.lng],
          };

        case "polygon":
          const polygonCoords = layer.getLatLngs()[0];
          const polygonArea = calculatePolygonArea(polygonCoords);
          return {
            type: "polygon",
            coordinates: polygonCoords.map((coord) => [coord.lat, coord.lng]),
            area: polygonArea,
          };

        case "polyline":
          const polylineCoords = layer.getLatLngs();
          const length = calculatePolylineLength(polylineCoords);
          return {
            type: "polyline",
            coordinates: polylineCoords.map((coord) => [coord.lat, coord.lng]),
            length: length,
          };

        default:
          throw new Error(`Unknown layer type: ${layerType}`);
      }
    } catch (error) {
      console.error("Error calculating geofence data:", error);
      return null;
    }
  };

  const getLayerType = (layer) => {
    if (layer instanceof L.Rectangle) return "rectangle";
    if (layer instanceof L.Circle) return "circle";
    if (layer instanceof L.Polygon) return "polygon";
    if (layer instanceof L.Polyline) return "polyline";
    return "unknown";
  };

  const calculateRectangleArea = (bounds) => {
    try {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const width = ne.distanceTo(L.latLng(ne.lat, sw.lng));
      const height = ne.distanceTo(L.latLng(sw.lat, ne.lng));
      return ((width * height) / 1000000).toFixed(3);
    } catch (error) {
      console.error("Error calculating rectangle area:", error);
      return "0";
    }
  };

  const calculatePolygonArea = (points) => {
    try {
      if (points.length < 3) return "0";
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].lat * points[j].lng;
        area -= points[j].lat * points[i].lng;
      }
      return Math.abs(((area / 2) * 111320 * 111320) / 1000000).toFixed(3);
    } catch (error) {
      console.error("Error calculating polygon area:", error);
      return "0";
    }
  };

  const calculatePolylineLength = (points) => {
    try {
      if (points.length < 2) return "0";
      let totalLength = 0;
      for (let i = 0; i < points.length - 1; i++) {
        totalLength += points[i].distanceTo(points[i + 1]);
      }
      return (totalLength / 1000).toFixed(3);
    } catch (error) {
      console.error("Error calculating polyline length:", error);
      return "0";
    }
  };

  // Selected location handling
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      try {
        const lat = selectedLocation.lat;
        const lon = selectedLocation.lon;

        if (drawnItemsRef.current) {
          drawnItemsRef.current.clearLayers();
        }

        const offset = 0.005;
        const bounds = L.latLngBounds(
          [lat - offset, lon - offset],
          [lat + offset, lon + offset]
        );

        const rectangle = L.rectangle(bounds, {
          color: getShapeColor(),
          fillColor: getShapeColor(),
          fillOpacity: 0.2,
          weight: 3,
          opacity: 0.8,
        });

        drawnItemsRef.current.addLayer(rectangle);

        mapInstanceRef.current.setView([lat, lon], 15, {
          animate: true,
          duration: 1.0,
        });

        const geofenceData = {
          type: "rectangle",
          bounds: bounds,
          area: calculateRectangleArea(bounds),
          fromSearch: true,
          coordinates: [
            [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
            [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
          ],
        };

        if (onGeofenceDrawn) {
          onGeofenceDrawn(geofenceData);
        }

        dispatch(clearSelectedLocation());
        setError(null);
      } catch (error) {
        console.error("Error handling selected location:", error);
        setError("Failed to create geofence from selected location.");
      }
    }
  }, [selectedLocation, dispatch, onGeofenceDrawn]);

  const handleMapTypeChange = (type) => {
    try {
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
          errorTileUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        });

        newTileLayer.on("tileerror", (e) => {
          console.warn("Tile loading error:", e);
        });

        newTileLayer.addTo(mapInstanceRef.current);
        mapInstanceRef.current.tileLayer = newTileLayer;
        setError(null);
      }
    } catch (error) {
      console.error("Error changing map type:", error);
      setError("Failed to change map type. Please try again.");
    }
  };

  const handleZoomIn = () => {
    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomIn();
        setError(null);
      }
    } catch (error) {
      console.error("Error zooming in:", error);
      setError("Failed to zoom in.");
    }
  };

  const handleZoomOut = () => {
    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomOut();
        setError(null);
      }
    } catch (error) {
      console.error("Error zooming out:", error);
      setError("Failed to zoom out.");
    }
  };

  const handleFitToBounds = () => {
    try {
      if (mapInstanceRef.current && drawnItemsRef.current) {
        const group = drawnItemsRef.current;
        if (group.getLayers().length > 0) {
          mapInstanceRef.current.fitBounds(group.getBounds(), {
            padding: [20, 20],
            animate: true,
            duration: 1.0,
          });
        } else {
          mapInstanceRef.current.setView([30.3753, 69.3451], 6, {
            animate: true,
            duration: 1.0,
          });
        }
        setError(null);
      }
    } catch (error) {
      console.error("Error fitting to bounds:", error);
      setError("Failed to fit view.");
    }
  };

  // const handleAddToMapClick = () => {
  //   setIsAddToMapOpen(!isAddToMapOpen);
  // };

  // const handleSuggestedGeofenceChange = (e) => {
  //   setSuggestedGeofenceChecked(e.target.checked);
  // };

  // const handleGeofencesChange = (e) => {
  //   setGeofencesChecked(e.target.checked);
  // };

  // const handleAdvanceOptions = () => {
  //   setShowAdvanceModal(true);
  //   setIsAddToMapOpen(false);
  // };

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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  // Edit mode: agar editMode true hai aur editGeofenceData milay to shape render karo
  useEffect(() => {
    if (
      editMode &&
      editGeofenceData &&
      Array.isArray(editGeofenceData) &&
      editGeofenceData.length > 0 &&
      mapInstanceRef.current &&
      drawnItemsRef.current
    ) {
      const data = editGeofenceData[0];
      if (data.ShapeType === "polygon" && data.Polygonlatlng) {
        // Polygonlatlng ko array of [lat, lng] me convert karo
        const latlngs = data.Polygonlatlng.split(",").map((pair) => {
          const [lat, lng] = pair.trim().split(" ").map(Number);
          return [lat, lng];
        });
        drawnItemsRef.current.clearLayers();
        const polygon = L.polygon(latlngs, {
          color: getShapeColor(),
          fillColor: getShapeColor(),
          fillOpacity: 0.2,
          weight: 3,
          opacity: 0.8,
        });
        drawnItemsRef.current.addLayer(polygon);
        setActiveCircle(null);
        if (latlngs.length > 0) {
          mapInstanceRef.current.fitBounds(polygon.getBounds(), {
            padding: [20, 20],
            animate: true,
            duration: 1.0,
          });
        }
        if (data.zoomlevel) {
          mapInstanceRef.current.setZoom(data.zoomlevel);
        }
      } else if (
        data.ShapeType === "circle" &&
        data.latitude &&
        data.longitude &&
        data.radius
      ) {
        // Circle render karo
        const center = [data.latitude, data.longitude];
        drawnItemsRef.current.clearLayers();
        const circle = L.circle(center, {
          radius: data.radius,
          color: getShapeColor(),
          fillColor: getShapeColor(),
          fillOpacity: 0.2,
          weight: 3,
          opacity: 0.8,
        });
        drawnItemsRef.current.addLayer(circle);
        setActiveCircle(circle);
        setRadiusInput(Math.round(data.radius));

        mapInstanceRef.current.setView(center, data.zoomlevel || 13, {
          animate: true,
          duration: 1.0,
        });
      }
    }
  }, [editMode, editGeofenceData]);

  // Handle radius input change
  const handleRadiusInputChange = (e) => {
    const value = Number(e.target.value);
    setRadiusInput(value);
    if (activeCircle && !isNaN(value) && value > 0) {
      activeCircle.setRadius(value);
      // Fire edit event so parent gets updated data
      if (mapInstanceRef.current) {
        mapInstanceRef.current.fire(L.Draw.Event.EDITED, {
          layers: {
            eachLayer: (cb) => cb(activeCircle)
          }
        });
      }
    }
  };

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[2000]">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25689f]"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[2000] max-w-sm">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {showAdvanceModal && (
        <GeofenceAdvancedOptionsModal
          isOpen={showAdvanceModal}
          onClose={() => setShowAdvanceModal(false)}
        />
      )}

      <div ref={mapRef} className="w-full h-full" />

      {/* Radius input for circle - always visible if a circle exists */}
      {drawnItemsRef.current && drawnItemsRef.current.getLayers().some(l => l instanceof L.Circle) && (
        <div
          className="fixed right-0 top-20 transform -translate-x-1/2 z-[2001] bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-1.5 flex items-center space-x-2"
          style={{maxWidth: '95vw', minWidth: 0}}
        >
          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Radius:</span>
          <input
            type="number"
            min={1}
            step={1}
            value={radiusInput}
            onChange={handleRadiusInputChange}
            className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
            style={{minWidth: 0}}
          />
        </div>
      )}

      <div className="absolute top-3 left-3 z-[1000]">
        <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-lg border border-gray-200">
          <button
            onClick={() => handleMapTypeChange("street")}
            className={`flex cursor-pointer items-center px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mapType === "street"
                ? "bg-[#25689f] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Globe size={14} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Street</span>
          </button>
          <button
            onClick={() => handleMapTypeChange("satellite")}
            className={`flex items-center cursor-pointer px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mapType === "satellite"
                ? "bg-[#25689f] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Satellite size={14} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Satellite</span>
          </button>
        </div>
      </div>

      {/* <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[1000] add-to-map-container">
        <div className="relative">
          <button
            onClick={handleAddToMapClick}
            className="flex items-center cursor-pointer px-3 sm:px-4 py-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg shadow-lg border border-gray-200 text-xs sm:text-sm font-medium transition-all duration-200"
          >
            <MapPin size={14} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add to Map</span>
            <span className="sm:hidden">Add</span>
            <ChevronDown
              size={12}
              className={`ml-1 sm:ml-2 transition-transform duration-200 ${
                isAddToMapOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isAddToMapOpen && (
            <div className="absolute top-full mt-2 left-0 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[1001]">
              <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-150">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={suggestedGeofenceChecked}
                    onChange={handleSuggestedGeofenceChange}
                    className="w-4 h-4 text-[#25689f] bg-gray-100 border-gray-300 rounded focus:ring-[#25689f] focus:ring-2"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Suggested Geofence
                  </span>
                </label>
              </div>

              <div className="px-4 py-2 hover:bg-gray-50 transition-colors duration-150">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={geofencesChecked}
                    onChange={handleGeofencesChange}
                    className="w-4 h-4 text-[#25689f] bg-gray-100 border-gray-300 rounded focus:ring-[#25689f] focus:ring-2"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Geofences
                  </span>
                </label>
              </div>

              <div className="border-t border-gray-100 my-2"></div>

              <div className="px-4 py-2">
                <button
                  onClick={handleAdvanceOptions}
                  className="w-full flex items-center justify-center px-3 py-2 bg-[#25689f] text-white rounded-md hover:bg-[#1F557F] transition-all duration-200 text-sm font-medium shadow-sm cursor-pointer"
                >
                  <Plus size={14} className="mr-2" />
                  Advance Options
                </button>
              </div>
            </div>
          )}
        </div>
      </div> */}

      <div className="absolute top-120 sm:top-120 right-2 z-[1000]">
        <div className="flex flex-col space-y-1 bg-white rounded-lg p-1 shadow-lg border border-gray-200">
          <button
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 right-3 z-[1000]">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFitToBounds}
            className="flex items-center cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg shadow-lg border border-gray-200 text-xs font-medium transition-all duration-200"
          >
            <Maximize size={12} className="mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">Fit View</span>
            <span className="sm:hidden">Fit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeofenceMap;
