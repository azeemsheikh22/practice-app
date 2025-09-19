import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import ReplayAdvancedOptionsModal from "./ReplayAdvancedOptionsModal";
import ReplayGeofenceManager from "./ReplayGeofenceManager";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentReplayIndex,
  selectSelectedTrip,
  // selectGetReplayCount,
  setCurrentReplayIndex,
  selectSelectedRoutes,
} from "../../features/replaySlice";
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
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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
    html: `<div style=\"width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;\">\n      <img src=\"${iconImg}\" alt=\"${statusKey}\" style=\"width: 24px; height: 24px; transform: rotate(${rotation}deg); display: block; margin: 0 auto;\" />\n    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const AnimatedMarkerContextMenu = ({ visible, x, y, onCreateGeofence }) => {
  if (!visible) return null;
  return (
    <div
      className="fixed z-[2000] bg-white border border-gray-200 rounded-lg shadow-lg min-w-40"
      style={{ left: x, top: y, cursor: "pointer" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        onClick={onCreateGeofence}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        Create Geofence
      </button>
    </div>
  );
};

const ReplayMap = forwardRef(
  (
    {
      replayData,
      tripsData,
      isPlaying,
      currentTime,
      isMobileMenuOpen,
      sidebarExpanded,
    },
    ref
  ) => {
    const filters = useSelector((state) => state.replay.filters || {});
    const displayMode = filters.displayMode || "line";
    const dispatch = useDispatch();
    const currentReplayIndex = useSelector(selectCurrentReplayIndex);
    const lastViewRef = useRef({ lat: null, lng: null, zoom: null });
    const showGeofenceOnMap = useSelector(
      (state) => state.replay.showGeofenceOnMap
    );
    const showTripMarkers = filters.showTripMarkers || false;
    const selectedTrip = useSelector(selectSelectedTrip);
    // const getReplayCount = useSelector(selectGetReplayCount);
    const selectedRoutes = useSelector(selectSelectedRoutes); // Array of route ids
    const { routes } = useSelector((state) => state.route); // Array of route objects

    // Filter routes by selectedRoutes ids
    const selectedRouteObjects = Array.isArray(routes)
      ? routes.filter(route => selectedRoutes.includes(route.id))
      : [];

    // console.log(getReplayCount)

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

    // Helper: Clear all map layers related to previous track/markers
    const clearMapLayers = () => {
      if (!mapInstanceRef.current) return;
      // Remove route polyline
      if (routeLayer) {
        mapInstanceRef.current.removeLayer(routeLayer);
        setRouteLayer(null);
      }
      // Remove all vehicle markers
      if (mapInstanceRef.current._vehicleMarkers) {
        mapInstanceRef.current._vehicleMarkers.forEach((m) => {
          mapInstanceRef.current.removeLayer(m);
        });
        mapInstanceRef.current._vehicleMarkers = [];
      }
      // Remove current animated marker
      if (currentMarker) {
        mapInstanceRef.current.removeLayer(currentMarker);
        setCurrentMarker(null);
      }
      // Remove all start/end markers (className based or icon html)
      mapInstanceRef.current.eachLayer((layer) => {
        // Remove by options.className
        if (
          layer.options &&
          layer.options.className &&
          (layer.options.className === "start-marker" ||
            layer.options.className === "end-marker" ||
            layer.options.className === "trip-start-marker" ||
            layer.options.className === "trip-end-marker" ||
            layer.options.className === "trip-polyline")
        ) {
          mapInstanceRef.current.removeLayer(layer);
        }
        // Remove by _icon html class (for divIcon markers)
        if (layer._icon && layer._icon.classList) {
          if (
            layer._icon.classList.contains("start-marker") ||
            layer._icon.classList.contains("end-marker") ||
            layer._icon.classList.contains("trip-start-marker") ||
            layer._icon.classList.contains("trip-end-marker")
          ) {
            mapInstanceRef.current.removeLayer(layer);
          }
        }
      });
    };

    // Jab bhi replayData aaye ya displayMode change ho ya showTripMarkers change ho, clear all and drawTrack
    useEffect(() => {
      if (replayData && replayData.length > 0) {
        clearMapLayers();
        drawTrack();
        setAutoZoomEnabled(true); // Naya data aaya ya displayMode change hua to auto-zoom allow
      } else if (mapInstanceRef.current) {
        // If no data, clear all layers
        clearMapLayers();
      }
      // eslint-disable-next-line
    }, [displayMode, replayData ? replayData.length : 0, showTripMarkers]);

    // Highlight selected routes on map
    useEffect(() => {
      if (
        !mapInstanceRef.current ||
        !selectedRouteObjects ||
        selectedRouteObjects.length === 0
      )
        return;
      // Remove previous route polylines (className: 'selected-route-polyline')
      mapInstanceRef.current.eachLayer((layer) => {
        if (
          layer.options &&
          layer.options.className === "selected-route-polyline"
        ) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      selectedRouteObjects.forEach((route, idx) => {
        if (!route.routeString) return;
        // Parse routeString: "lat lng,lat lng,..."
        const points = route.routeString
          .split(",")
          .map((pair) => {
            const [lat, lng] = pair.trim().split(" ");
            return [parseFloat(lat), parseFloat(lng)];
          })
          .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
        if (points.length > 1) {
          const polyline = L.polyline(points, {
            color: "#147fde", // Blue highlight
            weight: 6,
            opacity: 0.95,
            className: "selected-route-polyline",
            dashArray: idx % 2 === 0 ? "10,6" : "6,6",
          }).addTo(mapInstanceRef.current);
          // Show route name on hover
          polyline.bindTooltip(route.routeName || "Route", {
            direction: "top",
            offset: [0, -8],
            className: "route-tooltip",
            sticky: true,
          });
        }
      });
    }, [selectedRoutes]);

    // Draw trip markers when showTripMarkers or selectedTrip changes
    useEffect(() => {
      // Clear existing trip markers first
      clearTripMarkers();

      if (tripsData && tripsData.length > 0) {
        if (showTripMarkers) {
          // Show all trips when checkbox is enabled
          drawTripMarkers();
        } else if (selectedTrip && selectedTrip.index !== undefined) {
          // Show only selected trip when checkbox is disabled but trip is selected
          drawSingleTrip(selectedTrip.index);
        }
      }
      // eslint-disable-next-line
    }, [showTripMarkers, tripsData, selectedTrip]);

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

      // Add zoom event listener to redraw trip markers with proper sizing
      const handleZoomEnd = () => {
        if (showTripMarkers && tripsData && tripsData.length > 0) {
          setTimeout(() => {
            drawTripMarkers(); // Redraw with new sizes
          }, 150);
        }
      };

      map.on("zoomstart", disableAutoZoom);
      map.on("dragstart", disableAutoZoom);
      map.on("zoomend", handleZoomEnd);

      return () => {
        map.off("zoomstart", disableAutoZoom);
        map.off("dragstart", disableAutoZoom);
        map.off("zoomend", handleZoomEnd);
      };
    }, [showTripMarkers, tripsData]);

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
      if (displayMode === "marker") {
        // Pehle line mode ka sab kuch banao (polyline + start/end markers)
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

        // Start/end markers bhi add karo (same as line mode)
        const statusMarkers = [];
        replayData.forEach((point, idx) => {
          if (point.latitude && point.longitude) {
            const status = point.status || point.status1 || "";
            if (idx === 0 || idx === replayData.length - 1) {
              const marker = L.marker([point.latitude, point.longitude], {
                icon: getVehicleIcon(status, point.head),
                title: point.car_name || "",
                zIndexOffset: 1500,
              });
              marker.bindPopup(
                `<div style=\"min-width:120px\"><b>${
                  point.car_name || ""
                }</b><br/>${point.gps_time || ""}<br/>Status: ${
                  status || ""
                }<br/>Speed: ${point.speed ?? "-"} km/h</div>`
              );
              statusMarkers.push(marker);
            }
          }
        });

        // Ab extra markers add karo (har point par)
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
              `<div style=\"min-width:120px\"><b>${
                point.car_name || ""
              }</b><br/>${point.gps_time || ""}<br/>Status: ${
                status || ""
              }<br/>Speed: ${point.speed ?? "-"} km/h</div>`
            );
            allMarkers.push(marker);
          }
        });

        // Combine both arrays for _vehicleMarkers
        mapInstanceRef.current._vehicleMarkers = [
          ...statusMarkers,
          ...allMarkers,
        ];

        if (!isPlaying) {
          statusMarkers.forEach((marker) =>
            marker.addTo(mapInstanceRef.current)
          );
          allMarkers.forEach((marker) => marker.addTo(mapInstanceRef.current));
        }

        // Add start and end flag markers bhi (same as line mode)
        if (coordinates.length > 0 && !showTripMarkers) {
          const startIcon = L.divIcon({
            className: "start-marker",
            html: `<div style="
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 18px;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            ">
              ⚑
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          const endIcon = L.divIcon({
            className: "end-marker",
            html: `<div style="
              background: linear-gradient(135deg, #ef4444, #dc2626); 
              color: white; 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 18px;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            ">
              🏁
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          L.marker(coordinates[0], {
            icon: startIcon,
            zIndexOffset: 10000,
          }).addTo(mapInstanceRef.current);

          L.marker(coordinates[coordinates.length - 1], {
            icon: endIcon,
            zIndexOffset: 10000,
          }).addTo(mapInstanceRef.current);
        }

        return; // Marker mode complete
      }

      // --- DisplayMode: line ---
      if (displayMode === "line") {
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
                `<div style=\"min-width:120px\"><b>${
                  point.car_name || ""
                }</b><br/>${point.gps_time || ""}<br/>Status: ${
                  status || ""
                }<br/>Speed: ${point.speed ?? "-"} km/h</div>`
              );
              statusMarkers.push(marker);
            }
          }
        });
        mapInstanceRef.current._vehicleMarkers = statusMarkers;
        if (!isPlaying) {
          statusMarkers.forEach((marker) =>
            marker.addTo(mapInstanceRef.current)
          );
        }

        // Add start and end markers (sab se upar) - Only show if trip markers are disabled
        if (coordinates.length > 0 && !showTripMarkers) {
          const startIcon = L.divIcon({
            className: "start-marker",
            html: `<div style="
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 18px;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            ">
              ⚑
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          const endIcon = L.divIcon({
            className: "end-marker",
            html: `<div style="
              background: linear-gradient(135deg, #ef4444, #dc2626); 
              color: white; 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 18px;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            ">
              🏁
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          const startMarker = L.marker(coordinates[0], {
            icon: startIcon,
            zIndexOffset: 10000, // Highest priority
          }).addTo(mapInstanceRef.current);

          const endMarker = L.marker(coordinates[coordinates.length - 1], {
            icon: endIcon,
            zIndexOffset: 10000, // Highest priority
          }).addTo(mapInstanceRef.current);

          // Add rich popups for start/end markers
          const startTime = replayData[0]?.gps_time;
          const endTime = replayData[replayData.length - 1]?.gps_time;
          const totalDuration =
            startTime && endTime
              ? Math.round(
                  (new Date(endTime) - new Date(startTime)) / (1000 * 60)
                )
              : 0;

          startMarker.bindPopup(`
            <div style="min-width: 220px; text-align: center;">
              <div style="
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 8px 12px;
                margin: -8px -12px 12px -12px;
                font-size: 16px;
                font-weight: bold;
              ">
                ⚑ JOURNEY START
              </div>
              <div style="text-align: left;">
                <p style="margin: 6px 0; font-size: 13px;"><strong>📅 Time:</strong> ${
                  startTime ? new Date(startTime).toLocaleString() : "Unknown"
                }</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>🚗 Vehicle:</strong> ${
                  replayData[0]?.car_name || "Unknown"
                }</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>📍 Status:</strong> ${
                  replayData[0]?.status || "Unknown"
                }</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>⏱️ Total Duration:</strong> ${totalDuration} minutes</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>📊 Total Points:</strong> ${
                  replayData.length
                }</p>
              </div>
            </div>
          `);

          endMarker.bindPopup(`
            <div style="min-width: 220px; text-align: center;">
              <div style="
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                padding: 8px 12px;
                margin: -8px -12px 12px -12px;
                font-size: 16px;
                font-weight: bold;
              ">
                🏁 JOURNEY END
              </div>
              <div style="text-align: left;">
                <p style="margin: 6px 0; font-size: 13px;"><strong>📅 Time:</strong> ${
                  endTime ? new Date(endTime).toLocaleString() : "Unknown"
                }</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>🚗 Vehicle:</strong> ${
                  replayData[replayData.length - 1]?.car_name || "Unknown"
                }</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>📍 Status:</strong> ${
                  replayData[replayData.length - 1]?.status || "Unknown"
                }</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>⏱️ Total Duration:</strong> ${totalDuration} minutes</p>
                <p style="margin: 6px 0; font-size: 13px;"><strong>📊 Total Points:</strong> ${
                  replayData.length
                }</p>
              </div>
            </div>
          `);
        }
        return;
      }

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
            `<div style=\"min-width:120px\"><b>${
              point.car_name || ""
            }</b><br/>${point.gps_time || ""}<br/>Status: ${
              status || ""
            }<br/>Speed: ${point.speed ?? "-"} km/h</div>`
          );
          allMarkers.push(marker);
        }
      });
      mapInstanceRef.current._vehicleMarkers = allMarkers;
      if (!isPlaying) {
        allMarkers.forEach((marker) => marker.addTo(mapInstanceRef.current));
      }

      if (coordinates.length > 0 && !showTripMarkers) {
        const startIcon = L.divIcon({
          className: "start-marker",
          html: `<div style="
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            font-size: 18px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          ">
            ⚑
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const endIcon = L.divIcon({
          className: "end-marker",
          html: `<div style="
            background: linear-gradient(135deg, #ef4444, #dc2626); 
            color: white; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            font-size: 18px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          ">
            🏁
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        L.marker(coordinates[0], {
          icon: startIcon,
          zIndexOffset: 10000,
        }).addTo(mapInstanceRef.current);
        L.marker(coordinates[coordinates.length - 1], {
          icon: endIcon,
          zIndexOffset: 10000,
        }).addTo(mapInstanceRef.current);
      }
    };

    // Clear trip markers and polylines
    const clearTripMarkers = () => {
      if (!mapInstanceRef.current) return;

      const layersToRemove = [];

      mapInstanceRef.current.eachLayer((layer) => {
        // Check for custom trip marker properties
        if (layer._isTripMarker === true || layer._isTripPolyline === true) {
          layersToRemove.push(layer);
        }
        // Fallback: Check if layer has options and className for polylines
        else if (layer.options && layer.options.className) {
          const className = layer.options.className;
          if (
            className.includes("trip-start-marker") ||
            className.includes("trip-end-marker") ||
            className.includes("trip-polyline")
          ) {
            layersToRemove.push(layer);
          }
        }
        // Fallback: Check for divIcon markers by _icon html class
        else if (layer._icon && layer._icon.classList) {
          if (
            layer._icon.classList.contains("trip-start-marker") ||
            layer._icon.classList.contains("trip-end-marker")
          ) {
            layersToRemove.push(layer);
          }
        }
      });

      // Remove all identified layers
      layersToRemove.forEach((layer) => {
        try {
          mapInstanceRef.current.removeLayer(layer);
        } catch (error) {
          console.warn("Error removing layer:", error);
        }
      });
    };

    // Draw only selected trip (when trip checkbox is disabled but trip is selected)
    const drawSingleTrip = (selectedTripIndex) => {
      if (!replayData || !tripsData || selectedTripIndex >= tripsData.length)
        return;

      const tripColors = [
        "#E74C3C",
        "#3498DB",
        "#2ECC71",
        "#F39C12",
        "#9B59B6",
        "#1ABC9C",
        "#E67E22",
        "#34495E",
        "#FF6B9D",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
      ];

      const trip = tripsData[selectedTripIndex];
      const tripColor = tripColors[selectedTripIndex % tripColors.length];
      const usedPositions = [];

      // Handle different possible field names for trip times
      let tripStartTime, tripEndTime;

      if (trip.startTime) {
        tripStartTime = new Date(trip.startTime).getTime();
        tripEndTime = new Date(trip.endTime).getTime();
      } else if (trip.start_time) {
        tripStartTime = new Date(trip.start_time).getTime();
        tripEndTime = new Date(trip.end_time).getTime();
      } else if (trip.StartTime) {
        tripStartTime = new Date(trip.StartTime).getTime();
        tripEndTime = new Date(trip.EndTime).getTime();
      } else if (trip["Start Time"] && trip["Arrival Time"]) {
        tripStartTime = new Date(trip["Start Time"]).getTime();
        tripEndTime = new Date(trip["Arrival Time"]).getTime();
      } else {
        return;
      }

      // Filter replay GPS points within trip time range
      const tripGPSPoints = replayData.filter((point) => {
        const pointTime = new Date(point.gps_time).getTime();
        return pointTime >= tripStartTime && pointTime <= tripEndTime;
      });

      if (tripGPSPoints.length > 0) {
        drawTripOnMap(
          tripGPSPoints,
          tripColor,
          selectedTripIndex,
          usedPositions,
          true
        ); // Always highlighted for single trip
      }
    };

    // Draw trip markers and polylines
    const drawTripMarkers = () => {
      if (!mapInstanceRef.current || !replayData) {
        return;
      }

      // Clear existing trip markers first
      clearTripMarkers();

      const tripColors = [
        "#E74C3C", // Red
        "#3498DB", // Blue
        "#2ECC71", // Green
        "#F39C12", // Orange
        "#9B59B6", // Purple
        "#1ABC9C", // Turquoise
        "#E67E22", // Dark Orange
        "#34495E", // Dark Blue Grey
        "#FF6B9D", // Pink
        "#4ECDC4", // Light Teal
        "#45B7D1", // Light Blue
        "#96CEB4", // Light Green
      ];

      // If we don't have proper trip data, create trips based on time gaps in GPS data
      if (!tripsData || tripsData.length === 0) {
        createTripsFromGpsGaps();
        return;
      }

      // Collect all trip markers positions to avoid overlapping
      const usedPositions = [];

      tripsData.forEach((trip, index) => {
        const tripColor = tripColors[index % tripColors.length];

        // Check if trip has meaningful distance first
        const tripDistance = trip.Distance || trip.distance || 0;
        if (tripDistance === 0) {
          return;
        }

        // Handle different possible field names for trip times
        let tripStartTime, tripEndTime;

        if (trip.startTime) {
          tripStartTime = new Date(trip.startTime).getTime();
          tripEndTime = new Date(trip.endTime).getTime();
        } else if (trip.start_time) {
          tripStartTime = new Date(trip.start_time).getTime();
          tripEndTime = new Date(trip.end_time).getTime();
        } else if (trip.StartTime) {
          tripStartTime = new Date(trip.StartTime).getTime();
          tripEndTime = new Date(trip.EndTime).getTime();
        } else if (trip["Start Time"] && trip["Arrival Time"]) {
          // Handle fields with spaces in names
          tripStartTime = new Date(trip["Start Time"]).getTime();
          tripEndTime = new Date(trip["Arrival Time"]).getTime();
        } else {
          return;
        }

        // Filter replay GPS points within trip time range
        const tripGPSPoints = replayData.filter((point) => {
          const pointTime = new Date(point.gps_time).getTime();
          return pointTime >= tripStartTime && pointTime <= tripEndTime;
        });

        if (tripGPSPoints.length > 0) {
          const isSelected = selectedTrip && selectedTrip.index === index;
          drawTripOnMap(
            tripGPSPoints,
            tripColor,
            index,
            usedPositions,
            isSelected
          );
        }
      });
    };

    // Create trips from GPS gaps when no trip data is available
    const createTripsFromGpsGaps = () => {
      if (!replayData || replayData.length < 2) return;

      const trips = [];
      let currentTrip = [replayData[0]];

      for (let i = 1; i < replayData.length; i++) {
        const prevTime = new Date(replayData[i - 1].gps_time).getTime();
        const currentTime = new Date(replayData[i].gps_time).getTime();
        const timeDiff = currentTime - prevTime;

        // If gap is more than 30 minutes, consider it a new trip
        if (timeDiff > 30 * 60 * 1000) {
          if (currentTrip.length > 1) {
            trips.push(currentTrip);
          }
          currentTrip = [replayData[i]];
        } else {
          currentTrip.push(replayData[i]);
        }
      }

      // Add the last trip
      if (currentTrip.length > 1) {
        trips.push(currentTrip);
      }

      // Colors for different trips - same as main function
      const tripColors = [
        "#E74C3C", // Red
        "#3498DB", // Blue
        "#2ECC71", // Green
        "#F39C12", // Orange
        "#9B59B6", // Purple
        "#1ABC9C", // Turquoise
        "#E67E22", // Dark Orange
        "#34495E", // Dark Blue Grey
        "#FF6B9D", // Pink
        "#4ECDC4", // Light Teal
        "#45B7D1", // Light Blue
        "#96CEB4", // Light Green
      ];

      const usedPositions = []; // Track positions for this GPS gap based trip creation

      trips.forEach((tripPoints, index) => {
        // Calculate distance for this trip to filter out 0 distance trips
        let tripDistance = 0;
        for (let i = 1; i < tripPoints.length; i++) {
          const prev = tripPoints[i - 1];
          const curr = tripPoints[i];
          const distance =
            Math.sqrt(
              Math.pow(curr.latitude - prev.latitude, 2) +
                Math.pow(curr.longitude - prev.longitude, 2)
            ) * 111; // Rough conversion to km
          tripDistance += distance;
        }

        // Only draw trips with meaningful distance (more than 10 meters)
        if (tripDistance >= 0.01) {
          const tripColor = tripColors[index % tripColors.length];
          drawTripOnMap(tripPoints, tripColor, index, usedPositions);
        } else {
        }
      });
    };

    // Draw individual trip on map
    const drawTripOnMap = (
      tripGPSPoints,
      tripColor,
      index,
      usedPositions,
      isSelected = false
    ) => {
      if (!tripGPSPoints || tripGPSPoints.length === 0) return;

      // Calculate trip distance first to filter out 0 distance trips
      let tripDistance = 0;
      for (let i = 1; i < tripGPSPoints.length; i++) {
        const prev = tripGPSPoints[i - 1];
        const curr = tripGPSPoints[i];
        const distance =
          Math.sqrt(
            Math.pow(curr.latitude - prev.latitude, 2) +
              Math.pow(curr.longitude - prev.longitude, 2)
          ) * 111; // Rough conversion to km
        tripDistance += distance;
      }

      // Don't show trips with 0 or very minimal distance (less than 0.01 km = 10 meters)
      if (tripDistance < 0.01) {
        return;
      }

      // Get current zoom level for responsive marker sizing
      const currentZoom = mapInstanceRef.current
        ? mapInstanceRef.current.getZoom()
        : 12;

      // Calculate marker sizes based on zoom level with better visibility
      const baseSize = Math.max(24, Math.min(40, currentZoom * 2.5)); // Smaller max size: 24px to 40px
      const badgeSize = Math.max(14, Math.min(20, currentZoom * 1.4)); // Smaller badge: 14px to 20px
      const fontSize = Math.max(11, Math.min(16, currentZoom * 1.0)); // Smaller font: 11px to 16px
      const badgeFontSize = Math.max(8, Math.min(12, currentZoom * 0.7)); // Smaller badge font: 8px to 12px

      // Enhanced z-index for better layering - higher values for better visibility
      const baseZIndex = 8000 + index * 100; // Each trip gets higher z-index
      const markerZIndex = currentZoom < 12 ? baseZIndex + 2000 : baseZIndex; // Even higher when zoomed out

      // Selected trip gets extra highlighting
      const selectedBonus = isSelected ? 5000 : 0;
      const finalZIndex = markerZIndex + selectedBonus;

      // Get first and last GPS points for markers
      const startPoint = tripGPSPoints[0];
      const endPoint = tripGPSPoints[tripGPSPoints.length - 1];

      // Check if trip markers are too close to main route markers
      const mainStartPoint = replayData[0];
      const mainEndPoint = replayData[replayData.length - 1];

      // Function to check if position is too close to existing markers
      const getAvailablePosition = (originalLat, originalLng, type) => {
        const currentZoom = mapInstanceRef.current
          ? mapInstanceRef.current.getZoom()
          : 12;
        const minDistance = currentZoom > 12 ? 0.0002 : 0.0008; // Smaller offset when zoomed in

        let testLat = originalLat;
        let testLng = originalLng;
        let attempt = 0;
        const maxAttempts = 8;

        while (attempt < maxAttempts) {
          // Check if current position conflicts with existing markers
          const hasConflict = usedPositions.some((pos) => {
            const distance = Math.sqrt(
              Math.pow(testLat - pos.lat, 2) + Math.pow(testLng - pos.lng, 2)
            );
            return distance < minDistance;
          });

          if (!hasConflict) {
            // Position is available, record it and return
            usedPositions.push({ lat: testLat, lng: testLng, type, index });
            return [testLat, testLng];
          }

          // Try different positions in a circular pattern
          const angle = attempt * 45 * (Math.PI / 180); // 45 degree increments
          const offsetDistance = minDistance * (1 + attempt * 0.5);
          testLat = originalLat + Math.cos(angle) * offsetDistance;
          testLng = originalLng + Math.sin(angle) * offsetDistance;
          attempt++;
        }

        // If no position found, use original with small random offset
        const randomOffset = minDistance * (0.5 + Math.random() * 0.5);
        const randomAngle = Math.random() * 2 * Math.PI;
        testLat = originalLat + Math.cos(randomAngle) * randomOffset;
        testLng = originalLng + Math.sin(randomAngle) * randomOffset;
        usedPositions.push({ lat: testLat, lng: testLng, type, index });
        return [testLat, testLng];
      };

      // Get non-overlapping positions for start and end markers
      const startOffset = getAvailablePosition(
        startPoint.latitude,
        startPoint.longitude,
        "start"
      );
      const endOffset = getAvailablePosition(
        endPoint.latitude,
        endPoint.longitude,
        "end"
      );

      const startMarker = L.divIcon({
        html: `<div style="
          background: ${tripColor}; 
          width: ${baseSize}px; 
          height: ${baseSize}px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          position: relative;
          cursor: pointer;
          ${
            isSelected
              ? "box-shadow: 0 0 15px rgba(37, 104, 159, 0.8); border: 3px solid #25689f;"
              : ""
          }
        ">
          <span style="color: white; font-size: ${fontSize}px; font-weight: bold;">${
          index + 1
        }</span>
          <div style="
            position: absolute; 
            top: -${Math.round(badgeSize * 0.3)}px; 
            right: -${Math.round(badgeSize * 0.3)}px; 
            background: #10b981; 
            width: ${badgeSize}px; 
            height: ${badgeSize}px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            ${isSelected ? "box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);" : ""}
          ">
            <span style="color: white; font-size: ${badgeFontSize}px; font-weight: bold;">S</span>
          </div>
        </div>`,
        className: "trip-start-marker",
        iconSize: [baseSize, baseSize],
        iconAnchor: [baseSize / 2, baseSize / 2],
      });

      const startMarkerInstance = L.marker(startOffset, {
        icon: startMarker,
        className: "trip-start-marker",
        zIndexOffset: finalZIndex, // Enhanced z-index for better visibility
      });

      // Add custom properties for identification
      startMarkerInstance._isTripMarker = true;
      startMarkerInstance._tripIndex = index;
      startMarkerInstance._markerType = "start";

      startMarkerInstance.addTo(mapInstanceRef.current).bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: ${tripColor}; font-size: 14px;">
              🚗 Trip ${index + 1} - Start
            </h3>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Time:</strong> ${new Date(
              startPoint.gps_time
            ).toLocaleString()}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Vehicle:</strong> ${
              startPoint.car_name || "Unknown"
            }</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${
              startPoint.status || "Unknown"
            }</p>
            <p style="margin: 4px 0; font-size: 11px; color: #666;"><em>* Position auto-adjusted to prevent overlap</em></p>
          </div>
        `);

      const endMarker = L.divIcon({
        html: `<div style="
          background: ${tripColor}; 
          width: ${baseSize}px; 
          height: ${baseSize}px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          position: relative;
          cursor: pointer;
          ${
            isSelected
              ? "box-shadow: 0 0 15px rgba(37, 104, 159, 0.8); border: 3px solid #25689f;"
              : ""
          }
        ">
          <span style="color: white; font-size: ${fontSize}px; font-weight: bold;">${
          index + 1
        }</span>
          <div style="
            position: absolute; 
            top: -${Math.round(badgeSize * 0.3)}px; 
            right: -${Math.round(badgeSize * 0.3)}px; 
            background: #ef4444; 
            width: ${badgeSize}px; 
            height: ${badgeSize}px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            ${isSelected ? "box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);" : ""}
          ">
            <span style="color: white; font-size: ${badgeFontSize}px; font-weight: bold;">E</span>
          </div>
        </div>`,
        className: "trip-end-marker",
        iconSize: [baseSize, baseSize],
        iconAnchor: [baseSize / 2, baseSize / 2],
      });

      const endMarkerInstance = L.marker(endOffset, {
        icon: endMarker,
        className: "trip-end-marker",
        zIndexOffset: finalZIndex + 10, // Slightly higher than start marker
      });

      // Add custom properties for identification
      endMarkerInstance._isTripMarker = true;
      endMarkerInstance._tripIndex = index;
      endMarkerInstance._markerType = "end";

      endMarkerInstance.addTo(mapInstanceRef.current).bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: ${tripColor}; font-size: 14px;">
              🏁 Trip ${index + 1} - End
            </h3>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Time:</strong> ${new Date(
              endPoint.gps_time
            ).toLocaleString()}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Vehicle:</strong> ${
              endPoint.car_name || "Unknown"
            }</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${
              endPoint.status || "Unknown"
            }</p>
            <p style="margin: 4px 0; font-size: 11px; color: #666;"><em>* Position auto-adjusted to prevent overlap</em></p>
          </div>
        `);

      // Create trip polyline with unique color and pattern
      const tripPath = tripGPSPoints.map((point) => [
        point.latitude,
        point.longitude,
      ]);

      const startTime = new Date(startPoint.gps_time).getTime();
      const endTime = new Date(endPoint.gps_time).getTime();
      const duration = Math.round((endTime - startTime) / (1000 * 60));

      // Calculate average speed
      let totalDistance = 0;
      for (let i = 1; i < tripGPSPoints.length; i++) {
        const prev = tripGPSPoints[i - 1];
        const curr = tripGPSPoints[i];
        const distance =
          Math.sqrt(
            Math.pow(curr.latitude - prev.latitude, 2) +
              Math.pow(curr.longitude - prev.longitude, 2)
          ) * 111; // Rough conversion to km
        totalDistance += distance;
      }
      const avgSpeed =
        duration > 0 ? Math.round((totalDistance / duration) * 60) : 0;

      const tripPolyline = L.polyline(tripPath, {
        color: tripColor,
        weight: isSelected ? 8 : 6, // Thicker line when selected
        opacity: isSelected ? 1 : 0.9, // More opaque when selected
        className: `trip-polyline ${isSelected ? "selected-trip" : ""}`,
        dashArray: isSelected
          ? "none"
          : index % 2 === 0
          ? "15, 10"
          : "10, 5, 5, 5", // Solid line when selected
      });

      // Add custom property for identification
      tripPolyline._isTripPolyline = true;
      tripPolyline._tripIndex = index;

      tripPolyline.addTo(mapInstanceRef.current).bindPopup(`
          <div style="min-width: 220px;">
            <h3 style="margin: 0 0 8px 0; color: ${tripColor}; font-size: 16px;">
              🛣️ Trip ${index + 1}
            </h3>
           

          </div>
        `);
    };

    // Jab play ho ya displayMode change ho to status markers hide/show karo
    useEffect(() => {
      if (!mapInstanceRef.current || !mapInstanceRef.current._vehicleMarkers)
        return;
      if (isPlaying || displayMode !== "marker") {
        mapInstanceRef.current._vehicleMarkers.forEach((marker) => {
          if (mapInstanceRef.current.hasLayer(marker)) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
      } else {
        mapInstanceRef.current._vehicleMarkers.forEach((marker) => {
          if (!mapInstanceRef.current.hasLayer(marker)) {
            marker.addTo(mapInstanceRef.current);
          }
        });
      }
    }, [isPlaying, displayMode]);

    // Smooth animated vehicle marker (for animation) + right-click context menu
    const [markerMenu, setMarkerMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      lat: null,
      lng: null,
    });
    useEffect(() => {
      if (replayData && replayData.length > 0 && currentTime !== null) {
        const total = replayData.length - 1;
        const floatIdx = (currentTime / 100) * total;
        let idx = Math.floor(floatIdx);
        let nextIdx = Math.ceil(floatIdx);
        if (idx < 0) idx = 0;
        if (nextIdx >= replayData.length) nextIdx = replayData.length - 1;

        // Update current replay index in Redux store for table highlighting
        dispatch(setCurrentReplayIndex(idx));

        const p1 = replayData[idx];
        const p2 = replayData[nextIdx];
        let lat = p1.latitude;
        let lng = p1.longitude;
        let head = p1.head || 0;
        let status = p1.status || p1.status1 || "";
        if (p2 && p2 !== p1 && floatIdx !== idx) {
          const t = floatIdx - idx;
          lat = p1.latitude + (p2.latitude - p1.latitude) * t;
          lng = p1.longitude + (p2.longitude - p1.longitude) * t;
          head = p1.head + (p2.head - p1.head) * t;
          if (t > 0.5) status = p2.status || p2.status1 || status;
        }
        if (lat && lng) {
          // Remove all vehicle markers before adding new
          mapInstanceRef.current.eachLayer((layer) => {
            if (
              layer.options &&
              layer.options.icon &&
              layer.options.icon.options &&
              layer.options.icon.options.className === "vehicle-marker"
            ) {
              mapInstanceRef.current.removeLayer(layer);
            }
          });
          const marker = L.marker([lat, lng], {
            icon: getVehicleIcon(status, head),
            title: p1.car_name || "",
            zIndexOffset: 4000,
          });
          marker.bindPopup(
            `<div style=\"min-width:120px\"><b>${p1.car_name || ""}</b><br/>${
              p1.gps_time || ""
            }<br/>Status: ${status || ""}<br/>Speed: ${
              p1.speed ?? "-"
            } km/h</div>`
          );
          marker.addTo(mapInstanceRef.current);
          setCurrentMarker(marker);

          // Add right-click context menu to marker
          marker.on("contextmenu", function (e) {
            // e.originalEvent is the browser event
            setMarkerMenu({
              visible: true,
              x: e.originalEvent.clientX,
              y: e.originalEvent.clientY,
              lat,
              lng,
            });
          });

          // Center map if needed
          if (mapInstanceRef.current) {
            const map = mapInstanceRef.current;
            const currentZoom = map.getZoom();
            const last = lastViewRef.current;
            if (
              last.lat !== lat ||
              last.lng !== lng ||
              last.zoom !== currentZoom
            ) {
              map.setView([lat, lng], currentZoom, { animate: true });
              lastViewRef.current = { lat, lng, zoom: currentZoom };
            }
          }
        }
      }
    }, [currentTime, replayData, dispatch]);

    // Hide marker context menu on map click or ESC
    useEffect(() => {
      if (!markerMenu.visible) return;
      const handle = (e) => setMarkerMenu((m) => ({ ...m, visible: false }));
      window.addEventListener("click", handle);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") handle();
      });
      return () => {
        window.removeEventListener("click", handle);
        window.removeEventListener("keydown", (e) => {
          if (e.key === "Escape") handle();
        });
      };
    }, [markerMenu.visible]);

    // Table row select: move vehicle to selected point (no double marker)
    useEffect(() => {
      // Only add marker on row select if replay is paused
      if (
        !isPlaying &&
        replayData &&
        replayData.length > 0 &&
        currentReplayIndex != null
      ) {
        const point = replayData[currentReplayIndex];
        if (point && point.latitude && point.longitude) {
          // Remove all vehicle markers before adding new
          mapInstanceRef.current.eachLayer((layer) => {
            if (
              layer.options &&
              layer.options.icon &&
              layer.options.icon.options &&
              layer.options.icon.options.className === "vehicle-marker"
            ) {
              mapInstanceRef.current.removeLayer(layer);
            }
          });
          const marker = L.marker([point.latitude, point.longitude], {
            icon: getVehicleIcon(point.status || point.status1, point.head),
            title: point.car_name || "",
            zIndexOffset: 4000,
          });
          marker.bindPopup(
            `<div style=\"min-width:120px\"><b>${
              point.car_name || ""
            }</b><br/>${point.gps_time || ""}<br/>Status: ${
              point.status || point.status1 || ""
            }<br/>Speed: ${point.speed ?? "-"} km/h</div>`
          );
          // Attach right-click context menu for Create Geofence (pause state)
          marker.on("contextmenu", function (e) {
            setMarkerMenu({
              visible: true,
              x: e.originalEvent.clientX,
              y: e.originalEvent.clientY,
              lat: point.latitude,
              lng: point.longitude,
            });
          });
          marker.addTo(mapInstanceRef.current);
          setCurrentMarker(marker);
          // Center map on this point
          if (mapInstanceRef.current) {
            const map = mapInstanceRef.current;
            const currentZoom = map.getZoom();
            const last = lastViewRef.current;
            if (
              last.lat !== point.latitude ||
              last.lng !== point.longitude ||
              last.zoom !== currentZoom
            ) {
              map.setView([point.latitude, point.longitude], currentZoom, {
                animate: true,
              });
              lastViewRef.current = {
                lat: point.latitude,
                lng: point.longitude,
                zoom: currentZoom,
              };
            }
          }
        }
      }
    }, [currentReplayIndex, isPlaying]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      fitToBounds: handleFitToBounds,
      drawTrack: drawTrack,
      printMap: handlePrintMap,
    }));

    // Add to Map popover state
    const [showAddToMapMenu, setShowAddToMapMenu] = useState(false);
    const [showAdvancedModal, setShowAdvancedModal] = useState(false);

    const controlsZIndex = isMobileMenuOpen ? 10 : 1000;

    // Close popover on outside click
    useEffect(() => {
      if (!showAddToMapMenu) return;
      const handler = (e) => {
        if (!e.target.closest(".add-to-map-popover"))
          setShowAddToMapMenu(false);
      };
      window.addEventListener("mousedown", handler);
      return () => window.removeEventListener("mousedown", handler);
    }, [showAddToMapMenu]);

    return (
      <div className="relative h-full w-full">
        <div ref={mapRef} className="w-full h-full" />
        {/* Geofence Manager for replay map */}
        {showGeofenceOnMap && (
          <ReplayGeofenceManager mapInstanceRef={mapInstanceRef} />
        )}
        {/* Animated Marker Context Menu */}
        <AnimatedMarkerContextMenu
          visible={markerMenu.visible}
          x={markerMenu.x}
          y={markerMenu.y}
          onCreateGeofence={() => {
            setMarkerMenu((m) => ({ ...m, visible: false }));
            if (markerMenu.lat && markerMenu.lng) {
              const url = `/#/create-geofence?lat=${markerMenu.lat}&lng=${markerMenu.lng}`;
              window.open(
                url,
                "_blank",
                "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
              );
            }
          }}
          onClose={() => setMarkerMenu((m) => ({ ...m, visible: false }))}
        />

        {/* Map Controls - Adjust z-index based on mobile menu state */}
        <div
          className={`absolute top-2 left-4 z-[${controlsZIndex}]`}
          style={{ zIndex: controlsZIndex }}
        >
          <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200 relative">
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
            {/* Add to Map Button */}
            <button
              className="flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white ml-2 hover:bg-blue-700 transition-colors relative"
              onClick={() => setShowAddToMapMenu((v) => !v)}
              type="button"
            >
              Add to Map
            </button>
            {/* Add to Map Popover */}
            {showAddToMapMenu && (
              <div className="add-to-map-popover absolute left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[220px] z-50">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGeofenceOnMap}
                      onChange={(e) => {
                        dispatch({
                          type: "replay/setShowGeofenceOnMap",
                          payload: e.target.checked,
                        });
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-800">Show Geofence</span>
                  </label>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-[#25689f] text-sm font-medium"
                    onClick={() => {
                      setShowAdvancedModal(true);
                      setShowAddToMapMenu(false);
                    }}
                  >
                    <Settings size={18} />
                    <span>Advanced Options</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div
          className={`absolute top-2 right-4`}
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
          </div>
        </div>
        {/* Advanced Options Modal */}
        <ReplayAdvancedOptionsModal
          isOpen={showAdvancedModal}
          onClose={() => setShowAdvancedModal(false)}
          // Optionally, you can also call handleFetchGeofence here if you want to fetch on modal open every time
        />
      </div>
    );
  }
);

ReplayMap.displayName = "ReplayMap";

export default ReplayMap;
