// ✅ All context menu functions in separate file
export const handleZoomToLocation = (contextMenu, mapInstanceRef, setContextMenu) => {
    if (mapInstanceRef.current && contextMenu.lat && contextMenu.lng) {
      mapInstanceRef.current.setView([contextMenu.lat, contextMenu.lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleCreateGeofence = (contextMenu, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      const lat = parseFloat(contextMenu.lat.toFixed(6));
      const lng = parseFloat(contextMenu.lng.toFixed(6));
  
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
  
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleMeasureDistance = (setDistanceToolActive, contextMenu, setContextMenu) => {
    setDistanceToolActive(true);
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleOpenStreetView = (contextMenu, mapInstanceRef, mapType, dispatch, changeMapTypeThunk, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      mapInstanceRef.current.setView([contextMenu.lat, contextMenu.lng], 18);
  
      if (mapType !== "satellite") {
        dispatch(changeMapTypeThunk("satellite"));
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleCopyCoordinates = async (contextMenu, setContextMenu, showCopySuccessMessage, showCopyErrorMessage) => {
    if (contextMenu.lat && contextMenu.lng) {
      const coordinatesText = `${contextMenu.lat.toFixed(6)}, ${contextMenu.lng.toFixed(6)}`;
  
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
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleFindNearest = (contextMenu, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      // Add your find nearest logic here
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleSendToGarmin = (contextMenu, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      // Add your Garmin integration logic here
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleGetDirectionsTo = (contextMenu, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      // Add your directions logic here
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleGetDirectionsFrom = (contextMenu, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      // Add your directions logic here
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  export const handleOpenDriverDispatch = (contextMenu, setContextMenu) => {
    if (contextMenu.lat && contextMenu.lng) {
      // Add your driver dispatch logic here
    }
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  // ✅ NEW: Vehicle Context Menu Handler
  export const handleVehicleContextMenu = (vehicleData, x, y, setVehicleContextMenu, setContextMenu) => {
    setVehicleContextMenu({
      visible: true,
      x: x,
      y: y,
      vehicleData: vehicleData,
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };
  
  // ✅ NEW: Vehicle Menu Action Handler
  export const handleVehicleMenuAction = (action, vehicleData, mapInstanceRef, markersRef, setVehicleContextMenu) => {
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
        if (mapInstanceRef.current && markersRef.current[vehicleData.car_id]) {
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
  
    setVehicleContextMenu((prev) => ({ ...prev, visible: false }));
  };
  
  // ✅ NEW: Geofence Context Menu Handler
  export const handleGeofenceContextMenu = (geofenceData, x, y, setGeofenceContextMenu, setContextMenu, setVehicleContextMenu) => {
    setGeofenceContextMenu({
      visible: true,
      x: x,
      y: y,
      geofenceData: geofenceData,
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
    setVehicleContextMenu((prev) => ({ ...prev, visible: false }));
  };
  
  // ✅ NEW: Geofence Menu Action Handler
  export const handleGeofenceMenuAction = (action, geofenceData, mapInstanceRef, mapType, dispatch, changeMapTypeThunk, setGeofenceContextMenu) => {
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
        break;
      case "sendToGarmin":
        break;
      default:
        break;
    }
  
    setGeofenceContextMenu((prev) => ({ ...prev, visible: false }));
  };
  
  // ✅ NEW: Hide Context Menu Functions
  export const hideVehicleContextMenu = (vehicleContextMenu, setVehicleContextMenu) => {
    setVehicleContextMenu({ ...vehicleContextMenu, visible: false });
  };
  
  export const hideGeofenceContextMenu = (geofenceContextMenu, setGeofenceContextMenu) => {
    setGeofenceContextMenu({ ...geofenceContextMenu, visible: false });
  };
  
  export const hideContextMenu = (setContextMenu, setVehicleContextMenu, setGeofenceContextMenu) => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
    setVehicleContextMenu((prev) => ({ ...prev, visible: false }));
    setGeofenceContextMenu((prev) => ({ ...prev, visible: false }));
  };
  