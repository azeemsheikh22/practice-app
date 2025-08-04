import React, { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import { useSelector, useDispatch } from "react-redux";
import { selectCarData, selectSelectedVehicles } from "../../features/gpsTrackingSlice";
import {
  selectSelectedVehicleId,
  selectZoomToVehicle,
  resetZoomFlag,
  selectIconClustering,
  selectShowAllLabels,
  selectShowGeofences,
} from "../../features/mapInteractionSlice";
import { generateVehiclePopupContent } from "./generateVehiclePopupContent";
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
import GeofenceManager from "./GeofenceManager";
import RouteManager from "./RouteManager";
import "../../styles/mapTooltips.css";

// ✅ ICON CACHE
const iconCache = new Map();
const MAX_CACHE_SIZE = 50;

const createVehicleIcon = (status, head = 0) => {
  const statusKey = status?.toLowerCase() || "stop";
  const headKey = Math.round(head / 15) * 15;
  const cacheKey = `${statusKey}-${headKey}`;

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  if (iconCache.size > MAX_CACHE_SIZE) {
    iconCache.clear();
  }

  let iconUrl;
  switch (statusKey) {
    case "moving":
      iconUrl = movingIcon;
      break;
    case "idle":
      iconUrl = idleIcon;
      break;
    default:
      iconUrl = stoppedIcon;
  }

  const shouldRotate = statusKey === "moving";
  const rotation = shouldRotate ? headKey - 140 : 0;

  const icon = L.divIcon({
    className: "vehicle-marker",
    html: `
      <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <img src="${iconUrl}" alt="${statusKey}" 
             style="width: 22px; height: 22px; transform: rotate(${rotation}deg);" />
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    tooltipAnchor: [0, -4],
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

const VehicleMarkersManager = ({
  mapInstanceRef,
  markersRef = useRef({}),
  markerClusterRef = useRef(null),
  onVehicleContextMenu,
  onGeofenceContextMenu,
}) => {
  const dispatch = useDispatch();
  const [hasZoomedToPakistan, setHasZoomedToPakistan] = useState(false);
  const geofenceMarkersRef = useRef({});
  const currentOpenTooltip = useRef(null);

  // ✅ Label performance optimization
  const labelRafIdRef = useRef(null);
  const labelQueueRef = useRef([]);
  const visibleLabelsRef = useRef(new Set());
  const lastLabelUpdateRef = useRef(0);
  const labelUpdateThrottleRef = useRef(new Map()); // Track last update time per marker
  const MAX_VISIBLE_LABELS = 100; // Maximum labels shown at once
  const LABEL_BATCH_SIZE = 10; // Process 10 labels per frame
  const LABEL_UPDATE_THROTTLE = 2000; // Only update labels every 2 seconds

  // Add this ref at the top (component body)
  const prevGpsTimeRef = useRef({});

  // For enhanced logging of carData update intervals
  // const lastCarDataUpdateTimeRef = useRef(null);

  // ✅ SELECTORS
  const carData = useSelector(selectCarData) || [];

  // Enhanced log carData updates with timestamp and interval for performance monitoring
  // useEffect(() => {
  //   const now = new Date();
  //   const lastUpdate = lastCarDataUpdateTimeRef.current;
  //   if (lastUpdate) {
  //     const diffMs = now.getTime() - lastUpdate.getTime();
  //     const diffSec = (diffMs / 1000).toFixed(2);
  //     console.log(`[VehicleMarkersManager] carData updated at ${now.toISOString()} with ${carData.length} vehicles, interval since last update: ${diffSec} seconds`);
  //     console.log(`Bus ya vehicle data real-time delay: ${diffSec} seconds`);
  //   } else {
  //     console.log(`[VehicleMarkersManager] carData updated at ${now.toISOString()} with ${carData.length} vehicles`);
  //   }
  //   lastCarDataUpdateTimeRef.current = now;
  // }, [carData]);

  const selectedVehicles = useSelector(selectSelectedVehicles) || []; // ✅ MAIN ARRAY
  const selectedVehicleId = useSelector(selectSelectedVehicleId);
  const zoomToVehicle = useSelector(selectZoomToVehicle);
  const iconClustering = useSelector(selectIconClustering);
  const showAllLabels = useSelector(selectShowAllLabels);
  const showGeofences = useSelector(selectShowGeofences);
  const movingStatusFilter = useSelector((state) => state.gpsTracking.movingStatusFilter);
  const { filteredMapGeofences } = useSelector((state) => state.geofence);


  const isValidCoordinate = useCallback((lat, lng) =>
    typeof lat === "number" && typeof lng === "number" &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    lat !== 0 && lng !== 0
    , []);

  // Debounce syncMarkersWithSelection to limit update frequency
  const debounceTimeoutRef = useRef(null);
  const DEBOUNCE_DELAY = 200; // 200 ms debounce delay

  const syncMarkersWithSelection = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear any existing debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // ✅ STEP 1: If no vehicles selected, clear everything instantly
      if (selectedVehicles.length === 0) {
        Object.values(markersRef.current).forEach(marker => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });

        if (markerClusterRef.current) {
          markerClusterRef.current.clearLayers();
          if (map.hasLayer(markerClusterRef.current)) {
            map.removeLayer(markerClusterRef.current);
          }
        }

        markersRef.current = {};
        return;
      }

      // ✅ STEP 2: Create Set for O(1) lookup
      const selectedSet = new Set(selectedVehicles);

      // ✅ STEP 3: Remove unselected markers with filter check
      Object.keys(markersRef.current).forEach(carIdStr => {
        const carId = parseInt(carIdStr);
        const marker = markersRef.current[carIdStr];

        // ✅ NEW: Check filter first before removing
        const car = carData.find(c => c.car_id === carId);
        const matchesFilter = !movingStatusFilter ||
          movingStatusFilter === 'all' ||
          (car && car.movingstatus?.toLowerCase() === movingStatusFilter.toLowerCase());

        if (!selectedSet.has(carId)) {
          // Vehicle not selected - remove completely
          if (iconClustering && markerClusterRef.current) {
            markerClusterRef.current.removeLayer(marker);
          } else if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
          delete markersRef.current[carIdStr]; // Remove reference
        } else if (!matchesFilter) {
          // Vehicle selected but doesn't match filter - hide only
          if (iconClustering && markerClusterRef.current) {
            if (markerClusterRef.current.hasLayer(marker)) {
              markerClusterRef.current.removeLayer(marker);
            }
          } else if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
          // ✅ DON'T delete from markersRef - keep reference for later
        }
      });

      // ✅ STEP 4: Add/Update selected vehicles with filter
      const selectedVehicleData = carData.filter(car =>
        car &&
        car.car_id &&
        selectedSet.has(car.car_id) &&
        isValidCoordinate(car.latitude, car.longitude)
      );

      selectedVehicleData.forEach(car => {
        const existingMarker = markersRef.current[car.car_id];

        // ✅ Only update if gps_time changed
        const prevGpsTime = prevGpsTimeRef.current[car.car_id];
        if (existingMarker) {
          if (prevGpsTime !== car.gps_time) {
            updateExistingMarker(existingMarker, car);
            prevGpsTimeRef.current[car.car_id] = car.gps_time;
          }
          // ✅ NEW: Check if vehicle matches current filter
          const shouldShowVehicle = !movingStatusFilter ||
            movingStatusFilter === 'all' ||
            car.movingstatus?.toLowerCase() === movingStatusFilter.toLowerCase();

          // ✅ NEW: Show/Hide based on filter
          if (shouldShowVehicle) {
            // Show marker
            if (iconClustering && markerClusterRef.current) {
              if (!markerClusterRef.current.hasLayer(existingMarker)) {
                markerClusterRef.current.addLayer(existingMarker);
              }
            } else {
              if (!map.hasLayer(existingMarker)) {
                existingMarker.addTo(map);
              }
            }
          } else {
            // Hide marker (don't remove from markersRef)
            if (iconClustering && markerClusterRef.current) {
              if (markerClusterRef.current.hasLayer(existingMarker)) {
                markerClusterRef.current.removeLayer(existingMarker);
              }
            } else {
              if (map.hasLayer(existingMarker)) {
                map.removeLayer(existingMarker);
              }
            }
          }
        } else {
          // Create new marker
          createNewMarker(car, map);
          prevGpsTimeRef.current[car.car_id] = car.gps_time;

          // ✅ NEW: Hide immediately if doesn't match filter
          const shouldShowVehicle = !movingStatusFilter ||
            movingStatusFilter === 'all' ||
            car.movingstatus?.toLowerCase() === movingStatusFilter.toLowerCase();

          if (!shouldShowVehicle) {
            const newMarker = markersRef.current[car.car_id];
            if (newMarker) {
              if (iconClustering && markerClusterRef.current) {
                markerClusterRef.current.removeLayer(newMarker);
              } else {
                map.removeLayer(newMarker);
              }
            }
          }
        }
      });

      // ✅ STEP 5: Handle clustering
      handleClustering(map);

      // ✅ STEP 6: Map click handler
      map.off("click", closeAllNonPermanentTooltips);
      map.on("click", closeAllNonPermanentTooltips);
    }, DEBOUNCE_DELAY);
  }, [carData, selectedVehicles, iconClustering, showAllLabels, isValidCoordinate, movingStatusFilter]);

  // ✅ LABELS: Close tooltips
  const closeAllNonPermanentTooltips = useCallback(() => {
    Object.values(markersRef.current).forEach((marker) => {
      if (marker.getTooltip() && !marker.getTooltip().options.permanent) {
        marker.closeTooltip();
      }
    });
    currentOpenTooltip.current = null;
  }, []);

  // ✅ LABELS: Smart tooltip update (throttled for performance)
  const updateMarkerTooltip = useCallback((marker, tooltipText, forceUpdate = false) => {
    if (!marker) return;

    const markerId = marker._leaflet_id;
    const now = Date.now();
    const lastUpdate = labelUpdateThrottleRef.current.get(markerId) || 0;

    // ✅ Skip update if too recent (unless forced or labels just toggled)
    if (!forceUpdate && (now - lastUpdate) < LABEL_UPDATE_THROTTLE && marker.getTooltip()) {
      return;
    }

    // ✅ Check if tooltip text actually changed
    const currentTooltip = marker.getTooltip();
    if (currentTooltip && currentTooltip._content === tooltipText && !forceUpdate) {
      return;
    }

    if (marker.getTooltip()) {
      if (marker._tooltip && (marker._tooltip.options.permanent !== showAllLabels || forceUpdate)) {
        marker.unbindTooltip();
        marker.bindTooltip(tooltipText, {
          permanent: showAllLabels,
          direction: "top",
          className: "custom-tooltip",
          opacity: showAllLabels ? 0.6 : 1,
          offset: [0, -5],
          sticky: !showAllLabels,
          interactive: false,
        });

        // ✅ Only open if within label limit
        if (showAllLabels && visibleLabelsRef.current.size < MAX_VISIBLE_LABELS) {
          marker.openTooltip();
          visibleLabelsRef.current.add(markerId);
        }
      }
    } else {
      marker.bindTooltip(tooltipText, {
        permanent: showAllLabels,
        direction: "top",
        className: "custom-tooltip",
        opacity: showAllLabels ? 0.6 : 1,
        offset: [0, -5],
        sticky: !showAllLabels,
        interactive: false,
      });

      // ✅ Only open if within label limit
      if (showAllLabels && visibleLabelsRef.current.size < MAX_VISIBLE_LABELS) {
        marker.openTooltip();
        visibleLabelsRef.current.add(markerId);
      }
    }

    // ✅ Update throttle tracker
    labelUpdateThrottleRef.current.set(markerId, now);
  }, [showAllLabels]);

  // ✅ LABELS: Setup events
  const setupMarkerEvents = useCallback((marker, tooltipText) => {
    marker.off("mouseover").off("mouseout").off("click");

    if (!showAllLabels) {
      let showTooltipTimeout;

      marker.on("mouseover", function () {
        // ✅ NEW: Don't show tooltip if popup is open for this marker
        if (this.isPopupOpen()) {
          return;
        }

        closeAllNonPermanentTooltips();
        clearTimeout(showTooltipTimeout);

        showTooltipTimeout = setTimeout(() => {
          if (currentOpenTooltip.current && currentOpenTooltip.current !== this) {
            currentOpenTooltip.current.closeTooltip();
          }
          this.openTooltip();
          currentOpenTooltip.current = this;
        }, 200);
      });

      marker.on("mouseout", function () {
        clearTimeout(showTooltipTimeout);
        this.closeTooltip();
        if (currentOpenTooltip.current === this) {
          currentOpenTooltip.current = null;
        }
      });
    }

    marker.on("click", function (e) {
      L.DomEvent.stopPropagation(e);
      closeAllNonPermanentTooltips();
      setTimeout(() => {
        this.openPopup();
        // ✅ NEW: Close tooltip when popup is opened
        if (this.getTooltip()) {
          this.closeTooltip();
        }
      }, 50);
    });
  }, [showAllLabels, closeAllNonPermanentTooltips]);

  // ✅ Batched label processing to prevent lag
  const processLabelQueue = useCallback(() => {
    const queue = labelQueueRef.current;
    if (queue.length === 0) {
      labelRafIdRef.current = null;
      return;
    }

    // Process batch of labels
    const batch = queue.splice(0, LABEL_BATCH_SIZE);

    batch.forEach(({ action, marker, tooltipText }) => {
      try {
        if (!marker) return;

        switch (action) {
          case 'show':
            if (visibleLabelsRef.current.size < MAX_VISIBLE_LABELS) {
              if (marker.getTooltip()) {
                marker.openTooltip();
                visibleLabelsRef.current.add(marker._leaflet_id);
              }
            }
            break;
          case 'hide':
            if (marker.getTooltip()) {
              marker.closeTooltip();
              visibleLabelsRef.current.delete(marker._leaflet_id);
            }
            break;
          case 'update':
            if (marker.getTooltip()) {
              marker.unbindTooltip();
            }
            updateMarkerTooltip(marker, tooltipText, true); // Force update
            setupMarkerEvents(marker, tooltipText);

            if (showAllLabels && visibleLabelsRef.current.size < MAX_VISIBLE_LABELS) {
              marker.openTooltip();
              visibleLabelsRef.current.add(marker._leaflet_id);
            }
            break;
        }
      } catch (error) {
        console.warn('Label processing error:', error);
      }
    });

    // Continue processing if queue has more items
    if (queue.length > 0) {
      labelRafIdRef.current = requestAnimationFrame(processLabelQueue);
    } else {
      labelRafIdRef.current = null;
    }
  }, [showAllLabels, updateMarkerTooltip, setupMarkerEvents]);

  // ✅ Queue label operation
  const queueLabelOperation = useCallback((action, marker, tooltipText = null) => {
    labelQueueRef.current.push({ action, marker, tooltipText });

    if (!labelRafIdRef.current) {
      labelRafIdRef.current = requestAnimationFrame(processLabelQueue);
    }
  }, [processLabelQueue]);

  // ✅ UPDATE EXISTING MARKER
  const updateExistingMarker = useCallback((marker, car) => {
    const { latitude, longitude, movingstatus, head, carname } = car;

    marker.setLatLng([latitude, longitude]);

    const currentStatus = marker._vehicleStatus;
    const currentHeading = marker._vehicleHeading || 0;
    const headingDiff = Math.abs((head || 0) - currentHeading);

    const isMovingVehicle = movingstatus?.toLowerCase() === "moving";
    const shouldUpdateIcon =
      currentStatus !== movingstatus ||
      (isMovingVehicle && headingDiff > 10);

    if (shouldUpdateIcon) {
      marker.setIcon(createVehicleIcon(movingstatus, head));
      marker._vehicleStatus = movingstatus;
      marker._vehicleHeading = head || 0;
    }

    if (marker.isPopupOpen()) {
      try {
        const popupContent = generateVehiclePopupContent(car);
        marker.getPopup().setContent(popupContent);
      } catch (error) {
        console.error("Error updating popup:", error);
      }
    }

    const tooltipText = carname || `Vehicle ${car.car_id}`;
    updateMarkerTooltip(marker, tooltipText);
    setupMarkerEvents(marker, tooltipText);

  }, [updateMarkerTooltip, setupMarkerEvents]);

  // ✅ CREATE NEW MARKER - Fix context menu event
  const createNewMarker = useCallback((car, map) => {
    const { car_id, latitude, longitude, movingstatus, head, carname } = car;
    const icon = createVehicleIcon(movingstatus, head);
    const marker = L.marker([latitude, longitude], { icon });

    marker._vehicleStatus = movingstatus;
    marker._vehicleHeading = head || 0;

    marker.bindPopup(() => {
      try {
        return generateVehiclePopupContent(car);
      } catch (error) {
        return `<div><h3>${carname}</h3><p>Error loading details</p></div>`;
      }
    }, {
      closeButton: true,
      className: "custom-popup",
      autoPan: true,
    });

    const tooltipText = carname || `Vehicle ${car_id}`;
    updateMarkerTooltip(marker, tooltipText);
    setupMarkerEvents(marker, tooltipText);

    // ✅ FIXED: Vehicle context menu with proper event handling
    if (onVehicleContextMenu) {
      marker.on("contextmenu", (e) => {
        L.DomEvent.preventDefault(e);
        L.DomEvent.stopPropagation(e); // ✅ Stop event bubbling

        const containerPoint = map.latLngToContainerPoint(e.latlng);
        const mapContainer = map.getContainer();
        const rect = mapContainer.getBoundingClientRect();

        // ✅ Calculate screen coordinates
        const screenX = rect.left + containerPoint.x + window.scrollX;
        const screenY = rect.top + containerPoint.y + window.scrollY;
        onVehicleContextMenu(car, screenX, screenY);
      });
    }

    if (iconClustering && markerClusterRef.current) {
      markerClusterRef.current.addLayer(marker);
    } else {
      marker.addTo(map);
    }

    markersRef.current[car_id] = marker;
  }, [showAllLabels, onVehicleContextMenu, iconClustering, updateMarkerTooltip, setupMarkerEvents]);


  // ✅ CLUSTERING
  const handleClustering = useCallback((map) => {
    if (!markerClusterRef.current) return;

    const cluster = markerClusterRef.current;

    if (iconClustering) {
      if (!map.hasLayer(cluster)) {
        Object.values(markersRef.current).forEach(marker => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
          cluster.addLayer(marker);
        });
        map.addLayer(cluster);
      }
    } else {
      if (map.hasLayer(cluster)) {
        map.removeLayer(cluster);
        Object.values(markersRef.current).forEach(marker => {
          marker.addTo(map);
        });
      }
    }
  }, [iconClustering]);

  const zoomToPakistan = useCallback(() => {
    if (!mapInstanceRef.current || hasZoomedToPakistan) return;

    const markerCount = Object.keys(markersRef.current).length;
    if (markerCount > 0) {
      mapInstanceRef.current.setView([30.3753, 69.3451], 5.5, {
        animate: true,
        duration: 1.5,
      });
      setHasZoomedToPakistan(true);
    }
  }, [hasZoomedToPakistan]);

  // ✅ MAIN EFFECT - INSTANT SYNC
  useEffect(() => {
    // ✅ INSTANT EXECUTION - No debounce, no delay
    syncMarkersWithSelection();

    // ✅ ZOOM TO PAKISTAN (only if markers exist)
    if (selectedVehicles.length > 0) {
      setTimeout(zoomToPakistan, 1000);
    }

  }, [selectedVehicles, carData, syncMarkersWithSelection, zoomToPakistan]);

  // ✅ OPTIMIZED LABELS EFFECT - Only run when labels toggle (not on data updates)
  useEffect(() => {
    if (selectedVehicles.length === 0) return;

    const now = Date.now();

    // ✅ Throttle label effect to prevent excessive updates
    if (now - lastLabelUpdateRef.current < 1000) {
      return; // Skip if updated less than 1 second ago
    }

    lastLabelUpdateRef.current = now;

    // ✅ Clear existing label queue and visible labels tracking
    labelQueueRef.current = [];
    visibleLabelsRef.current.clear();

    // ✅ Cancel any pending label operations
    if (labelRafIdRef.current) {
      cancelAnimationFrame(labelRafIdRef.current);
      labelRafIdRef.current = null;
    }

    // ✅ Queue label operations in batches to prevent lag
    const selectedSet = new Set(selectedVehicles);
    const markersToProcess = [];

    Object.entries(markersRef.current).forEach(([carIdStr, marker]) => {
      const carId = parseInt(carIdStr);
      const car = carData.find(v => v.car_id === carId && selectedSet.has(v.car_id));

      if (car && marker) {
        const tooltipText = car.carname || `Vehicle ${car.car_id}`;
        markersToProcess.push({ marker, tooltipText });
      }
    });

    // ✅ Prioritize markers in viewport for labels
    markersToProcess.sort((a, b) => {
      if (!mapInstanceRef.current) return 0;

      try {
        const boundsA = mapInstanceRef.current.getBounds().contains(a.marker.getLatLng());
        const boundsB = mapInstanceRef.current.getBounds().contains(b.marker.getLatLng());

        if (boundsA && !boundsB) return -1;
        if (!boundsA && boundsB) return 1;
        return 0;
      } catch (error) {
        return 0;
      }
    });

    // ✅ Queue label operations
    markersToProcess.forEach(({ marker, tooltipText }) => {
      if (showAllLabels) {
        queueLabelOperation('update', marker, tooltipText);
      } else {
        queueLabelOperation('hide', marker);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllLabels]); // ✅ Only depend on showAllLabels, not data changes

  // ✅ ZOOM TO VEHICLE EFFECT
  useEffect(() => {
    if (zoomToVehicle && selectedVehicleId && mapInstanceRef.current) {
      const marker = markersRef.current[selectedVehicleId];
      if (marker) {
        mapInstanceRef.current.setView(marker.getLatLng(), 18);
        marker.openPopup();
        dispatch(resetZoomFlag());
      }
    }
  }, [selectedVehicleId, zoomToVehicle, dispatch]);

  // ✅ CLUSTERING TOGGLE EFFECT
  useEffect(() => {
    if (mapInstanceRef.current && selectedVehicles.length > 0) {
      handleClustering(mapInstanceRef.current);
    }
  }, [iconClustering, handleClustering, selectedVehicles.length]);

  // ✅ ENHANCED CLEANUP EFFECT
  useEffect(() => {
    return () => {
      // ✅ Cancel any pending label operations
      if (labelRafIdRef.current) {
        cancelAnimationFrame(labelRafIdRef.current);
      }

      // ✅ Clear label queues
      labelQueueRef.current = [];
      visibleLabelsRef.current.clear();
      labelUpdateThrottleRef.current.clear();

      // Clear all markers on unmount
      if (mapInstanceRef.current) {
        Object.values(markersRef.current).forEach(marker => {
          if (mapInstanceRef.current.hasLayer(marker)) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });

        if (markerClusterRef.current) {
          markerClusterRef.current.clearLayers();
          if (mapInstanceRef.current.hasLayer(markerClusterRef.current)) {
            mapInstanceRef.current.removeLayer(markerClusterRef.current);
          }
        }
      }

      markersRef.current = {};
      iconCache.clear();
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
      <RouteManager mapInstanceRef={mapInstanceRef} onRouteContextMenu={null} />
    </>
  );
};

export default VehicleMarkersManager;

