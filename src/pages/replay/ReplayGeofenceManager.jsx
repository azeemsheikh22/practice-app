import { useEffect, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import { useSelector } from "react-redux";

const ReplayGeofenceManager = ({ mapInstanceRef }) => {
  // Redux se data lo
  const showGeofences = useSelector((state) => state.replay.showGeofences);
  const showShapes = useSelector((state) => state.replay.showShapes);
//   const showCategories = useSelector((state) => state.replay.showCategories);

  const geofenceMarkersRef = useRef({});
  const geofenceShapesRef = useRef({});

  // Helper: Marker icon
  const createGeofenceIcon = useCallback((iconName) => {
    if (!iconName) return null;
    const iconBaseUrl = "/icons/s";
    const iconPath = `${iconBaseUrl}${iconName}`;
    return L.divIcon({
      className: "geofence-marker",
      html: `<div><img src="${iconPath}" alt="Geofence Icon" class="w-5 h-5 rounded" loading="lazy" /></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  }, []);

  // Helper: Shape
  const createGeofenceShape = useCallback((geofence) => {
    const { ShapeType, latitude, longitude, radius, ColorGeoFence, Polygonlatlng } = geofence;
    if (!latitude || !longitude) return null;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const shapeColor = ColorGeoFence || "#257700";
    if (ShapeType?.toLowerCase() === "circle" && radius) {
      return L.circle([lat, lng], {
        radius: Math.max(1, Math.min(parseFloat(radius), 100000)),
        color: shapeColor,
        fillColor: shapeColor,
        fillOpacity: 0.2,
        weight: 2,
        opacity: 0.8,
      });
    }
    if (ShapeType?.toLowerCase() === "polygon" && Polygonlatlng) {
      const coordinates = Polygonlatlng.split(",").map((coord) => {
        const parts = coord.trim().split(/\s+/);
        return [parseFloat(parts[0]), parseFloat(parts[1])];
      });
      if (coordinates.length < 3) return null;
      return L.polygon(coordinates, {
        color: shapeColor,
        fillColor: shapeColor,
        fillOpacity: 0.2,
        weight: 2,
        opacity: 0.8,
      });
    }
    return null;
  }, []);

  // Main effect: render/hide geofences and shapes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    // Remove all old markers/shapes
    Object.values(geofenceMarkersRef.current).forEach((marker) => {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    Object.values(geofenceShapesRef.current).forEach((shape) => {
      if (map.hasLayer(shape)) map.removeLayer(shape);
    });
    geofenceMarkersRef.current = {};
    geofenceShapesRef.current = {};
    // Render new markers/shapes if showGeofences hai
    if (Array.isArray(showGeofences) && showGeofences.length > 0) {
      showGeofences.forEach((geofence) => {
        if (!geofence.id || geofence.chkShowOnMap !== "true") return;
        // Marker
        const icon = createGeofenceIcon(geofence.icon);
        if (icon) {
          const marker = L.marker([parseFloat(geofence.latitude), parseFloat(geofence.longitude)], {
            icon,
            interactive: true,
            zIndexOffset: 1000,
          });
          marker.addTo(map);
          geofenceMarkersRef.current[geofence.id] = marker;
        }
        // Shape
        if (showShapes) {
          const shape = createGeofenceShape(geofence);
          if (shape) {
            shape.addTo(map);
            geofenceShapesRef.current[geofence.id] = shape;
          }
        }
      });
    }
    // Agar showShapes false ho to shapes remove hi rahenge
  }, [showGeofences, showShapes, mapInstanceRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        Object.values(geofenceMarkersRef.current).forEach((marker) => {
          if (mapInstanceRef.current.hasLayer(marker)) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
        Object.values(geofenceShapesRef.current).forEach((shape) => {
          if (mapInstanceRef.current.hasLayer(shape)) {
            mapInstanceRef.current.removeLayer(shape);
          }
        });
        geofenceMarkersRef.current = {};
        geofenceShapesRef.current = {};
      }
    };
  }, []);

  return null;
};

export default ReplayGeofenceManager;
