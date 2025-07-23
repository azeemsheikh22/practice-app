import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
} from "react";
import "../../styles/mapCluster.css";
import "leaflet/dist/leaflet.css";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsFullScreen,
  selectMapType,
  setFullScreen,
} from "../../features/mapControlsSlice";
import {
  setMapRefs,
  changeMapTypeThunk,
} from "../../features/mapControlsThunks";
import "../../styles/mapTooltips.css";
import "../../styles/distanceTool.css";
import "../../styles/routeStyles.css";

// Import new components
import MapCore from "./MapCore";
import MapControls from "./MapControls";
import MapContextMenus from "./MapContextMenus";
import MapImperativeHandlers from "./MapImperativeHandlers";
import VehicleMarkersManager from "../../components/map/VehicleMarkersManager";

const MapContainer = memo(
  forwardRef(({ searchQuery, sidebarWidth }, ref) => {
    const mapCoreRef = useRef(null);
    const imperativeHandlersRef = useRef(null);
    const contextMenusRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapRefs, setMapRefsState] = useState(null);
    const mapRefsInitialized = useRef(false);
    const prevSidebarWidth = useRef(sidebarWidth);

    // ✅ FIXED: Context menu state in MapContainer
    const [contextMenu, setContextMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      lat: null,
      lng: null,
    });

    // Redux
    const isFullScreen = useSelector(selectIsFullScreen);
    const mapType = useSelector(selectMapType);
    const dispatch = useDispatch();

    // ✅ FIXED: Context menu handler
    const handleContextMenu = useCallback((menuData) => {
      setContextMenu(menuData);
    }, []);

    // ✅ FIXED: Hide context menu handler
    const hideContextMenu = useCallback(() => {
      setContextMenu({ visible: false });
    }, []);

    const handleMapReady = useCallback((refs) => {
      if (mapRefsInitialized.current) return;
      setMapRefsState(refs);
      setIsMapReady(true);
      mapRefsInitialized.current = true;

      setMapRefs({
        mapInstanceRef: refs.mapInstanceRef,
        mapElementRef: { current: refs.mapInstanceRef.current?.getContainer() },
        tileLayerRef: refs.tileLayerRef,
        trafficLayerRef: refs.trafficLayerRef,
      });
    }, []);

    // ✅ NEW: Effect to handle sidebar width changes
    useEffect(() => {
      if (isMapReady && mapRefs && sidebarWidth !== prevSidebarWidth.current) {
        // Update the previous width
        prevSidebarWidth.current = sidebarWidth;
        
        // Delay to allow DOM to update
        setTimeout(() => {
          if (mapRefs.mapInstanceRef.current) {
            // Invalidate size to force map redraw
            mapRefs.mapInstanceRef.current.invalidateSize({
              animate: true,
              pan: true,
              debounceMoveend: true,
              duration: 0.25
            });
          }
        }, 300);
      }
    }, [sidebarWidth, isMapReady, mapRefs]);

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
        document.removeEventListener("fullscreenchange", handleFullScreenChange);
      };
    }, [isFullScreen, dispatch]);

    // Set up global functions
    useEffect(() => {
      if (!isMapReady || !mapRefs) return;

      window.zoomToVehicle = (carId) => {
        const markersRef = mapRefs.markersRef.current;
        const mapInstance = mapRefs.mapInstanceRef.current;
        const marker = markersRef?.[carId];
        if (marker && mapInstance) {
          mapInstance.setView(marker.getLatLng(), 18);
        }
      };

      window.openStreetView = (lat, lng) => {
        const mapInstance = mapRefs.mapInstanceRef.current;
        if (lat && lng && mapInstance) {
          mapInstance.setView([lat, lng], 19);
          if (mapType !== "satellite") {
            dispatch(changeMapTypeThunk("satellite"));
          }
        }
      };

      return () => {
        delete window.zoomToVehicle;
        delete window.openStreetView;
      };
    }, [mapType, dispatch, isMapReady, mapRefs]);

    const handleFitToMap = useCallback(() => {
      if (imperativeHandlersRef.current) {
        imperativeHandlersRef.current.fitToAllMarkers();
      }
    }, []);

    const getVehicleHandlers = useCallback(() => {
      return contextMenusRef.current?.getVehicleHandlers?.() || {
        handleVehicleContextMenu: () => { },
        handleVehicleMenuAction: () => { },
        hideVehicleContextMenu: () => { },
      };
    }, []);

    const getGeofenceHandlers = useCallback(() => {
      return contextMenusRef.current?.getGeofenceHandlers?.() || {
        handleGeofenceContextMenu: () => { },
        handleGeofenceMenuAction: () => { },
        hideGeofenceContextMenu: () => { },
      };
    }, []);

    // Forward imperative methods to parent
    useImperativeHandle(ref, () => ({
      fitToAllMarkers: () => imperativeHandlersRef.current?.fitToAllMarkers(),
      zoomToPakistan: () => imperativeHandlersRef.current?.zoomToPakistan(),
      zoomToLocation: (lat, lng, locationName, isCoordinates) =>
        imperativeHandlersRef.current?.zoomToLocation(lat, lng, locationName, isCoordinates),
      resetAutoZoom: () => imperativeHandlersRef.current?.resetAutoZoom(),
      isMapFitted: () => imperativeHandlersRef.current?.isMapFitted(),
      toggleFullScreen: () => {
      },
      closeAllPopups: () => imperativeHandlersRef.current?.closeAllPopups(),
      // ✅ NEW: Add invalidateSize method
      invalidateSize: () => {
        if (mapRefs?.mapInstanceRef?.current) {
          mapRefs.mapInstanceRef.current.invalidateSize({
            animate: true,
            pan: true
          });
        }
      }
    }));

    // ✅ FIXED: Enhanced global click handler
    useEffect(() => {
      const handleGlobalClick = (e) => {
        // Check if click is outside any context menu
        if (
          !e.target.closest(".map-context-menu") &&
          !e.target.closest("[class*='context-menu']") &&
          !e.target.closest(".leaflet-container")
        ) {
          hideContextMenu();

          // Hide other context menus
          const hideAllContextMenus = contextMenusRef.current?.getHideAllContextMenus?.();
          if (hideAllContextMenus) {
            hideAllContextMenus();
          }
        }
      };

      // ✅ NEW: Custom event listener for hiding all menus
      const handleHideAllContextMenus = () => {
        hideContextMenu();

        const hideAllContextMenus = contextMenusRef.current?.getHideAllContextMenus?.();
        if (hideAllContextMenus) {
          hideAllContextMenus();
        }
      };

      document.addEventListener("click", handleGlobalClick);
      window.addEventListener("hideAllContextMenus", handleHideAllContextMenus); // ✅ Custom event

      return () => {
        document.removeEventListener("click", handleGlobalClick);
        window.removeEventListener("hideAllContextMenus", handleHideAllContextMenus); // ✅ Cleanup
      };
    }, [hideContextMenu]);


    return (
      <div className="relative w-full h-full">
        {/* Core Map Component */}
        <MapCore
          ref={mapCoreRef}
          onContextMenu={handleContextMenu}
          onMapReady={handleMapReady}
          sidebarWidth={sidebarWidth} // ✅ NEW: Pass sidebar width to MapCore
        />

        {/* Only render other components when map is ready */}
        {isMapReady && mapRefs && (
          <>
            {/* Map Controls */}
            <MapControls
              mapCoreRef={mapCoreRef}
              onFitToMap={handleFitToMap}
            />

            {/* Context Menus */}
            <MapContextMenus
              ref={contextMenusRef}
              mapCoreRef={mapCoreRef}
              contextMenu={contextMenu}
              onHideContextMenu={hideContextMenu}
            />

            {/* Imperative Handlers */}
            <MapImperativeHandlers
              ref={imperativeHandlersRef}
              mapCoreRef={mapCoreRef}
            />

            {/* Vehicle Markers Manager */}
            <VehicleMarkersManager
              mapInstanceRef={mapRefs.mapInstanceRef}
              searchQuery={searchQuery || ""}
              markersRef={mapRefs.markersRef}
              markerClusterRef={mapRefs.markerClusterRef}
              onVehicleContextMenu={getVehicleHandlers().handleVehicleContextMenu}
              onGeofenceContextMenu={getGeofenceHandlers().handleGeofenceContextMenu}
            />
          </>
        )}
      </div>
    );
  })
);

MapContainer.displayName = "MapContainer";

export default MapContainer;
