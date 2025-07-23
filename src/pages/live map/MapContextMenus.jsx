import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectMapType } from '../../features/mapControlsSlice';
import { changeMapTypeThunk } from '../../features/mapControlsThunks';
import ContextMenus from '../../components/map/ContextMenus';
import DistanceMeasurementTool from '../../components/map/DistanceMeasurementTool';
import { toggleGeofenceShape } from '../../features/geofenceSlice'; // Import the new action
import {
  handleZoomToLocation,
  handleCreateGeofence,
  handleMeasureDistance,
  handleOpenStreetView,
  handleCopyCoordinates,
  handleFindNearest,
  handleSendToGarmin,
  handleGetDirectionsTo,
  handleGetDirectionsFrom,
  handleOpenDriverDispatch,
  handleVehicleContextMenu,
  handleVehicleMenuAction,
  handleGeofenceContextMenu,
  handleGeofenceMenuAction,
  hideVehicleContextMenu,
  hideGeofenceContextMenu,
  hideContextMenu,
} from '../../utils/map/contextMenuHandlers';
import {
  showCopySuccessMessage,
  showCopyErrorMessage,
} from '../../utils/map/messageUtils';

const MapContextMenus = forwardRef(({
  mapCoreRef,
  contextMenu,
  onHideContextMenu
}, ref) => {
  const mapType = useSelector(selectMapType);
  const dispatch = useDispatch();

  // Vehicle and Geofence context menu states
  const [vehicleContextMenu, setVehicleContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    vehicleData: null,
  });

  const [geofenceContextMenu, setGeofenceContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    geofenceData: null,
  });

  // Distance Tool State
  const [distanceToolActive, setDistanceToolActive] = useState(false);

  // ✅ FIXED: Context menu handlers using passed contextMenu prop
  const contextMenuHandlers = {
    handleZoomToLocation: () => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      handleZoomToLocation(contextMenu, { current: mapInstance }, onHideContextMenu);
    },
    handleCreateGeofence: () =>
      handleCreateGeofence(contextMenu, onHideContextMenu),
    handleMeasureDistance: () =>
      handleMeasureDistance(setDistanceToolActive, contextMenu, onHideContextMenu),
    handleOpenStreetView: () => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      handleOpenStreetView(
        contextMenu,
        { current: mapInstance },
        mapType,
        dispatch,
        changeMapTypeThunk,
        onHideContextMenu
      );
    },
    handleCopyCoordinates: () =>
      handleCopyCoordinates(
        contextMenu,
        onHideContextMenu,
        showCopySuccessMessage,
        showCopyErrorMessage
      ),
    handleFindNearest: () => handleFindNearest(contextMenu, onHideContextMenu),
    handleSendToGarmin: () => handleSendToGarmin(contextMenu, onHideContextMenu),
    handleGetDirectionsTo: () =>
      handleGetDirectionsTo(contextMenu, onHideContextMenu),
    handleGetDirectionsFrom: () =>
      handleGetDirectionsFrom(contextMenu, onHideContextMenu),
    handleOpenDriverDispatch: () =>
      handleOpenDriverDispatch(contextMenu, onHideContextMenu),
  };

  // ✅ FIXED: Vehicle handlers with proper hide functionality
  const vehicleHandlers = {
    handleVehicleContextMenu: useCallback(
      (vehicleData, x, y) => {
        console.log('Vehicle context menu triggered:', { vehicleData, x, y });

        // ✅ Hide main context menu first
        onHideContextMenu();

        // ✅ Show vehicle context menu
        setVehicleContextMenu({
          visible: true,
          x: x,
          y: y,
          vehicleData: vehicleData,
        });
      },
      [onHideContextMenu]
    ),

    handleVehicleMenuAction: useCallback(
      (action, vehicleData) => {
        const mapInstance = mapCoreRef.current?.getMapInstance();
        const markersRef = mapCoreRef.current?.getMarkersRef();
        handleVehicleMenuAction(
          action,
          vehicleData,
          { current: mapInstance },
          { current: markersRef },
          setVehicleContextMenu
        );
      },
      []
    ),

    hideVehicleContextMenu: useCallback(() => {
      console.log('Hiding vehicle context menu'); // Debug log
      setVehicleContextMenu({
        visible: false,
        x: 0,
        y: 0,
        vehicleData: null,
      });
    }, []),
  };


  const geofenceHandlers = {
    handleGeofenceContextMenu: useCallback(
      (geofenceData, x, y) => {
        console.log('Geofence context menu triggered:', { geofenceData, x, y }); // Debug log
        handleGeofenceContextMenu(
          geofenceData,
          x,
          y,
          setGeofenceContextMenu,
          onHideContextMenu,
          setVehicleContextMenu
        );
      },
      [onHideContextMenu]
    ),
    handleGeofenceMenuAction: useCallback(
      (action, geofenceData) => {
        const mapInstance = mapCoreRef.current?.getMapInstance();

        // Special handling for "zoomTo" action to also show the shape
        if (action === "zoomTo" && geofenceData && geofenceData.id) {
          // Dispatch action to add this geofence to the selected shapes
          dispatch(toggleGeofenceShape(geofenceData.id));
        }

        handleGeofenceMenuAction(
          action,
          geofenceData,
          { current: mapInstance },
          mapType,
          dispatch,
          changeMapTypeThunk,
          setGeofenceContextMenu
        );
      },
      [mapType, dispatch, mapCoreRef]
    ),
    hideGeofenceContextMenu: () =>
      hideGeofenceContextMenu(geofenceContextMenu, setGeofenceContextMenu),
  };

  // Combined hide function
  const hideAllContextMenus = useCallback(() => {
    onHideContextMenu();
    hideContextMenu(
      onHideContextMenu,
      setVehicleContextMenu,
      setGeofenceContextMenu
    );
  }, [onHideContextMenu]);

  // Distance tool handlers
  const handleDistanceToolClose = () => {
    setDistanceToolActive(false);
  };

  const handleMeasurementComplete = (measurementData) => {
    console.log('Measurement completed:', measurementData);
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getVehicleHandlers: () => vehicleHandlers,
    getGeofenceHandlers: () => geofenceHandlers,
    getHideAllContextMenus: () => hideAllContextMenus,
  }));

  return (
    <>
      {/* Context Menus Component */}
      <ContextMenus
        // Context Menu Props
        contextMenu={contextMenu}
        handleZoomToLocation={contextMenuHandlers.handleZoomToLocation}
        handleCopyCoordinates={contextMenuHandlers.handleCopyCoordinates}
        handleCreateGeofence={contextMenuHandlers.handleCreateGeofence}
        handleMeasureDistance={contextMenuHandlers.handleMeasureDistance}
        handleOpenStreetView={contextMenuHandlers.handleOpenStreetView}
        handleFindNearest={contextMenuHandlers.handleFindNearest}
        handleSendToGarmin={contextMenuHandlers.handleSendToGarmin}
        handleGetDirectionsTo={contextMenuHandlers.handleGetDirectionsTo}
        handleGetDirectionsFrom={contextMenuHandlers.handleGetDirectionsFrom}
        handleOpenDriverDispatch={contextMenuHandlers.handleOpenDriverDispatch}
        // Vehicle Context Menu Props
        vehicleContextMenu={vehicleContextMenu}
        handleVehicleMenuAction={vehicleHandlers.handleVehicleMenuAction}
        // Geofence Context Menu Props
        geofenceContextMenu={geofenceContextMenu}
        handleGeofenceMenuAction={geofenceHandlers.handleGeofenceMenuAction}
      />

      {/* Distance Measurement Tool */}
      <DistanceMeasurementTool
        mapInstanceRef={{ current: mapCoreRef.current?.getMapInstance() }}
        isActive={distanceToolActive}
        onClose={handleDistanceToolClose}
        onMeasurementComplete={handleMeasurementComplete}
      />
    </>
  );
});

MapContextMenus.displayName = 'MapContextMenus';

export default MapContextMenus;

