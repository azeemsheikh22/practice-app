import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import updateVehicleMarkers, {
  resetCluster,
} from "../../utils/map/vehicleMarkers";
import { useSelector, useDispatch } from "react-redux";
import { selectCarData } from "../../features/gpsTrackingSlice";
import {
  selectSelectedVehicleId,
  selectZoomToVehicle,
  resetZoomFlag,
  selectIconClustering,
  selectShowAllLabels,
  selectShowGeofences,
} from "../../features/mapInteractionSlice";
import "../../styles/mapTooltips.css";
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
import GeofenceManager from "./GeofenceManager";

// ✅ PERFORMANCE: Preload vehicle icons for better performance
const preloadIcons = () => {
  const icons = [movingIcon, stoppedIcon, idleIcon];
  icons.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

preloadIcons();

// ✅ PERFORMANCE: Cache vehicle icons to avoid recreating them
const vehicleIconCache = {
  moving: {},
  idle: {},
  stop: {},
};

// ✅ PERFORMANCE: Debounce function for updates
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

// ✅ PERFORMANCE: Optimized vehicle data management with better caching
const manageVehicleData = (newCarData, forceUpdate = false) => {
  try {
    if (!newCarData || newCarData.length === 0) {
      const storedDataString = localStorage.getItem("carData");
      return storedDataString ? JSON.parse(storedDataString) : [];
    }

    if (forceUpdate) {
      localStorage.setItem("carData", JSON.stringify(newCarData));
      return newCarData;
    }

    let storedData = [];
    const storedDataString = localStorage.getItem("carData");
    if (storedDataString) {
      storedData = JSON.parse(storedDataString);
    }

    // ✅ PERFORMANCE: Better change detection
    if (
      Math.abs(storedData.length - newCarData.length) >
      storedData.length * 0.3
    ) {
      localStorage.setItem("carData", JSON.stringify(newCarData));
      return newCarData;
    }

    // ✅ PERFORMANCE: Use Map for O(1) lookups instead of array operations
    const existingVehiclesMap = new Map();
    storedData.forEach((vehicle) => {
      if (vehicle.car_id) {
        existingVehiclesMap.set(vehicle.car_id, vehicle);
      }
    });

    // ✅ PERFORMANCE: Batch updates
    let hasChanges = false;
    newCarData.forEach((newVehicle) => {
      if (!newVehicle.car_id) return;

      const existingVehicle = existingVehiclesMap.get(newVehicle.car_id);

      if (existingVehicle) {
        if (existingVehicle.gps_time !== newVehicle.gps_time) {
          existingVehiclesMap.set(newVehicle.car_id, newVehicle);
          hasChanges = true;
        }
      } else {
        existingVehiclesMap.set(newVehicle.car_id, newVehicle);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      const updatedData = Array.from(existingVehiclesMap.values());
      localStorage.setItem("carData", JSON.stringify(updatedData));
      return updatedData;
    }

    return storedData;
  } catch (error) {
    console.error("Error managing vehicle data:", error);
    return newCarData;
  }
};

const VehicleMarkersManager = ({
  mapInstanceRef,
  searchQuery,
  markersRef = useRef({}),
  markerClusterRef = useRef(null),
  onVehicleContextMenu,
  onGeofenceContextMenu,
}) => {
  const prevPositionsRef = useRef({});
  const updateTimerRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const geofenceMarkersRef = useRef({});

  // ✅ PERFORMANCE: Add viewport tracking for culling
  const [mapBounds, setMapBounds] = useState(null);
  const [mapZoom, setMapZoom] = useState(7);

  const [processedData, setProcessedData] = useState([]);

  const [hasAutoZoomed, setHasAutoZoomed] = useState(false);
  const [lastVehicleCount, setLastVehicleCount] = useState(0);
  const autoZoomTimeoutRef = useRef(null);

  const showAllLabels = useSelector(selectShowAllLabels);
  const iconClustering = useSelector(selectIconClustering);
  const selectedVehicleId = useSelector(selectSelectedVehicleId);
  const zoomToVehicle = useSelector(selectZoomToVehicle);
  const showGeofences = useSelector(selectShowGeofences);

  const { filteredMapGeofences } = useSelector((state) => state.geofence);

  const dispatch = useDispatch();
  const carData = useSelector(selectCarData) || [];

  // useEffect mein event listener add karein
  useEffect(() => {
    const handleResetAutoZoom = () => {
      setHasAutoZoomed(false);
      setLastVehicleCount(0);
    };

    window.addEventListener("resetAutoZoom", handleResetAutoZoom);

    return () => {
      window.removeEventListener("resetAutoZoom", handleResetAutoZoom);
    };
  }, []);

  // ✅ PERFORMANCE: Optimized array comparison
  const areArraysEqual = useCallback((arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    // Sample check for large arrays
    if (arr1.length > 1000) {
      const sampleSize = Math.min(100, arr1.length);
      for (let i = 0; i < sampleSize; i++) {
        const randomIndex = Math.floor(Math.random() * arr1.length);
        const item1 = arr1[randomIndex];
        const item2 = arr2[randomIndex];
        if (
          !item1 ||
          !item2 ||
          item1.car_id !== item2.car_id ||
          item1.gps_time !== item2.gps_time
        ) {
          return false;
        }
      }
      return true;
    }

    return arr1.every((item1, index) => {
      const item2 = arr2[index];
      return (
        item1.car_id === item2.car_id &&
        item1.gps_time === item2.gps_time &&
        item1.latitude === item2.latitude &&
        item1.longitude === item2.longitude
      );
    });
  }, []);

  // ✅ PERFORMANCE: Track map viewport changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const updateMapState = debounce(() => {
      setMapBounds(map.getBounds());
      setMapZoom(map.getZoom());
    }, 100);

    map.on("moveend", updateMapState);
    map.on("zoomend", updateMapState);

    // Initial state
    updateMapState();

    return () => {
      map.off("moveend", updateMapState);
      map.off("zoomend", updateMapState);
    };
  }, [mapInstanceRef.current]);

  // ✅ PERFORMANCE: Optimized data processing with viewport culling
  useEffect(() => {
    if (!carData || carData.length === 0) {
      localStorage.setItem("carData", JSON.stringify([]));
      if (processedData.length > 0) {
        setProcessedData([]);
      }
    } else {
      const isFilteredData =
        carData.length < 50 ||
        carData.every((car) => car.movingstatus === carData[0]?.movingstatus);

      const optimizedData = manageVehicleData(carData, isFilteredData);

      if (!areArraysEqual(processedData, optimizedData)) {
        setProcessedData(optimizedData);
      }
    }
  }, [carData, processedData, areArraysEqual]);

  // ✅ PERFORMANCE: Viewport-based filtering for large datasets
  const filteredCarData = useMemo(() => {
    let dataToFilter = processedData;

    // ✅ PERFORMANCE: Viewport culling for large datasets
    if (dataToFilter.length > 500 && mapBounds && mapZoom < 12) {
      dataToFilter = dataToFilter.filter((car) => {
        if (!car.latitude || !car.longitude) return false;
        const lat = parseFloat(car.latitude);
        const lng = parseFloat(car.longitude);
        return mapBounds.contains([lat, lng]);
      });
    }

    // Search filtering
    if (!searchQuery || searchQuery.trim() === "") {
      return dataToFilter;
    } else {
      const query = searchQuery.toLowerCase().trim();
      return dataToFilter.filter((car) => {
        return (
          (car.carname && car.carname.toLowerCase().includes(query)) ||
          (car.location && car.location.toLowerCase().includes(query))
        );
      });
    }
  }, [searchQuery, processedData, mapBounds, mapZoom]);

  // ✅ PERFORMANCE: Memoized coordinate validation
  const isValidCoordinate = useCallback(
    (lat, lng) =>
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0 &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180,
    []
  );

  // ✅ PERFORMANCE: Optimized icon creation with better caching
  const createVehicleIcon = useCallback((status, head = 0) => {
    const statusKey = status?.toLowerCase() || "stop";
    const headKey = Math.round(head / 10) * 10; // Reduced precision for better caching

    if (vehicleIconCache[statusKey]?.[headKey]) {
      return vehicleIconCache[statusKey][headKey];
    }

    let iconUrl;
    switch (statusKey) {
      case "moving":
        iconUrl = movingIcon;
        break;
      case "idle":
        iconUrl = idleIcon;
        break;
      case "stop":
      default:
        iconUrl = stoppedIcon;
        break;
    }

    const shouldRotate = statusKey === "moving";
    const rotation = shouldRotate ? headKey + -140 : 0;

    const newIcon = L.divIcon({
      className: "vehicle-marker",
      html: `
        <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div class="vehicle-icon" style="transform: rotate(${rotation}deg); width: 22px; height: 22px;">
            <img src="${iconUrl}" alt="${statusKey}" style="width: 100%; height: 100%;" loading="lazy" />
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
      tooltipAnchor: [0, -4],
    });

    if (!vehicleIconCache[statusKey]) {
      vehicleIconCache[statusKey] = {};
    }
    vehicleIconCache[statusKey][headKey] = newIcon;

    return newIcon;
  }, []);

  // ✅ PERFORMANCE: Debounced update function
  const debouncedUpdateVehicleMarkers = useMemo(
    () =>
      debounce(() => {
        if (!mapInstanceRef.current) return;

        updateVehicleMarkers(
          mapInstanceRef,
          markersRef,
          filteredCarData,
          prevPositionsRef,
          isValidCoordinate,
          createVehicleIcon,
          L,
          markerClusterRef,
          iconClustering,
          showAllLabels,
          onVehicleContextMenu
        );
        lastUpdateTimeRef.current = Date.now();
      }, 150), // Increased debounce time for better performance
    [
      filteredCarData,
      isValidCoordinate,
      createVehicleIcon,
      iconClustering,
      showAllLabels,
      mapInstanceRef,
      onVehicleContextMenu,
    ]
  );

  const handleUpdateVehicleMarkers = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 200) {
      // Increased throttle time
      if (!updateTimerRef.current) {
        updateTimerRef.current = setTimeout(() => {
          debouncedUpdateVehicleMarkers();
          updateTimerRef.current = null;
        }, 200 - (now - lastUpdateTimeRef.current));
      }
      return;
    }

    debouncedUpdateVehicleMarkers();
  }, [debouncedUpdateVehicleMarkers]);

  // Rest of your existing useEffects remain the same...
  useEffect(() => {
    if (zoomToVehicle && selectedVehicleId && mapInstanceRef.current) {
      mapInstanceRef.current.closePopup();
      const marker = markersRef.current[selectedVehicleId];
      if (marker) {
        mapInstanceRef.current.setView(marker.getLatLng(), 18);
        marker.openPopup();
        dispatch(resetZoomFlag());
      }
    }
  }, [selectedVehicleId, zoomToVehicle, dispatch, mapInstanceRef]);

  useEffect(() => {
    if (mapInstanceRef.current && markerClusterRef.current) {
      const map = mapInstanceRef.current;
      const markerCluster = markerClusterRef.current;

      if (iconClustering) {
        if (!map.hasLayer(markerCluster)) {
          Object.values(markersRef.current).forEach((marker) => {
            if (map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          });

          markerCluster.clearLayers();
          Object.values(markersRef.current).forEach((marker) => {
            markerCluster.addLayer(marker);
          });
          map.addLayer(markerCluster);
        }
      } else {
        if (map.hasLayer(markerCluster)) {
          map.removeLayer(markerCluster);
          Object.values(markersRef.current).forEach((marker) => {
            marker.addTo(map);
          });
        }
      }

      handleUpdateVehicleMarkers();
    }
  }, [iconClustering, handleUpdateVehicleMarkers, mapInstanceRef]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        mapInstanceRef.current &&
        markerClusterRef.current &&
        iconClustering
      ) {
        resetCluster(
          markerClusterRef,
          markersRef,
          mapInstanceRef.current,
          iconClustering
        );
      }
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [iconClustering, mapInstanceRef]);

  useEffect(() => {
    try {
      if (mapInstanceRef.current) {
        handleUpdateVehicleMarkers();
      }
    } catch (error) {
      console.error("Error updating vehicle markers:", error);
    }

    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    };
  }, [filteredCarData, handleUpdateVehicleMarkers, mapInstanceRef]);

  // NEW: Auto zoom function
  const performAutoZoom = useCallback(() => {
    if (!mapInstanceRef.current || hasAutoZoomed) return;

    const currentVehicleCount = filteredCarData.length;

    // Only auto zoom if:
    // 1. We haven't auto zoomed before
    // 2. We have vehicles now
    // 3. Vehicle count increased from 0 or significantly changed
    if (
      currentVehicleCount > 0 &&
      (lastVehicleCount === 0 ||
        Math.abs(currentVehicleCount - lastVehicleCount) >=
          Math.max(1, lastVehicleCount * 0.3))
    ) {
      // Clear any existing timeout
      if (autoZoomTimeoutRef.current) {
        clearTimeout(autoZoomTimeoutRef.current);
      }

      // Delay auto zoom to ensure markers are rendered
      autoZoomTimeoutRef.current = setTimeout(() => {
        const markerCount = Object.keys(markersRef.current).length;

        if (markerCount === 0) {
          // No markers, zoom to Pakistan
          mapInstanceRef.current.setView([30.3753, 69.3451], 5.5, {
            animate: true,
            duration: 1.5,
          });
        } else if (markerCount === 1) {
          // Single marker, zoom to it
          const marker = Object.values(markersRef.current)[0];
          if (marker) {
            mapInstanceRef.current.setView(marker.getLatLng(), 18, {
              animate: true,
              duration: 1.5,
            });
          }
        } else {
          // Multiple markers, fit bounds
          const validMarkers = Object.values(markersRef.current).filter(
            (marker) => {
              const pos = marker.getLatLng();
              return isValidCoordinate(pos.lat, pos.lng);
            }
          );

          if (validMarkers.length > 0) {
            const bounds = L.latLngBounds(
              validMarkers.map((marker) => marker.getLatLng())
            );
            if (bounds.isValid()) {
              mapInstanceRef.current.fitBounds(bounds, {
                padding: [50, 50],
                animate: true,
                duration: 1.5,
              });
            }
          }
        }

        setHasAutoZoomed(true);
        setLastVehicleCount(currentVehicleCount);
      }, 1000); // 1 second delay to ensure markers are ready
    }
  }, [
    filteredCarData,
    hasAutoZoomed,
    lastVehicleCount,
    isValidCoordinate,
    mapInstanceRef,
  ]);

  // NEW: Reset auto zoom when no vehicles
  useEffect(() => {
    if (filteredCarData.length === 0 && hasAutoZoomed) {
      setHasAutoZoomed(false);
      setLastVehicleCount(0);
    }
  }, [filteredCarData.length, hasAutoZoomed]);

  // NEW: Trigger auto zoom when markers are updated
  useEffect(() => {
    if (filteredCarData.length > 0) {
      performAutoZoom();
    }
  }, [filteredCarData, performAutoZoom]);

  useEffect(() => {
    return () => {
      if (autoZoomTimeoutRef.current) {
        clearTimeout(autoZoomTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <GeofenceManager
        mapInstanceRef={mapInstanceRef}
        geofences={filteredMapGeofences}
        showGeofences={showGeofences}
        geofenceMarkersRef={geofenceMarkersRef}
        onGeofenceContextMenu={onGeofenceContextMenu}
      />
    </>
  );
};

export default VehicleMarkersManager;
