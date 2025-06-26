import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  memo,
  useCallback,
} from "react";
import "../../styles/mapCluster.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsFullScreen,
  selectMapType,
  selectShowTraffic,
  setFullScreen,
} from "../../features/mapControlsSlice";
import {
  setMapRefs,
  toggleFullScreenThunk,
  changeMapTypeThunk,
  toggleTrafficThunk,
} from "../../features/mapControlsThunks";
import FullscreenButton from "../../components/map/FullscreenButton";
import MapTypeSelector from "../../components/map/MapTypeSelector";
import ZoomControls from "../../components/map/ZoomControls";
import VehicleMarkersManager from "../../components/map/VehicleMarkersManager";
import "../../styles/mapTooltips.css";
import DistanceMeasurementTool from "../../components/map/DistanceMeasurementTool";
import "../../styles/distanceTool.css";
// Add import at the top
import "../../styles/routeStyles.css";
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
import ContextMenus from "../../components/map/ContextMenus";

// Optimized marker movement and rotation plugin for better performance
L.Marker.include({
  slideTo: function (newLatLng, options) {
    options = options || {};
    const duration = options.duration || 1000;
    const startLatLng = this.getLatLng();
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const lat = startLatLng.lat + (newLatLng[0] - startLatLng.lat) * progress;
      const lng = startLatLng.lng + (newLatLng[1] - startLatLng.lng) * progress;
      this.setLatLng([lat, lng]);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
    return this;
  },

  setRotationAngle: function (angle) {
    const icon = this._icon;
    if (!icon) return this;
    const currentTransform = icon.style.transform || "";
    const newTransform = currentTransform.replace(/rotate\(.*?deg\)/, "");
    icon.style.transform = `${newTransform} rotate(${angle}deg)`;
    icon.style.transformOrigin = "center center";
    return this;
  },
});

const MapContainer = memo(
  forwardRef((props, ref) => {
    const { searchQuery } = props;
    const mapRef = useRef(null);
    const [mapError, setMapError] = useState(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const [isMapFitted, setIsMapFitted] = useState(false);
    const tileLayerRef = useRef(null);
    const trafficLayerRef = useRef(null);
    const markerClusterRef = useRef(null);
    const locationMarkerRef = useRef(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      lat: null,
      lng: null,
    });

    // Distance Tool State - YE ADD KAREIN
    const [distanceToolActive, setDistanceToolActive] = useState(false);
    // Use Redux selectors instead of local state
    const isFullScreen = useSelector(selectIsFullScreen);
    const mapType = useSelector(selectMapType);
    const showTraffic = useSelector(selectShowTraffic);
    const dispatch = useDispatch();

    // Add this state after the existing contextMenu state (around line 60)
    const [vehicleContextMenu, setVehicleContextMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      vehicleData: null,
    });

    // Add this function after the existing context menu handlers (around line 200)
    const handleVehicleContextMenu = useCallback((vehicleData, x, y) => {
      setVehicleContextMenu({
        visible: true,
        x: x,
        y: y,
        vehicleData: vehicleData,
      });
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }, []);

    // Add vehicle menu handlers
    const handleVehicleMenuAction = useCallback((action, vehicleData) => {
      switch (action) {
        case "findNearest":
          break;
        case "viewReplay":
          break;
        case "dailyReport":
          break;
        case "detailedReport":
          break;
        case "zoomTo":
          if (
            mapInstanceRef.current &&
            markersRef.current[vehicleData.car_id]
          ) {
            const marker = markersRef.current[vehicleData.car_id];
            mapInstanceRef.current.setView(marker.getLatLng(), 18);
            marker.openPopup();
          }
          break;
        case "createGeofence":
          if (vehicleData.latitude && vehicleData.longitude) {
            const lat = parseFloat(vehicleData.latitude.toFixed(6));
            const lng = parseFloat(vehicleData.longitude.toFixed(6));
            const url = `/#/create-geofence?lat=${lat}&lng=${lng}`;
            const newWindow = window.open(
              url,
              "CreateGeofence",
              "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
            );
            if (newWindow) {
              newWindow.focus();
            } else {
              alert("Please allow popups for this site to create geofences");
            }
          }
          break;
        case "removeFromMap":
          break;
        case "directionsTo":
          break;
        case "directionsFrom":
          break;
        case "editVehicle":
          break;
        case "editDriver":
          break;
        case "sendMessage":
          break;
        case "roadsideAssistance":
          break;
        default:
          break;
      }

      // Close menu
      setVehicleContextMenu((prev) => ({ ...prev, visible: false }));
    }, []);

    // Hide vehicle context menu function
    const hideVehicleContextMenu = () => {
      setVehicleContextMenu({ ...vehicleContextMenu, visible: false });
    };

    // Memoized function to check if coordinates are valid
    const isValidCoordinate = (lat, lng) =>
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0;

    // Context Menu Functions ko update karein
    const handleZoomToLocation = () => {
      if (mapInstanceRef.current && contextMenu.lat && contextMenu.lng) {
        // Zoom level ko 18 se 15 kar diya (less zoom)
        mapInstanceRef.current.setView([contextMenu.lat, contextMenu.lng], 15, {
          animate: true,
          duration: 1.5,
        });
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleCreateGeofence = () => {
      if (contextMenu.lat && contextMenu.lng) {
        // Round to 6 decimal places for reasonable precision (about 11cm accuracy)
        const lat = parseFloat(contextMenu.lat.toFixed(6));
        const lng = parseFloat(contextMenu.lng.toFixed(6));

        // Create URL with rounded coordinates and hash prefix for HashRouter
        const url = `/#/create-geofence?lat=${lat}&lng=${lng}`;
        // Open create geofence in new window with parameters
        const newWindow = window.open(
          url,
          "CreateGeofence",
          "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
        );

        if (newWindow) {
          newWindow.focus();
        } else {
          // Fallback if popup blocked
          alert("Please allow popups for this site to create geofences");
        }
      }

      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleMeasureDistance = () => {
      setDistanceToolActive(true);
      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleOpenStreetView = () => {
      if (contextMenu.lat && contextMenu.lng) {
        // Pehle location pe zoom karein
        mapInstanceRef.current.setView([contextMenu.lat, contextMenu.lng], 18);

        // Phir satellite view pe switch karein
        if (mapType !== "satellite") {
          dispatch(changeMapTypeThunk("satellite"));
        }
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    // NEW FUNCTION - Copy Coordinates
    const handleCopyCoordinates = async () => {
      if (contextMenu.lat && contextMenu.lng) {
        const coordinatesText = `${contextMenu.lat.toFixed(
          6
        )}, ${contextMenu.lng.toFixed(6)}`;

        try {
          // Modern clipboard API
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(coordinatesText);
            // Show success message
            showCopySuccessMessage(coordinatesText);
          } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = coordinatesText;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
              document.execCommand("copy");
              showCopySuccessMessage(coordinatesText);
            } catch (err) {
              console.error("Failed to copy coordinates:", err);
              // Show error message
              showCopyErrorMessage();
            } finally {
              document.body.removeChild(textArea);
            }
          }
        } catch (err) {
          console.error("Failed to copy coordinates:", err);
          showCopyErrorMessage();
        }
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    // NEW FUNCTION - Show Copy Success Message
    const showCopySuccessMessage = (coordinates) => {
      // Create temporary success message
      const successDiv = document.createElement("div");
      successDiv.innerHTML = `
      <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideInRight 0.3s ease-out;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Coordinates copied: ${coordinates}
    </div>
  `;

      // Add CSS animation
      if (!document.getElementById("copy-success-animation")) {
        const style = document.createElement("style");
        style.id = "copy-success-animation";
        style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
      }

      document.body.appendChild(successDiv);

      // Remove after 3 seconds with animation
      setTimeout(() => {
        successDiv.firstElementChild.style.animation =
          "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
          }
        }, 300);
      }, 3000);
    };

    // NEW FUNCTION - Show Copy Error Message
    const showCopyErrorMessage = () => {
      const errorDiv = document.createElement("div");
      errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideInRight 0.3s ease-out;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      Failed to copy coordinates
    </div>
  `;

      document.body.appendChild(errorDiv);

      setTimeout(() => {
        errorDiv.firstElementChild.style.animation =
          "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 300);
      }, 2000);
    };

    // Distance tool handlers - YE ADD KAREIN
    const handleDistanceToolClose = () => {
      setDistanceToolActive(false);
    };

    const handleMeasurementComplete = (measurementData) => {
      // Yahan aap measurement data ko save kar sakte hain ya koi action le sakte hain
    };

    // Update the existing hideContextMenu function
    const hideContextMenu = useCallback(() => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
      setVehicleContextMenu((prev) => ({ ...prev, visible: false }));
      setGeofenceContextMenu((prev) => ({ ...prev, visible: false })); // ADD THIS LINE
    }, []);

    // Set up refs for the thunks
    useEffect(() => {
      if (mapInstanceRef.current) {
        setMapRefs({
          mapInstanceRef,
          mapElementRef: mapRef,
          tileLayerRef,
          trafficLayerRef,
        });
      }
    }, [mapInstanceRef.current]);

    // Handle fullscreen changes from browser API
    useEffect(() => {
      const handleFullScreenChange = () => {
        const isCurrentlyFullScreen = !!document.fullscreenElement;
        if (isFullScreen !== isCurrentlyFullScreen) {
          dispatch(setFullScreen(isCurrentlyFullScreen));
        }
      };

      document.addEventListener("fullscreenchange", handleFullScreenChange);
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
      };
    }, [isFullScreen, dispatch]);

    // Update the window.openStreetView function in your useEffect
    useEffect(() => {
      // Define global functions for the popup buttons
      window.zoomToVehicle = (carId) => {
        const marker = markersRef.current[carId];
        if (marker && mapInstanceRef.current) {
          mapInstanceRef.current.setView(marker.getLatLng(), 18);
        }
      };

      window.openStreetView = (lat, lng) => {
        if (lat && lng && mapInstanceRef.current) {
          // First zoom to the location
          mapInstanceRef.current.setView([lat, lng], 19);
          // Then switch to satellite view
          if (mapType !== "satellite") {
            dispatch(changeMapTypeThunk("satellite"));
          }
        }
      };

      return () => {
        // Clean up global functions when component unmounts
        delete window.zoomToVehicle;
        delete window.openStreetView;
      };
    }, [mapType, dispatch]);

    // Inside the useImperativeHandle hook
    useImperativeHandle(ref, () => ({
      fitToAllMarkers: () => {
        if (mapInstanceRef.current) {
          // Close any open popups first
          mapInstanceRef.current.closePopup();
          const markerCount = Object.keys(markersRef.current).length;

          // If there are no markers, zoom to Pakistan with same zoom level
          if (markerCount === 0) {
            mapInstanceRef.current.setView([30.3753, 69.3451], 5.5, {
              animate: true,
              duration: 1.5,
            });
            setIsMapFitted(true);
            setTimeout(() => setIsMapFitted(false), 1000);
            return true;
          }
          // If there's only one marker, zoom to it
          else if (markerCount === 1) {
            const marker = Object.values(markersRef.current)[0];
            mapInstanceRef.current.setView(marker.getLatLng(), 18);
            setIsMapFitted(true);
            setTimeout(() => setIsMapFitted(false), 1000);
            return true;
          }
          // If there are multiple markers, fit them all
          else {
            const bounds = L.latLngBounds(
              Object.values(markersRef.current)
                .map((marker) => marker.getLatLng())
                .filter((pos) => isValidCoordinate(pos.lat, pos.lng))
            );

            if (bounds.isValid()) {
              mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
              setIsMapFitted(true);
              setTimeout(() => setIsMapFitted(false), 1000);
              return true;
            }
          }
        }
        return false;
      },

      zoomToPakistan: () => {
        if (mapInstanceRef.current) {
          // Same coordinates aur zoom level use karein jo initial map mein hai
          mapInstanceRef.current.setView([30.3753, 69.3451], 5.5, {
            animate: true,
            duration: 1.5,
          });
          setIsMapFitted(true);
          setTimeout(() => setIsMapFitted(false), 1000);
          return true;
        }
        return false;
      },

      zoomToLocation: (lat, lng, locationName, isCoordinates = false) => {
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;

          // Close any open popups
          map.closePopup();

          // Remove previous location marker if exists
          if (
            locationMarkerRef.current &&
            map.hasLayer(locationMarkerRef.current)
          ) {
            map.removeLayer(locationMarkerRef.current);
          }

          // Create appropriate marker based on type
          const markerIcon = isCoordinates
            ? L.divIcon({
                className: "coordinates-search-marker",
                html: `
                <div style="
                  background: #2563eb; 
                  border: 3px solid white; 
                  border-radius: 50%; 
                  width: 28px; 
                  height: 28px;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                  position: relative;
                  animation: coordinatesPulse 2s infinite;
                  z-index: 1000;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                  "></div>
                </div>
              `,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                popupAnchor: [0, -14],
              })
            : L.divIcon({
                className: "location-search-marker",
                html: `
                <div style="
                  background: #ef4444; 
                  border: 3px solid white; 
                  border-radius: 50%; 
                  width: 24px; 
                  height: 24px;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                  position: relative;
                  animation: locationPulse 2s infinite;
                  z-index: 1000;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                  "></div>
                </div>
              `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12],
              });

          const locationMarker = L.marker([lat, lng], {
            icon: markerIcon,
            isLocationMarker: true,
          });

          // Store reference to location marker
          locationMarkerRef.current = locationMarker;

          // Add marker to map
          locationMarker.addTo(map);

          // Create popup content based on type
          const popupContent = isCoordinates
            ? `
            <div style="
              text-align: center; 
              padding: 12px 16px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              min-width: 200px;
            ">
              <div style="
                font-weight: 600;
                font-size: 16px;
                color: #1f2937;
                margin-bottom: 8px;
                line-height: 1.3;
              ">📍 Coordinates</div>
              <div style="
                font-size: 13px;
                color: #374151;
                margin-bottom: 4px;
                font-family: monospace;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 4px;
              ">Lat: ${lat.toFixed(6)}</div>
              <div style="
                font-size: 13px;
                color: #374151;
                margin-bottom: 8px;
                font-family: monospace;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 4px;
              ">Lng: ${lng.toFixed(6)}</div>
              <div style="
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">🎯 Geographic Location</div>
            </div>
          `
            : `
            <div style="
              text-align: center; 
              padding: 8px 12px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              min-width: 150px;
            ">
              <div style="
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                margin-bottom: 4px;
                line-height: 1.3;
              ">${locationName.split(",")[0]}</div>
              <div style="
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">📍 Searched Location</div>
            </div>
          `;

          locationMarker
            .bindPopup(popupContent, {
              closeButton: true,
              autoClose: false,
              closeOnClick: false,
              className: isCoordinates
                ? "coordinates-search-popup"
                : "location-search-popup",
            })
            .openPopup();

          // Zoom to location with appropriate zoom level
          const zoomLevel = isCoordinates ? 16 : 15;
          map.setView([lat, lng], zoomLevel, {
            animate: true,
            duration: 1.5,
            easeLinearity: 0.25,
          });

          // Set map fitted state
          setIsMapFitted(true);
          setTimeout(() => setIsMapFitted(false), 2000);

          // Remove location marker after 15 seconds
          setTimeout(() => {
            if (
              locationMarkerRef.current &&
              map.hasLayer(locationMarkerRef.current)
            ) {
              // Add fade out animation
              const markerElement = locationMarkerRef.current.getElement();
              if (markerElement) {
                markerElement.style.transition = "opacity 1s ease-out";
                markerElement.style.opacity = "0";

                setTimeout(() => {
                  if (
                    locationMarkerRef.current &&
                    map.hasLayer(locationMarkerRef.current)
                  ) {
                    map.removeLayer(locationMarkerRef.current);
                    locationMarkerRef.current = null;
                  }
                }, 1000);
              }
            }
          }, 15000);

          return true;
        }
        return false;
      },

      resetAutoZoom: () => {
        // This will be called from parent component if needed
        if (mapInstanceRef.current) {
          // You can dispatch an event or use a callback to reset VehicleMarkersManager state
          window.dispatchEvent(new CustomEvent("resetAutoZoom"));
        }
      },

      isMapFitted: () => isMapFitted,
      toggleFullScreen: () => dispatch(toggleFullScreenThunk()),
      closeAllPopups: () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.closePopup();
        }
      },
    }));

    useEffect(() => {
      let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
          renderer: L.canvas({ padding: 0.5 }),
          minZoom: 3,
          maxZoom: 20,
        }).setView([30.3753, 69.3451], 5.5);

        mapInstanceRef.current = map;

        // Disable default browser context menu on map
        map.getContainer().addEventListener("contextmenu", function (e) {
          e.preventDefault();
          return false;
        });

        // Add custom right-click context menu
        map.on("contextmenu", function (e) {
          const { lat, lng } = e.latlng;
          const { x, y } = e.containerPoint;

          // Get the map container's position
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

        // Hide context menu on map click
        map.on("click", function () {
          hideContextMenu();
        });

        map.on("zoomstart", () => {
          // Close context menu when zooming
          hideContextMenu();

          // Close only non-permanent tooltips when zooming starts
          map.eachLayer((layer) => {
            if (
              layer.getTooltip &&
              layer.getTooltip() &&
              !layer.getTooltip().options.permanent
            ) {
              layer.closeTooltip();
            }
          });
          map._container.classList.add("leaflet-zoom-anim");
        });

        map.on("zoomend", () => {
          map._container.classList.remove("leaflet-zoom-anim");
        });

        map.on("movestart", () => {
          // Close context menu when moving
          hideContextMenu();

          // Close only non-permanent tooltips when map movement starts
          map.eachLayer((layer) => {
            if (
              layer.getTooltip &&
              layer.getTooltip() &&
              !layer.getTooltip().options.permanent
            ) {
              layer.closeTooltip();
            }
          });
          map._container.classList.add("map-moving");
        });

        map.on("moveend", () => {
          map._container.classList.remove("map-moving");
          setIsMapFitted(false);
        });

        // Add a custom CSS class to the map container for better tooltip handling
        map._container.classList.add("map-with-tooltips");

        // Add a custom style element for dynamic tooltip styles
        const tooltipStyle = document.createElement("style");
        tooltipStyle.id = "tooltip-optimization-style";
        // Updated CSS styles
        tooltipStyle.textContent = `
         .map-moving .leaflet-tooltip {
           opacity: 0 !important;
          pointer-events: none !important;
          }
  
          .leaflet-marker-icon {
          pointer-events: auto !important;
          }
  
          .leaflet-marker-icon:hover {
          z-index: 1000 !important;
          }
  
          .location-search-marker {
          z-index: 1001 !important; /* Higher than vehicle markers */
          pointer-events: auto !important;
          }
  
          .location-search-popup {
          z-index: 1002 !important;
          }
  
          .location-search-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
          }
  
          .location-search-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
          }
  
          .location-search-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-right: none;
        }
  
          @keyframes locationPulse {
            0% {
            transform: scale(1);
            opacity: 1;
          }
            50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
          }
          `;

        document.head.appendChild(tooltipStyle);

        // Create marker cluster group with proper icon creation function
        const markerCluster = L.markerClusterGroup({
          disableClusteringAtZoom: 14,
          spiderfyOnMaxZoom: false,
          maxClusterRadius: 80,
          chunkedLoading: true,
          zoomToBoundsOnClick: true,
          removeOutsideVisibleBounds: true,
          // Add custom icon creation function
          iconCreateFunction: function (cluster) {
            // Get all markers in this cluster
            const markers = cluster.getAllChildMarkers();
            const childCount = markers.length;
            // Count vehicles by status
            const statusCounts = {
              moving: 0,
              idle: 0,
              stop: 0,
            };

            // Count vehicles by their status
            markers.forEach((marker) => {
              const status = (marker.vehicleStatus || "").toLowerCase();
              if (status === "moving") statusCounts.moving++;
              else if (status === "idle") statusCounts.idle++;
              else statusCounts.stop++;
            });

            // Create size class based on count
            let sizeClass = " marker-cluster-";
            if (childCount < 10) {
              sizeClass += "small";
            } else if (childCount < 100) {
              sizeClass += "medium";
            } else {
              sizeClass += "large";
            }

            // Create the cluster icon
            const clusterIcon = new L.DivIcon({
              html:
                '<div class="cluster-icon"><span>' +
                childCount +
                "</span></div>",
              className: "marker-cluster" + sizeClass,
              iconSize: new L.Point(40, 40),
            });

            return clusterIcon;
          },
        });

        markerClusterRef.current = markerCluster;

        // Clear any existing event listeners to prevent duplication
        markerCluster.off("clustermouseover");
        markerCluster.off("clustermouseout");

        // Add event listeners for cluster tooltips
        markerCluster.on("clustermouseover", function (event) {
          const cluster = event.layer;
          // Close any other open tooltips first to prevent duplication
          map.eachLayer(function (layer) {
            if (layer._tooltip && layer !== cluster) {
              layer.closeTooltip();
            }
          });

          // Get all markers in this cluster
          const markers = cluster.getAllChildMarkers();
          // Count vehicles by status directly from markers
          const statusCounts = {
            moving: 0,
            idle: 0,
            stop: 0,
          };

          markers.forEach((marker) => {
            const status = (marker.vehicleStatus || "").toLowerCase();
            if (status === "moving") statusCounts.moving++;
            else if (status === "idle") statusCounts.idle++;
            else statusCounts.stop++;
          });

          const totalCount = markers.length;

          // Create tooltip content with icons and counts
          const tooltipContent = `
           <div class="cluster-tooltip-content">
           <div class="cluster-tooltip-header">
          <span class="cluster-tooltip-title">Vehicle Cluster</span>
           <span class="cluster-tooltip-count-badge">${totalCount}</span>
          </div>
          <div class="cluster-tooltip-body">
          <div class="cluster-tooltip-item">
          <div class="cluster-tooltip-icon-wrapper moving">
          <img src="${movingIcon}" class="cluster-tooltip-icon" alt="Moving" />
          </div>
          <span class="cluster-tooltip-label">Moving</span>
          <span class="cluster-tooltip-count">${statusCounts.moving}</span>
          </div>
          <div class="cluster-tooltip-item">
          <div class="cluster-tooltip-icon-wrapper idle">
          <img src="${idleIcon}" class="cluster-tooltip-icon" alt="Idle" />
          </div>
          <span class="cluster-tooltip-label">Idle</span>
          <span class="cluster-tooltip-count">${statusCounts.idle}</span>
          </div>
          <div class="cluster-tooltip-item">
          <div class="cluster-tooltip-icon-wrapper stopped">
          <img src="${stoppedIcon}" class="cluster-tooltip-icon" alt="Stopped" />
          </div>
          <span class="cluster-tooltip-label">Stopped</span>
          <span class="cluster-tooltip-count">${statusCounts.stop}</span>
          </div>
          </div>
          </div>`;

          // Unbind any existing tooltip to prevent duplication
          if (cluster.getTooltip()) {
            cluster.unbindTooltip();
          }

          // Bind tooltip to cluster
          cluster.bindTooltip(tooltipContent, {
            direction: "top",
            offset: [0, -10],
            className: "cluster-tooltip",
            opacity: 1,
          });

          // Open the tooltip
          cluster.openTooltip();
        });

        // Close tooltip when mouse leaves cluster
        markerCluster.on("clustermouseout", function (event) {
          const cluster = event.layer;
          if (cluster.getTooltip()) {
            cluster.closeTooltip();
          }
        });

        const tileLayer = L.tileLayer(
          "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
          {
            minZoom: 3,
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: "© Google",
            updateWhenIdle: true,
            updateWhenZooming: false,
            keepBuffer: 2,
          }
        ).addTo(map);

        tileLayerRef.current = tileLayer;

        map.on("fullscreenchange", () => map.invalidateSize());
      }

      // Update the handleGlobalClick function
      const handleGlobalClick = (e) => {
        // Check if click is outside context menus
        if (
          !e.target.closest(".map-context-menu") &&
          !e.target.closest("[class*='context-menu']")
        ) {
          hideContextMenu();
          hideVehicleContextMenu();
          hideGeofenceContextMenu(); // ADD THIS LINE
        }
      };

      document.addEventListener("click", handleGlobalClick);

      return () => {
        // Remove global click listener
        document.removeEventListener("click", handleGlobalClick);

        // Remove custom style element
        const tooltipStyle = document.getElementById(
          "tooltip-optimization-style"
        );
        if (tooltipStyle) {
          tooltipStyle.remove();
        }

        // Clean up location marker
        if (locationMarkerRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(locationMarkerRef.current);
          locationMarkerRef.current = null;
        }

        mapInstanceRef.current?.remove();
        mapInstanceRef.current = null;
        markerClusterRef.current = null;
      };
    }, []);

    // New handler functions
    const handleFindNearest = () => {
      if (contextMenu.lat && contextMenu.lng) {
        // Add your find nearest logic here
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleSendToGarmin = () => {
      if (contextMenu.lat && contextMenu.lng) {
        // Add your Garmin integration logic here
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleGetDirectionsTo = () => {
      if (contextMenu.lat && contextMenu.lng) {
        // Add your directions logic here
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleGetDirectionsFrom = () => {
      if (contextMenu.lat && contextMenu.lng) {
        // Add your directions logic here
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    const handleOpenDriverDispatch = () => {
      if (contextMenu.lat && contextMenu.lng) {
      }
      setContextMenu({ ...contextMenu, visible: false });
    };

    // Add geofence context menu state
    const [geofenceContextMenu, setGeofenceContextMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      geofenceData: null,
    });

    // Add geofence context menu handler
    const handleGeofenceContextMenu = useCallback((geofenceData, x, y) => {
      setGeofenceContextMenu({
        visible: true,
        x: x,
        y: y,
        geofenceData: geofenceData,
      });
      // Hide other context menus
      setContextMenu((prev) => ({ ...prev, visible: false }));
      setVehicleContextMenu((prev) => ({ ...prev, visible: false }));
    }, []);

    // Add geofence menu action handler
    const handleGeofenceMenuAction = useCallback(
      (action, geofenceData) => {
        switch (action) {
          case "zoomTo":
            if (
              mapInstanceRef.current &&
              geofenceData.latitude &&
              geofenceData.longitude
            ) {
              const lat = parseFloat(geofenceData.latitude);
              const lng = parseFloat(geofenceData.longitude);
              mapInstanceRef.current.setView([lat, lng], 16);
            }
            break;
          case "streetView":
            if (geofenceData.latitude && geofenceData.longitude) {
              const lat = parseFloat(geofenceData.latitude);
              const lng = parseFloat(geofenceData.longitude);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([lat, lng], 18);
                if (mapType !== "satellite") {
                  dispatch(changeMapTypeThunk("satellite"));
                }
              }
            }
            break;
          case "editPlace":
            // Edit place logic here
            break;
          case "sendToGarmin":
            // Send to Garmin logic here
            break;
          default:
            break;
        }

        // Close menu
        setGeofenceContextMenu((prev) => ({ ...prev, visible: false }));
      },
      [mapInstanceRef, mapType, dispatch]
    );

    // Hide geofence context menu function
    const hideGeofenceContextMenu = () => {
      setGeofenceContextMenu({ ...geofenceContextMenu, visible: false });
    };

    return (
      <div className="relative w-full h-full">
        {mapError && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 z-50">
            Error: {mapError}
            <button
              className="ml-2 bg-white text-red-500 px-2 rounded"
              onClick={() => setMapError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full z-0"></div>

        {/* Context Menus Component */}
        <ContextMenus
          // Context Menu Props
          contextMenu={contextMenu}
          handleZoomToLocation={handleZoomToLocation}
          handleCopyCoordinates={handleCopyCoordinates}
          handleCreateGeofence={handleCreateGeofence}
          handleMeasureDistance={handleMeasureDistance}
          handleOpenStreetView={handleOpenStreetView}
          handleFindNearest={handleFindNearest}
          handleSendToGarmin={handleSendToGarmin}
          handleGetDirectionsTo={handleGetDirectionsTo}
          handleGetDirectionsFrom={handleGetDirectionsFrom}
          handleOpenDriverDispatch={handleOpenDriverDispatch}
          // Vehicle Context Menu Props
          vehicleContextMenu={vehicleContextMenu}
          handleVehicleMenuAction={handleVehicleMenuAction}
          // Geofence Context Menu Props
          geofenceContextMenu={geofenceContextMenu}
          handleGeofenceMenuAction={handleGeofenceMenuAction}
        />

        {/* Distance Measurement Tool - YE ADD KAREIN */}
        <DistanceMeasurementTool
          mapInstanceRef={mapInstanceRef}
          isActive={distanceToolActive}
          onClose={handleDistanceToolClose}
          onMeasurementComplete={handleMeasurementComplete}
        />

        {/* Vehicle Markers Manager Component */}
        <VehicleMarkersManager
          mapInstanceRef={mapInstanceRef}
          searchQuery=""
          markersRef={markersRef}
          markerClusterRef={markerClusterRef}
          onVehicleContextMenu={handleVehicleContextMenu}
          onGeofenceContextMenu={handleGeofenceContextMenu}
        />

        {/* Map Controls */}
        <FullscreenButton
          isFullScreen={isFullScreen}
          toggleFullScreen={() => dispatch(toggleFullScreenThunk())}
        />
        <MapTypeSelector
          mapType={mapType}
          showTraffic={showTraffic}
          onChangeMapType={(type) => dispatch(changeMapTypeThunk(type))}
          onToggleTraffic={() => dispatch(toggleTrafficThunk())}
        />
        <ZoomControls
          onZoomIn={() => mapInstanceRef.current?.zoomIn()}
          onZoomOut={() => mapInstanceRef.current?.zoomOut()}
        />

        {/* Map Fitted Indicator */}
        {isMapFitted && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
              🎯 Map Fitted
            </div>
          </div>
        )}
      </div>
    );
  })
);

MapContainer.displayName = "MapContainer";

export default MapContainer;
