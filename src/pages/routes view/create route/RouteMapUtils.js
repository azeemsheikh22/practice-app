import L from "leaflet";
import "leaflet-routing-machine";
import { showCopySuccessMessage, showCopyErrorMessage } from "./mapMessages";

// Context Menu Functions
export const handleShowCoordinates = (contextMenu, mapInstanceRef) => {
  if (contextMenu.lat && contextMenu.lng) {
    const lat = parseFloat(contextMenu.lat.toFixed(6));
    const lng = parseFloat(contextMenu.lng.toFixed(6));

    const popup = L.popup()
      .setLatLng([lat, lng])
      .setContent(
        `
        <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">📍 Coordinates</div>
          <div style="font-size: 12px; color: #374151; margin-bottom: 4px; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">
            Lat: ${lat}
          </div>
          <div style="font-size: 12px; color: #374151; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">
            Lng: ${lng}
          </div>
        </div>
      `
      )
      .openOn(mapInstanceRef.current);
  }
  return { ...contextMenu, visible: false };
};

export const handleCopyCoordinates = async (contextMenu) => {
  if (contextMenu.lat && contextMenu.lng) {
    const lat = parseFloat(contextMenu.lat.toFixed(6));
    const lng = parseFloat(contextMenu.lng.toFixed(6));
    const coordinatesText = `${lat}, ${lng}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(coordinatesText);
        showCopySuccessMessage(coordinatesText);
      } else {
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
  return { ...contextMenu, visible: false };
};

// Create waypoint icon
export const createWaypointIcon = (number) => {
  let color = "#25689f";
  return L.divIcon({
    className: "custom-waypoint-marker",
    html: `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: ${number.toString().length > 1 ? "10px" : "12px"};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">${number}</span>
    </div>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Geocoding Function
export const geocodeLocation = async (locationString) => {
  try {
    const coords = locationString
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return {
        lat: coords[0],
        lng: coords[1],
      };
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationString
      )}&limit=1&countrycodes=pk&accept-language=en`
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

// Add draggable route styles
export const addDraggableRouteStyles = (map) => {
  // Add CSS for draggable route
  const style = document.createElement('style');
  style.textContent = `
    /* Route line hover effects */
    .leaflet-routing-container .leaflet-routing-line {
      cursor: grab !important;
      transition: all 0.2s ease;
    }
    
    .leaflet-routing-container .leaflet-routing-line:hover {
      stroke-width: 8 !important;
      stroke-opacity: 0.9 !important;
      cursor: grab !important;
      filter: drop-shadow(0 0 4px rgba(37, 104, 159, 0.5));
    }
    
    .leaflet-routing-container .leaflet-routing-line:active {
      cursor: grabbing !important;
      stroke-width: 8 !important;
      stroke-opacity: 1 !important;
    }
    
    /* Waypoint drag handles */
    .leaflet-routing-container .leaflet-routing-waypoint {
      cursor: grab !important;
    }
    
    .leaflet-routing-container .leaflet-routing-waypoint:hover {
      cursor: grab !important;
    }
    
    .leaflet-routing-container .leaflet-routing-waypoint:active {
      cursor: grabbing !important;
    }
  `;
  
  if (!document.head.querySelector('#draggable-route-styles')) {
    style.id = 'draggable-route-styles';
    document.head.appendChild(style);
  }
};

// Route Calculation with Draggable Support
export const calculateMultiWaypointRoute = async (
  coordinates, 
  routeLayer, 
  mapInstanceRef, 
  setRouteLayer, 
  dispatch, 
  setRouteCalculationData, 
  onRouteCalculated
) => {
  if (coordinates.length < 2) {
    if (routeLayer) {
      mapInstanceRef.current.removeControl(routeLayer);
      setRouteLayer(null);
    }
    return;
  }

  try {
    // Remove existing route
    if (routeLayer) {
      mapInstanceRef.current.removeControl(routeLayer);
      setRouteLayer(null);
    }

    // Convert coordinates to Leaflet LatLng format
    const waypoints = coordinates.map(coord => L.latLng(coord.lat, coord.lng));

    // Create routing control with drag support
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: true,
      addWaypoints: true,
      draggableWaypoints: true,
      createMarker: function() { return null; },
      lineOptions: {
        styles: [{
          color: '#25689f',
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      }),
      show: false,
      fitSelectedRoutes: false,
      autoRoute: true,
      routeWhileDragging: true
    }).on('routesfound', function(e) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        
        const routeData = {
          distance: `${(route.summary.totalDistance / 1000).toFixed(1)} km`,
          duration: `${Math.round(route.summary.totalTime / 60)} min`,
          geometry: {
            type: "LineString",
            coordinates: route.coordinates.map(coord => [coord.lng, coord.lat])
          },
          waypoints: coordinates,
          legs: route.instructions || [],
          totalWaypoints: coordinates.length,
        };

        dispatch(setRouteCalculationData(routeData));

        if (onRouteCalculated) {
          onRouteCalculated(routeData);
        }

        // Add custom styling for draggable route line
        setTimeout(() => {
          addDraggableRouteStyles(mapInstanceRef.current);
        }, 500);
      }
    }).addTo(mapInstanceRef.current);

    setRouteLayer(routingControl);

  } catch (error) {
    console.error("Multi-waypoint route calculation error:", error);
    if (routeLayer) {
      mapInstanceRef.current.removeControl(routeLayer);
      setRouteLayer(null);
    }
    dispatch(setRouteCalculationData(null));
    if (onRouteCalculated) {
      onRouteCalculated(null);
    }
  }
};

// Initialize Map Tile Layer
export const initializeMapTileLayer = (map, type = "street") => {
  const tileUrl =
    type === "satellite"
      ? "https://{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
      : "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}";

  const tileLayer = L.tileLayer(tileUrl, {
    minZoom: 3,
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "© Google",
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 2,
  }).addTo(map);

  return tileLayer;
};

// Create draggable marker
export const createDraggableWaypointMarker = (
  waypoint, 
  coords, 
  isStart, 
  isEnd, 
  mapInstance, 
  onMarkerDragEnd
) => {
  const marker = L.marker([coords.lat, coords.lng], {
    icon: createWaypointIcon(waypoint.id),
    draggable: true,
  }).addTo(mapInstance);
  
  marker.on('dragend', async (e) => {
    const newPosition = e.target.getLatLng();
    const lat = parseFloat(newPosition.lat.toFixed(6));
    const lng = parseFloat(newPosition.lng.toFixed(6));
    
    if (onMarkerDragEnd) {
      onMarkerDragEnd(waypoint.id, `${lat}, ${lng}`);
    }
  });
  
  return marker;
};
