import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import L from "leaflet";
import { useSelector } from "react-redux";

// ✅ PERFORMANCE: Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const GeofenceManager = ({
  mapInstanceRef,
  geofences,
  showGeofences,
  geofenceMarkersRef = useRef({}),
  onGeofenceContextMenu,
}) => {
  const prevGeofencesRef = useRef({});
  const prevShowGeofencesRef = useRef(showGeofences);
  const geofenceShapesRef = useRef({});

  // ✅ PERFORMANCE: Track map state for viewport culling
  const [mapBounds, setMapBounds] = useState(null);
  const [mapZoom, setMapZoom] = useState(7);

  const showShapes = useSelector((state) => state.geofence.showShapes);
  const selectedGeofenceShapes = useSelector((state) => state.geofence.selectedGeofenceShapes);

  // ✅ PERFORMANCE: Memoized icon creation with caching
  const iconCache = useRef(new Map());

  const createGeofenceIcon = useCallback((iconName) => {
    if (!iconName) return null;

    // Check cache first
    if (iconCache.current.has(iconName)) {
      return iconCache.current.get(iconName);
    }

    const iconBaseUrl = "/icons/s";
    const iconPath = `${iconBaseUrl}${iconName}`;

    const icon = L.divIcon({
      className: "geofence-marker",
      html: `
        <div>
          <img 
            src="${iconPath}" 
            alt="Geofence Icon" 
            class="w-5 h-5 rounded"
            loading="lazy"
          />
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });

    // Cache the icon
    iconCache.current.set(iconName, icon);
    return icon;
  }, []);

  // ✅ PERFORMANCE: Optimized shape creation with better validation
  const createGeofenceShape = useCallback((geofence) => {
    try {
      const {
        ShapeType,
        latitude,
        longitude,
        radius,
        ColorGeoFence,
        Polygonlatlng,
      } = geofence;

      if (!latitude || !longitude) return null;

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180) {
        return null;
      }

      const shapeColor = ColorGeoFence || "#257700";

      switch (ShapeType?.toLowerCase()) {
        case "circle":
          if (!radius) return null;

          let radiusValue = parseFloat(radius);
          if (isNaN(radiusValue) || radiusValue <= 0) return null;

          radiusValue = Math.min(Math.max(radiusValue, 1), 100000);

          return L.circle([lat, lng], {
            radius: radiusValue,
            color: shapeColor,
            fillColor: shapeColor,
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.8,
          });

        case "polygon":
          if (!Polygonlatlng || Polygonlatlng.trim() === "") return null;

          try {
            let coordinates;

            if (Polygonlatlng.includes(',') && !Polygonlatlng.includes(';')) {
              // Format: "lat1 lng1,lat2 lng2,lat3 lng3"
              coordinates = Polygonlatlng.split(",")
                .filter((coord) => coord.trim() !== "")
                .map((coord) => {
                  const parts = coord.trim().split(/\s+/);
                  const coordLat = parseFloat(parts[0]);
                  const coordLng = parseFloat(parts[1]);

                  if (isNaN(coordLat) || isNaN(coordLng) ||
                    coordLat < -90 || coordLat > 90 ||
                    coordLng < -180 || coordLng > 180) {
                    throw new Error(`Invalid coordinate: ${coord}`);
                  }

                  return [coordLat, coordLng];
                });
            } else {
              // Format: "lat1,lng1;lat2,lng2;lat3,lng3"
              coordinates = Polygonlatlng.split(";")
                .filter((coord) => coord.trim() !== "")
                .map((coord) => {
                  const [coordLat, coordLng] = coord.split(",").map(parseFloat);

                  if (isNaN(coordLat) || isNaN(coordLng) ||
                    coordLat < -90 || coordLat > 90 ||
                    coordLng < -180 || coordLng > 180) {
                    throw new Error(`Invalid coordinate: ${coord}`);
                  }

                  return [coordLat, coordLng];
                });
            }

            if (coordinates.length < 3) return null;

            return L.polygon(coordinates, {
              color: shapeColor,
              fillColor: shapeColor,
              fillOpacity: 0.2,
              weight: 2,
              opacity: 0.8,
            });
          } catch (error) {
            console.error(`Geofence ${geofence.id}: Error parsing polygon:`, error);
            return null;
          }

        case "rectangle":
          if (!radius) return null;

          let rectRadiusValue = parseFloat(radius);
          if (isNaN(rectRadiusValue) || rectRadiusValue <= 0) return null;

          return L.circle([lat, lng], {
            radius: Math.min(rectRadiusValue, 100000),
            color: shapeColor,
            fillColor: shapeColor,
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.8,
          });

        default:
          return null;
      }
    } catch (error) {
      console.error(`Geofence ${geofence.id}: Error creating shape:`, error);
      return null;
    }
  }, []);

  // ✅ PERFORMANCE: Memoized popup content generation
  const generateGeofencePopupContent = useCallback((geofence) => {
    const { geofenceName, Categoryname, geofenceDescription } = geofence;
    return `
      <div class="geofence-popup-enhanced">
        <div class="geofence-popup-header">
          <div class="geofence-header-content">
            <div class="geofence-header-text">
              <h3 class="geofence-title">${geofenceName || "Unnamed Geofence"}</h3>
            </div>
          </div>
        </div>
        
        <div class="geofence-popup-content">
          <div class="geofence-info-section">
            <div class="geofence-info-item">
              <span class="geofence-info-label">Category:</span>
              <span class="geofence-info-value">${Categoryname || "N/A"}</span>
            </div>
            <div class="geofence-info-item">
              <span class="geofence-info-label">Description:</span>
              <span class="geofence-info-value">${geofenceDescription || "No description available"}</span>
            </div>
          </div>
          
          <div class="geofence-action-buttons">
            <button onclick="window.editGeofence && window.editGeofence(${geofence.id})" class="geofence-btn geofence-btn-success">
              Edit
            </button>
            <button onclick="window.viewGeofenceMetrics && window.viewGeofenceMetrics(${geofence.id})" class="geofence-btn geofence-btn-primary">
              View Metrics
            </button>
          </div>
        </div>
      </div>
    `;
  }, []);

  // ✅ PERFORMANCE: Optimized coordinate extraction
  const getCoordinates = useCallback((geofence) => {
    const { latitude, longitude } = geofence;
    if (!latitude || !longitude) return null;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180) return null;

    return [lat, lng];
  }, []);

  // ✅ PERFORMANCE: Optimized change detection
  const hasGeofenceChanged = useCallback((oldGeofence, newGeofence) => {
    if (!oldGeofence || !newGeofence) return true;

    const keys = ['latitude', 'longitude', 'icon', 'geofenceName', 'chkShowOnMap', 'ShapeType', 'radius', 'ColorGeoFence'];
    return keys.some(key => oldGeofence[key] !== newGeofence[key]);
  }, []);

  // ✅ PERFORMANCE: Viewport-based filtering for large datasets
  const filteredGeofences = useMemo(() => {
    if (!geofences || !Array.isArray(geofences)) return [];

    let filtered = geofences.filter(geofence =>
      geofence.id &&
      geofence.chkShowOnMap === "true" &&
      geofence.icon
    );

    // ✅ PERFORMANCE: Viewport culling for large datasets
    if (mapBounds) {
      filtered = filtered.filter((geofence) => {
        const coords = getCoordinates(geofence);
        return coords ? mapBounds.contains(coords) : false;
      });
    }

    return filtered;
  }, [geofences, mapBounds, mapZoom, getCoordinates]);

  // ✅ PERFORMANCE: Track map viewport
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const updateMapState = debounce(() => {
      setMapBounds(map.getBounds());
      setMapZoom(map.getZoom());
    }, 100);

    map.on('moveend', updateMapState);
    map.on('zoomend', updateMapState);
    updateMapState();

    return () => {
      map.off('moveend', updateMapState);
      map.off('zoomend', updateMapState);
    };
  }, [mapInstanceRef.current]);

  // ✅ PERFORMANCE: Debounced shapes visibility handler
  const debouncedHandleShapesVisibility = useMemo(
    () => debounce((map) => {
      Object.entries(geofenceShapesRef.current).forEach(([geofenceId, shape]) => {
        const shouldShowShape =
          // Show if global shapes are enabled
          showShapes ||
          // OR if this specific geofence is in the selected shapes array
          selectedGeofenceShapes.includes(parseInt(geofenceId));

        if (shouldShowShape) {
          if (!map.hasLayer(shape)) {
            shape.addTo(map);
          }
        } else {
          if (map.hasLayer(shape)) {
            map.removeLayer(shape);
          }
        }
      });
    }, 50),
    [showShapes, selectedGeofenceShapes] // Add selectedGeofenceShapes to dependencies
  );

  // ✅ PERFORMANCE: Optimized main update effect with batching
  useEffect(() => {
    if (!mapInstanceRef.current || !showGeofences) {
      if (!showGeofences) {
        // Clean up when not showing geofences
        Object.values(geofenceMarkersRef.current).forEach((marker) => {
          mapInstanceRef.current?.removeLayer(marker);
        });
        Object.values(geofenceShapesRef.current).forEach((shape) => {
          mapInstanceRef.current?.removeLayer(shape);
        });
        geofenceMarkersRef.current = {};
        geofenceShapesRef.current = {};
        prevGeofencesRef.current = {};
      }
      prevShowGeofencesRef.current = showGeofences;
      return;
    }

    const map = mapInstanceRef.current;
    const currentGeofences = {};

    // Create lookup map
    filteredGeofences.forEach((geofence) => {
      if (geofence.id) {
        currentGeofences[geofence.id] = geofence;
      }
    });

    // ✅ PERFORMANCE: Batch DOM operations
    const markersToAdd = [];
    const shapesToAdd = [];
    const markersToRemove = [];
    const shapesToRemove = [];

    // Process each geofence
    Object.values(currentGeofences).forEach((geofence) => {
      const geofenceId = geofence.id;
      const existingMarker = geofenceMarkersRef.current[geofenceId];
      const existingShape = geofenceShapesRef.current[geofenceId];
      const prevGeofence = prevGeofencesRef.current[geofenceId];

      const coordinates = getCoordinates(geofence);
      if (!coordinates) return;

      const [lat, lng] = coordinates;

      // Handle marker updates
      if (!existingMarker || hasGeofenceChanged(prevGeofence, geofence)) {
        if (existingMarker) {
          markersToRemove.push(existingMarker);
        }

        const icon = createGeofenceIcon(geofence.icon);
        if (icon) {
          const marker = L.marker([lat, lng], {
            icon: icon,
            interactive: true,
            zIndexOffset: 1000,
          });

          marker.bindPopup(generateGeofencePopupContent(geofence), {
            closeButton: true,
            className: "geofence-popup",
            maxWidth: 300,
            autoPan: true,
          });

          marker.bindTooltip(geofence.geofenceName || "Unnamed Geofence", {
            permanent: false,
            direction: "top",
            className: "geofence-tooltip",
            opacity: 0.9,
            offset: [0, -8],
          });

          marker.on("mouseover", function () {
            this.openTooltip();
          });

          marker.on("mouseout", function () {
            this.closeTooltip();
          });

          marker.on("click", function (e) {
            L.DomEvent.stopPropagation(e);
            map.eachLayer((layer) => {
              if (layer.getPopup && layer.getPopup() && layer !== this) {
                layer.closePopup();
              }
            });
            setTimeout(() => {
              this.openPopup();
            }, 50);
          });

          // ✅ PERFORMANCE: Add context menu handler if provided
          if (onGeofenceContextMenu) {
            marker.on("contextmenu", function (e) {
              L.DomEvent.stopPropagation(e);
              const { x, y } = e.containerPoint;
              const mapContainer = map.getContainer();
              const rect = mapContainer.getBoundingClientRect();
              onGeofenceContextMenu(geofence, rect.left + x, rect.top + y);
            });
          }

          markersToAdd.push({ marker, geofenceId });
        }
      }

      // Handle shape updates
      if (!existingShape || hasGeofenceChanged(prevGeofence, geofence)) {
        if (existingShape) {
          shapesToRemove.push({ shape: existingShape, geofenceId });
        }

        const shape = createGeofenceShape(geofence);
        if (shape) {
          shapesToAdd.push({ shape, geofenceId });
        }
      }
    });

    // Remove old geofences that no longer exist
    Object.keys(geofenceMarkersRef.current).forEach((geofenceId) => {
      if (!currentGeofences[geofenceId]) {
        const marker = geofenceMarkersRef.current[geofenceId];
        const shape = geofenceShapesRef.current[geofenceId];

        if (marker) {
          markersToRemove.push(marker);
          delete geofenceMarkersRef.current[geofenceId];
        }
        if (shape) {
          shapesToRemove.push({ shape, geofenceId });
        }
      }
    });

    // ✅ PERFORMANCE: Batch DOM operations
    // Remove markers
    markersToRemove.forEach((marker) => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    // Remove shapes
    shapesToRemove.forEach(({ shape, geofenceId }) => {
      if (map.hasLayer(shape)) {
        map.removeLayer(shape);
      }
      delete geofenceShapesRef.current[geofenceId];
    });

    // Add new markers
    markersToAdd.forEach(({ marker, geofenceId }) => {
      marker.addTo(map);
      geofenceMarkersRef.current[geofenceId] = marker;
    });

    // Add new shapes
    shapesToAdd.forEach(({ shape, geofenceId }) => {
      if (showShapes) {
        shape.addTo(map);
      }
      geofenceShapesRef.current[geofenceId] = shape;
    });

    // Update previous references
    prevGeofencesRef.current = { ...currentGeofences };
    prevShowGeofencesRef.current = showGeofences;

    // Setup global functions for popup buttons
    window.editGeofence = (geofenceId) => {
      const geofence = filteredGeofences.find((g) => g.id === geofenceId);
      if (geofence) {
        // Handle edit geofence
      }
    };

    window.viewGeofenceMetrics = (geofenceId) => {
      const geofence = filteredGeofences.find((g) => g.id === geofenceId);
      if (geofence) {
        // Handle view metrics
      }
    };

    return () => {
      delete window.editGeofence;
      delete window.viewGeofenceMetrics;
    };
  }, [
    mapInstanceRef,
    filteredGeofences,
    showGeofences,
    createGeofenceIcon,
    createGeofenceShape,
    generateGeofencePopupContent,
    getCoordinates,
    hasGeofenceChanged,
    onGeofenceContextMenu
  ]);

  // ✅ PERFORMANCE: Handle showShapes changes separately with debouncing
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    debouncedHandleShapesVisibility(mapInstanceRef.current);
  }, [showShapes, selectedGeofenceShapes, debouncedHandleShapesVisibility]); // Add selectedGeofenceShapes

  // ✅ PERFORMANCE: Optimized cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;

        // Clean up all markers
        Object.values(geofenceMarkersRef.current).forEach((marker) => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });

        // Clean up all shapes
        Object.values(geofenceShapesRef.current).forEach((shape) => {
          if (map.hasLayer(shape)) {
            map.removeLayer(shape);
          }
        });

        // Clear references
        geofenceMarkersRef.current = {};
        geofenceShapesRef.current = {};
      }

      // Clear icon cache periodically to prevent memory leaks
      if (iconCache.current.size > 100) {
        iconCache.current.clear();
      }
    };
  }, []);

  return null;
};

export default GeofenceManager;

