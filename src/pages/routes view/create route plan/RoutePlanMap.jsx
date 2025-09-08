import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const RoutePlanMap = ({ selectedRoutesData = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Keep track of drawn layers so we can remove them when routes change
  const drawnLayersRef = useRef([]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 6); // Center on Pakistan

      L.tileLayer("https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}", {
        minZoom: 3,
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google",
      }).addTo(map);

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

  // Helper: parse a routeString like "lat lng,lat lng,..." into [[lat,lng],...]
  const parseRouteString = (routeString) => {
    if (!routeString || typeof routeString !== "string") return [];
    try {
      return routeString
        .split(/,/) // split by comma
        .map((pt) => pt.trim())
        .filter(Boolean)
        .map((pt) => {
          // Accept both 'lat lng' and 'lat,lng' (if any)
          const parts = pt.split(/\s+/);
          if (parts.length < 2) return null;
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
          return null;
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  };

  // Whenever selectedRoutesData changes, log and draw polylines
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // remove previously drawn layers
    const map = mapInstanceRef.current;
    drawnLayersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (e) {}
    });
    drawnLayersRef.current = [];

    if (!Array.isArray(selectedRoutesData) || selectedRoutesData.length === 0)
      return;

    const pathColor = "#225F90";
    const bounds = [];

    selectedRoutesData.forEach((route, idx) => {
      const routeString =
        route.routeString || route.routeStringRaw || route.route || "";
      const latlngs = parseRouteString(routeString);
      if (latlngs.length > 0) {
        try {
          const color = pathColor;
          // slightly lighter stroke with a bit more weight for visibility
          const poly = L.polyline(latlngs, {
            color: color,
            weight: 5,
            opacity: 0.85,
          }).addTo(map);
          drawnLayersRef.current.push(poly);

          // start and end markers (circle markers) with hover tooltip showing route name
          const start = latlngs[0];
          const end = latlngs[latlngs.length - 1];
          const label = (
            route.routeName ||
            route.routeName ||
            route.name ||
            `Route ${route.id}`
          )
            .toString()
            .trim();

          const startMarker = L.circleMarker(start, {
            radius: 6,
            color: color,
            fillColor: "#ffffff",
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
          const endMarker = L.circleMarker(end, {
            radius: 6,
            color: color,
            fillColor: "#ffffff",
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);

          // bind tooltip (shows on hover)
          startMarker.bindTooltip(label, { direction: "top", offset: [0, -8] });
          endMarker.bindTooltip(label + " (end)", {
            direction: "top",
            offset: [0, -8],
          });

          // open tooltip on mouseover, close on mouseout for better UX
          startMarker.on("mouseover", function (e) {
            this.openTooltip();
          });
          startMarker.on("mouseout", function (e) {
            this.closeTooltip();
          });
          endMarker.on("mouseover", function (e) {
            this.openTooltip();
          });
          endMarker.on("mouseout", function (e) {
            this.closeTooltip();
          });

          drawnLayersRef.current.push(startMarker, endMarker);
          latlngs.forEach((p) => bounds.push(p));
        } catch (e) {
          // drawing failed for this route; skip
        }
      }
    });

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (e) {}
    }
  }, [selectedRoutesData]);

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
