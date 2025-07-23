import {
  generateVehiclePopupContent,
  updateVehiclePopupValues,
} from "../../components/map/generateVehiclePopupContent";

const debouncedTooltipHandlers = new Map();
let currentOpenTooltip = null;
// ✅ REMOVE: updateTimeout - ye blink cause kar raha hai

const updateVehicleMarkers = (
  mapInstanceRef,
  markersRef,
  carData,
  prevPositionsRef,
  isValidCoordinate,
  createVehicleIcon,
  L,
  markerClusterRef,
  iconClustering = false,
  showAllLabels = false,
  onVehicleContextMenu = null,
  movingStatusFilter = 'all'
) => {
  try {
    if (!mapInstanceRef.current) return;

    // ✅ INSTANT EXECUTION - No timeout, no debounce
    if (!carData || carData.length === 0) {
      clearAllMarkers();
      return;
    }

    // ✅ IMMEDIATE EXECUTION
    performSmartUpdate();

    function clearAllMarkers() {
      Object.keys(markersRef.current).forEach((id) => {
        const marker = markersRef.current[id];
        
        if (currentOpenTooltip === marker) {
          currentOpenTooltip = null;
        }

        if (markerClusterRef && markerClusterRef.current && iconClustering) {
          markerClusterRef.current.removeLayer(marker);
        } else if (mapInstanceRef.current.hasLayer(marker)) {
          mapInstanceRef.current.removeLayer(marker);
        }

        delete markersRef.current[id];
        delete prevPositionsRef.current[id];
      });

      if (markerClusterRef && markerClusterRef.current) {
        markerClusterRef.current.clearLayers();
      }
    }

    // ✅ INSTANT SMART UPDATE
    function performSmartUpdate() {
      const map = mapInstanceRef.current;
      const currentCarIds = new Set(carData.map(car => car.car_id));
      const existingCarIds = new Set(Object.keys(markersRef.current).map(id => parseInt(id)));

      // ✅ INSTANT REMOVAL - Remove unselected markers immediately
      const vehiclesToRemove = Array.from(existingCarIds).filter(id => !currentCarIds.has(id));
      vehiclesToRemove.forEach(carId => {
        removeVehicleMarker(carId);
      });

      // ✅ INSTANT ADD/UPDATE - Process all vehicles immediately
      carData.forEach(car => {
        const existingMarker = markersRef.current[car.car_id];
        
        if (existingMarker) {
          // Update existing marker
          updateExistingVehicleMarker(car);
        } else {
          // Add new marker
          addNewVehicleMarker(car);
        }
      });

      // ✅ INSTANT FILTER APPLICATION
      applyFilterToExistingMarkers();
    }

    // ✅ INSTANT FILTER APPLICATION
    function applyFilterToExistingMarkers() {
      const map = mapInstanceRef.current;
      
      Object.keys(markersRef.current).forEach(carIdStr => {
        const carId = parseInt(carIdStr);
        const marker = markersRef.current[carIdStr];
        const car = carData.find(c => c.car_id === carId);
        
        if (car && marker) {
          const shouldShow = vehicleMatchesFilter(car, movingStatusFilter);
          
          if (shouldShow) {
            // Show marker instantly
            if (iconClustering && markerClusterRef.current) {
              if (!markerClusterRef.current.hasLayer(marker)) {
                markerClusterRef.current.addLayer(marker);
              }
            } else {
              if (!map.hasLayer(marker)) {
                marker.addTo(map);
              }
            }
          } else {
            // Hide marker instantly
            if (iconClustering && markerClusterRef.current) {
              if (markerClusterRef.current.hasLayer(marker)) {
                markerClusterRef.current.removeLayer(marker);
              }
            } else {
              if (map.hasLayer(marker)) {
                map.removeLayer(marker);
              }
            }
          }
        }
      });
    }

    // ✅ Helper function for filter check
    function vehicleMatchesFilter(vehicle, movingStatusFilter) {
      if (!movingStatusFilter || movingStatusFilter.toLowerCase() === 'all') {
        return true;
      }
      
      const vehicleStatus = vehicle.movingstatus?.toLowerCase() || 'stop';
      const filterStatus = movingStatusFilter.toLowerCase();
      
      return vehicleStatus === filterStatus;
    }

    // ✅ INSTANT REMOVAL
    function removeVehicleMarker(carId) {
      const marker = markersRef.current[carId];
      if (!marker) return;

      if (debouncedTooltipHandlers.has(carId)) {
        debouncedTooltipHandlers.delete(carId);
      }

      if (currentOpenTooltip === marker) {
        currentOpenTooltip = null;
      }

      // Remove from cluster or map immediately
      if (markerClusterRef && markerClusterRef.current && iconClustering) {
        markerClusterRef.current.removeLayer(marker);
      } else if (mapInstanceRef.current.hasLayer(marker)) {
        mapInstanceRef.current.removeLayer(marker);
      }

      // Clean up references immediately
      delete markersRef.current[carId];
      delete prevPositionsRef.current[carId];
    }

    // ✅ INSTANT ADD
    function addNewVehicleMarker(car) {
      const {
        car_id,
        latitude,
        longitude,
        movingstatus,
        carname,
        speed,
        location,
        gps_time,
        head,
        mileage,
        signalstrength,
        acc,
      } = car;

      if (!isValidCoordinate(latitude, longitude)) return;

      // Initialize position tracking
      prevPositionsRef.current[car_id] = {
        lat: latitude,
        lng: longitude,
        lastUpdate: Date.now(),
      };

      const vehicleIcon = createVehicleIcon(movingstatus, head);
      const marker = L.marker([latitude, longitude], {
        icon: vehicleIcon,
        interactive: true,
        bubblingMouseEvents: false,
      });

      // Store vehicle data in marker for reference
      marker.vehicleData = car;
      marker.vehicleStatus = movingstatus;
      marker.vehicleHeading = head || 0;

      // Bind popup and tooltip
      setupMarkerInteractions(marker, car);

      // ✅ Always store reference first
      markersRef.current[car_id] = marker;

      // ✅ Then check filter and add to map if needed
      const shouldShow = vehicleMatchesFilter(car, movingStatusFilter);
      if (shouldShow) {
        addMarkerToMapOrCluster(marker, car);
      }
    }

    // ✅ OPTIMIZED UPDATE
    function updateExistingVehicleMarker(car) {
      const {
        car_id,
        latitude,
        longitude,
        movingstatus,
        carname,
        speed,
        head,
      } = car;

      if (!isValidCoordinate(latitude, longitude)) return;

      const marker = markersRef.current[car_id];
      if (!marker) return;

      // Update vehicle data in marker
      marker.vehicleData = car;

      // ✅ Quick position update
      marker.setLatLng([latitude, longitude]);

      // ✅ Quick icon update if needed
      const currentStatus = marker.vehicleStatus;
      if (currentStatus !== movingstatus) {
        marker.setIcon(createVehicleIcon(movingstatus, head));
        marker.vehicleStatus = movingstatus;
        marker.vehicleHeading = head || 0;
      }

      // ✅ Update popup if open
      if (marker.isPopupOpen()) {
        try {
          const popupContent = generateVehiclePopupContent(car);
          marker.getPopup().setContent(popupContent);
        } catch (error) {
          console.error("Error updating popup:", error);
        }
      }

      // ✅ Update tooltip
      updateMarkerTooltip(marker, carname || `Vehicle ${car_id}`);
    }

    // ✅ Setup marker interactions
    function setupMarkerInteractions(marker, car) {
      const { car_id, carname } = car;
      
      const generatePopupContent = () => {
        try {
          return generateVehiclePopupContent(car);
        } catch (error) {
          console.error("Error generating popup content:", error);
          return `
            <div style="padding: 10px;">
              <h3>${carname}</h3>
              <p>Speed: ${car.speed} km/h</p>
              <p>Status: ${car.movingstatus}</p>
              <p>Location: ${car.location}</p>
            </div>
          `;
        }
      };

      marker.bindPopup(generatePopupContent(), {
        closeButton: true,
        className: "custom-popup",
        autoPan: true,
        maxWidth: 350,
        minWidth: 330,
        closeOnClick: false,
        autoClose: false,
      });

      marker.bindTooltip(carname || `Vehicle ${car_id}`, {
        permanent: showAllLabels,
        direction: "top",
        className: "custom-tooltip",
        opacity: showAllLabels ? 0.6 : 1,
        offset: [0, -5],
        sticky: !showAllLabels,
        interactive: false,
      });

      if (showAllLabels) {
        marker.openTooltip();
      }

      // Mouse events for tooltip
      if (!showAllLabels) {
        let showTooltipTimeout;

        marker.on("mouseover", function () {
          closeAllNonPermanentTooltips();
          clearTimeout(showTooltipTimeout);

          showTooltipTimeout = setTimeout(() => {
            if (currentOpenTooltip && currentOpenTooltip !== this) {
              currentOpenTooltip.closeTooltip();
            }
            this.openTooltip();
            currentOpenTooltip = this;
          }, 200);
        });

        marker.on("mouseout", function () {
          clearTimeout(showTooltipTimeout);
          this.closeTooltip();
          if (currentOpenTooltip === this) {
            currentOpenTooltip = null;
          }
        });
      }

      marker.on("click", function (e) {
        L.DomEvent.stopPropagation(e);
        closeAllNonPermanentTooltips();

        this.bindPopup(generatePopupContent(), {
          closeButton: true,
          className: "custom-popup",
          autoPan: true,
          maxWidth: 350,
          minWidth: 330,
        });

        setTimeout(() => {
          this.openPopup();
        }, 50);
      });

      // Context menu
      if (onVehicleContextMenu) {
        marker.on("contextmenu", function (e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);

          const containerPoint = mapInstanceRef.current.latLngToContainerPoint(e.latlng);
          const mapContainer = mapInstanceRef.current.getContainer();
          const rect = mapContainer.getBoundingClientRect();

          const screenX = rect.left + containerPoint.x;
          const screenY = rect.top + containerPoint.y;

          onVehicleContextMenu(car, screenX, screenY);
        });
      }
    }

    // ✅ Helper function to add marker to map or cluster
    function addMarkerToMapOrCluster(marker, car) {
      if (iconClustering && markerClusterRef.current) {
        markerClusterRef.current.addLayer(marker);
      } else {
        marker.addTo(mapInstanceRef.current);
      }
    }

    // ✅ Helper function to update marker tooltip
    function updateMarkerTooltip(marker, tooltipText) {
      if (marker.getTooltip()) {
        if (marker._tooltip && marker._tooltip.options.permanent !== showAllLabels) {
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

          if (showAllLabels) {
            marker.openTooltip();
          }
        }
      }
    }

    // ✅ Helper function to close all non-permanent tooltips
    function closeAllNonPermanentTooltips() {
      Object.values(markersRef.current).forEach((marker) => {
        if (marker.getTooltip() && !marker.getTooltip().options.permanent) {
          marker.closeTooltip();
        }
      });
      currentOpenTooltip = null;
    }

    // Add map click event to close all tooltips
    const map = mapInstanceRef.current;
    map.off("click", closeAllNonPermanentTooltips);
    map.on("click", closeAllNonPermanentTooltips);

  } catch (error) {
    console.error("Error in updateVehicleMarkers:", error);
  }
};

// ✅ Reset cluster function
function resetCluster(markerClusterRef, markersRef, map, iconClustering) {
  if (!markerClusterRef || !markerClusterRef.current) return;

  markerClusterRef.current.clearLayers();

  if (iconClustering) {
    Object.values(markersRef.current).forEach((marker) => {
      markerClusterRef.current.addLayer(marker);
    });
  } else {
    Object.values(markersRef.current).forEach((marker) => {
      marker.addTo(map);
    });
  }
}

export { resetCluster };
export default updateVehicleMarkers;
