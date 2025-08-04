import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { useSelector } from "react-redux";
import {
  selectMapType,
  selectShowTraffic,
} from "../../features/mapControlsSlice";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
import "../../styles/mapTooltips.css";


const MapCore = forwardRef(
  ({ onContextMenu, onMapReady, sidebarWidth }, ref) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const markerClusterRef = useRef(null);
    const locationMarkerRef = useRef(null);
    const tileLayerRef = useRef(null);
    const trafficLayerRef = useRef(null);
    const mapInitialized = useRef(false);
    const prevSidebarWidth = useRef(sidebarWidth);

    const mapType = useSelector(selectMapType);
    const showTraffic = useSelector(selectShowTraffic);
    const [isMapInitialized, setIsMapInitialized] = useState(false);

    // Map initialization
    useEffect(() => {
      if (mapInitialized.current || !mapRef.current) return;

      let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      L.Marker.prototype.options.icon = DefaultIcon;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: false
        
        ,
        renderer: L.canvas({ padding: 0 }),
        minZoom: 3,
        maxZoom: 20,
      }).setView([30.3753, 69.3451], 5.5);

      mapInstanceRef.current = map;
      mapInitialized.current = true;

      setupMapEvents(map);
      setupMarkerCluster(map);
      setupTileLayer(map);
      addTooltipStyles();

      // ✅ NEW: Add resize observer for container
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({
            animate: true,
            pan: true,
            duration: 0.25,
          });
        }
      });

      if (mapRef.current) {
        resizeObserver.observe(mapRef.current);
      }

      setIsMapInitialized(true);
      if (onMapReady) {
        onMapReady({
          mapInstanceRef,
          mapRef,
          markersRef,
          markerClusterRef,
          tileLayerRef,
          trafficLayerRef,
          locationMarkerRef,
        });
      }

      return () => {
        cleanup();
        // ✅ NEW: Disconnect resize observer
        resizeObserver.disconnect();
      };
    }, []);

    // Add marker animation methods
    useEffect(() => {
      L.Marker.include({
        slideTo: function (newLatLng, options) {
          options = options || {};
          const duration = options.duration || 1000;
          const startLatLng = this.getLatLng();
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const lat =
              startLatLng.lat + (newLatLng[0] - startLatLng.lat) * progress;
            const lng =
              startLatLng.lng + (newLatLng[1] - startLatLng.lng) * progress;
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
    }, []);

    const setupMapEvents = (map) => {
      // ✅ IMPORTANT: Disable default context menu
      map.getContainer().addEventListener("contextmenu", function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });

      // ✅ FIXED: Custom context menu with proper coordinates
      map.on("contextmenu", function (e) {
        const { lat, lng } = e.latlng;
        const { x, y } = e.containerPoint;
        const mapContainer = map.getContainer();
        const rect = mapContainer.getBoundingClientRect();
        const screenX = rect.left + x + window.scrollX;
        const screenY = rect.top + y + window.scrollY;
        if (onContextMenu) {
          onContextMenu({
            visible: true,
            x: screenX,
            y: screenY,
            lat: lat,
            lng: lng,
          });
        }
      });

      // ✅ FIXED: Hide ALL context menus on map click
      map.on("click", function (e) {
        if (onContextMenu) {
          // ✅ Hide main context menu
          onContextMenu({ visible: false });
          // ✅ Trigger event to hide vehicle/geofence menus
          window.dispatchEvent(new CustomEvent("hideAllContextMenus"));
        }
      });

      // Rest of the events remain same...
      map.on("zoomstart", () => {
        if (onContextMenu) onContextMenu({ visible: false });
        window.dispatchEvent(new CustomEvent("hideAllContextMenus")); // ✅ Hide all menus
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
        if (onContextMenu) onContextMenu({ visible: false });
        window.dispatchEvent(new CustomEvent("hideAllContextMenus")); // ✅ Hide all menus
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
      });

      map._container.classList.add("map-with-tooltips");
    };

    const setupMarkerCluster = (map) => {
      const markerCluster = L.markerClusterGroup({
        disableClusteringAtZoom: 14,
        spiderfyOnMaxZoom: false,
        maxClusterRadius: 80,
        chunkedLoading: true,
        zoomToBoundsOnClick: true,
        removeOutsideVisibleBounds: true,
        iconCreateFunction: function (cluster) {
          const markers = cluster.getAllChildMarkers();
          const childCount = markers.length;
          let sizeClass = " marker-cluster-";
          if (childCount < 10) {
            sizeClass += "small";
          } else if (childCount < 100) {
            sizeClass += "medium";
          } else {
            sizeClass += "large";
          }
          return new L.DivIcon({
            html:
              '<div class="cluster-icon"><span>' + childCount + "</span></div>",
            className: "marker-cluster" + sizeClass,
            iconSize: new L.Point(40, 40),
          });
        },
      });

      markerClusterRef.current = markerCluster;
      map.addLayer(markerCluster);
      setupClusterEvents(markerCluster, map);
    };

    const setupClusterEvents = (markerCluster, map) => {
      markerCluster.on("clustermouseover", function (event) {
        const cluster = event.layer;
        const markers = cluster.getAllChildMarkers();
        const statusCounts = { moving: 0, idle: 0, stop: 0 };

        markers.forEach((marker) => {
          // ✅ FIX: Check both _vehicleStatus and vehicleStatus
          const status = (
            marker._vehicleStatus ||
            marker.vehicleStatus ||
            ""
          ).toLowerCase();
          if (status === "moving") statusCounts.moving++;
          else if (status === "idle") statusCounts.idle++;
          else statusCounts.stop++;
        });

        const tooltipContent = `
        <div class="cluster-tooltip-content">
          <div class="cluster-tooltip-header">
            <span class="cluster-tooltip-title">Vehicle Cluster</span>
            <span class="cluster-tooltip-count-badge">${markers.length}</span>
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

        if (cluster.getTooltip()) cluster.unbindTooltip();

        cluster.bindTooltip(tooltipContent, {
          direction: "top",
          offset: [0, -10],
          className: "cluster-tooltip",
          opacity: 1,
        });

        cluster.openTooltip();
      });

      markerCluster.on("clustermouseout", function (event) {
        const cluster = event.layer;
        if (cluster.getTooltip()) {
          cluster.closeTooltip();
        }
      });
    };

    // ✅ FIXED: Tile layer with English language and no white lines
    const setupTileLayer = (map) => {
      const tileUrl =
        mapType === "satellite"
          ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          : "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&style=feature:administrative|element:labels|visibility:off&style=feature:administrative.country|element:labels|visibility:on&style=feature:administrative.province|element:labels|visibility:off&style=feature:administrative.locality|element:labels|visibility:on&style=feature:road|element:labels|visibility:on&style=feature:poi|element:labels|visibility:on&style=feature:transit|element:labels|visibility:on&style=feature:water|element:labels|visibility:on&style=feature:landscape|element:labels|visibility:off";

      const tileLayer = L.tileLayer(tileUrl, {
        minZoom: 3,
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google",
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2,
        // ✅ Force English language
        language: "en",
        region: "US",
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add traffic layer if enabled
      if (showTraffic) {
        const trafficLayer = L.tileLayer(
          "https://mt0.google.com/vt/lyrs=traffic&hl=en&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            opacity: 0.7,
          }
        ).addTo(map);
        trafficLayerRef.current = trafficLayer;
      }
    };

    // Update tile layer when map type changes
    useEffect(() => {
      if (mapInstanceRef.current && tileLayerRef.current && isMapInitialized) {
        const tileUrl =
          mapType === "satellite"
            ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            : "https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&style=feature:administrative|element:labels|visibility:off&style=feature:administrative.country|element:labels|visibility:on&style=feature:administrative.province|element:labels|visibility:off&style=feature:administrative.locality|element:labels|visibility:on&style=feature:road|element:labels|visibility:on&style=feature:poi|element:labels|visibility:on&style=feature:transit|element:labels|visibility:on&style=feature:water|element:labels|visibility:on&style=feature:landscape|element:labels|visibility:off";

        tileLayerRef.current.setUrl(tileUrl);
      }
    }, [mapType]);

    // Update traffic layer when showTraffic changes
    useEffect(() => {
      if (mapInstanceRef.current && isMapInitialized) {
        if (showTraffic) {
          if (!trafficLayerRef.current) {
            const trafficLayer = L.tileLayer(
              "https://mt0.google.com/vt/lyrs=traffic&hl=en&x={x}&y={y}&z={z}",
              {
                maxZoom: 20,
                opacity: 0.7,
              }
            ).addTo(mapInstanceRef.current);
            trafficLayerRef.current = trafficLayer;
          }
        } else {
          if (trafficLayerRef.current) {
            mapInstanceRef.current.removeLayer(trafficLayerRef.current);
            trafficLayerRef.current = null;
          }
        }
      }
    }, [showTraffic]);

    // ✅ NEW: Effect to handle sidebar width changes
    useEffect(() => {
      if (
        isMapInitialized &&
        mapInstanceRef.current &&
        sidebarWidth !== prevSidebarWidth.current
      ) {
        // Update previous width reference
        prevSidebarWidth.current = sidebarWidth;

        // Invalidate size with a slight delay to allow DOM updates
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({
              animate: true,
              pan: true,
              duration: 0.25,
            });
          }
        }, 300);
      }
    }, [sidebarWidth, isMapInitialized]);

    const addTooltipStyles = () => {
      const existingStyle = document.getElementById(
        "tooltip-optimization-style"
      );
      if (existingStyle) return;

      const tooltipStyle = document.createElement("style");
      tooltipStyle.id = "tooltip-optimization-style";
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
        z-index: 1001 !important;
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
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes coordinatesPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      /* Cluster tooltip styling */
      .cluster-tooltip {
        background-color: rgba(255, 255, 255, 0.95);
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 0;
        font-size: 12px;
        max-width: 250px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      }
      
      .cluster-tooltip-content {
        padding: 0;
      }
      
      .cluster-tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #1F557F;
        color: white;
        padding: 6px 10px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
      
      .cluster-tooltip-title {
        font-weight: bold;
        font-size: 13px;
        color: white;
      }
      
      .cluster-tooltip-count-badge {
        background-color: white;
        color: #1F557F;
        border-radius: 10px;
        padding: 1px 6px;
        font-size: 11px;
        font-weight: bold;
      }
      
      .cluster-tooltip-body {
        padding: 8px;
      }
      
      .cluster-tooltip-item {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .cluster-tooltip-item:last-child {
        margin-bottom: 0;
      }
      
      .cluster-tooltip-icon-wrapper {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
      }
      
      .cluster-tooltip-icon {
        width: 16px;
        height: 16px;
      }
      
      .cluster-tooltip-label {
        flex: 1;
        font-size: 12px;
      }
      
      .cluster-tooltip-count {
        font-weight: bold;
        color: #333;
      }
      
      /* Make cluster icons interactive */
      .marker-cluster {
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      .marker-cluster:hover {
        transform: scale(1.1);
      }
      
      .cluster-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(37, 104, 159, 0.8);
        color: white;
        font-weight: bold;
        box-shadow: 0 0 0 2px white;
      }
    `;

      document.head.appendChild(tooltipStyle);
    };

    const cleanup = () => {
      const tooltipStyle = document.getElementById(
        "tooltip-optimization-style"
      );
      if (tooltipStyle) tooltipStyle.remove();

      if (locationMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(locationMarkerRef.current);
        locationMarkerRef.current = null;
      }

      if (markerClusterRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterRef.current);
        markerClusterRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      mapInitialized.current = false;
    };

    useImperativeHandle(ref, () => ({
      getMapInstance: () => mapInstanceRef.current,
      getMarkersRef: () => markersRef.current,
      getMarkerCluster: () => markerClusterRef.current,
      getLocationMarker: () => locationMarkerRef.current,
      setLocationMarker: (marker) => {
        locationMarkerRef.current = marker;
      },
      getTileLayer: () => tileLayerRef.current,
      getTrafficLayer: () => trafficLayerRef.current,
      setTrafficLayer: (layer) => {
        trafficLayerRef.current = layer;
      },
      addMarker: (id, marker) => {
        markersRef.current[id] = marker;
      },
      removeMarker: (id) => {
        delete markersRef.current[id];
      },
      clearAllMarkers: () => {
        markersRef.current = {};
      },
      invalidateSize: () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({
            animate: true,
            pan: true,
          });
        }
      },
      closeAllPopups: () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.closePopup();
        }
      },
    }));

    return (
      <div
        ref={mapRef}
        className="w-full h-full z-0"
        style={{
          border: "none",
          outline: "none",
          margin: 0,
          padding: 0,
        }}
      />
    );
  }
);

MapCore.displayName = "MapCore";

export default MapCore;
