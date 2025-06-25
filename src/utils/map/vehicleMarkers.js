import {
  generateVehiclePopupContent,
  updateVehiclePopupValues,
} from "../../components/map/generateVehiclePopupContent";

const debouncedTooltipHandlers = new Map();
let currentOpenTooltip = null;
let updateTimeout = null;

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
  onVehicleContextMenu = null // ADD THIS LINE
) => {
  try {
    if (!mapInstanceRef.current) return;
    // Reduce debounce time for more responsive updates
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
      performUpdate();
    }, 50); // Reduced from 100ms

    function performUpdate() {
      const map = mapInstanceRef.current;
      const currentCarIds = new Set();
      const closeAllNonPermanentTooltips = () => {
        Object.values(markersRef.current).forEach((marker) => {
          if (marker.getTooltip() && !marker.getTooltip().options.permanent) {
            marker.closeTooltip();
          }
        });
        currentOpenTooltip = null;
      };

      // Helper function to determine if vehicle should bypass clustering
      const shouldBypassCluster = (car) => {
        return (
          car.movingstatus?.toLowerCase() === "moving" || // Moving vehicles
          car.speed > 30 || // Fast vehicles
          car.acc === "ON" // Engine ON vehicles
        );
      };

      // Add vehicle context menu function
      function addVehicleContextMenu(marker, vehicleData) {
        if (!onVehicleContextMenu) return;

        // Remove existing contextmenu listener
        marker.off("contextmenu");

        // Add right-click context menu
        marker.on("contextmenu", function (e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);

          // Get screen coordinates
          const containerPoint = mapInstanceRef.current.latLngToContainerPoint(
            e.latlng
          );
          const mapContainer = mapInstanceRef.current.getContainer();
          const rect = mapContainer.getBoundingClientRect();

          const screenX = rect.left + containerPoint.x;
          const screenY = rect.top + containerPoint.y;

          // Call the context menu handler
          onVehicleContextMenu(vehicleData, screenX, screenY);
        });
      }

      // Process vehicles in smaller batches for smoother updates
      const batchSize = 15;
      const batches = Math.ceil(carData.length / batchSize);

      processBatch(0);

      function processBatch(batchIndex) {
        if (batchIndex >= batches) {
          removeStaleMarkers();
          return;
        }

        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, carData.length);

        for (let i = start; i < end; i++) {
          try {
            processVehicle(carData[i]);
          } catch (err) {
            console.error(`Error processing vehicle ${i}:`, err);
          }
        }

        if (batchIndex < batches - 1) {
          requestAnimationFrame(() => processBatch(batchIndex + 1));
        } else {
          removeStaleMarkers();
        }
      }

      function processVehicle(car) {
        if (!car) return;

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

        currentCarIds.add(car_id);

        if (!prevPositionsRef.current[car_id]) {
          prevPositionsRef.current[car_id] = {
            lat: latitude,
            lng: longitude,
            lastUpdate: 0, // Initialize with 0
          };
        }

        const targetPosition = { lat: latitude, lng: longitude };
        const prevPosition = prevPositionsRef.current[car_id];

        // More sensitive position change detection
        const positionChanged =
          Math.abs(prevPosition.lat - targetPosition.lat) > 0.00001 || // Back to original sensitivity
          Math.abs(prevPosition.lng - targetPosition.lng) > 0.00001;

        // Reduce throttling for moving vehicles
        const now = Date.now();
        const timeSinceLastUpdate = now - (prevPosition.lastUpdate || 0);
        const isMoving = movingstatus?.toLowerCase() === "moving";

        // Different update intervals for moving vs stationary vehicles
        const updateInterval = isMoving ? 1000 : 3000; // 1 sec for moving, 3 sec for others
        const shouldUpdate =
          positionChanged || timeSinceLastUpdate > updateInterval;

        const generatePopupContent = () => {
          try {
            return generateVehiclePopupContent({
              car_id,
              carname,
              movingstatus,
              speed,
              location,
              gps_time,
              mileage,
              signalstrength,
              acc,
              latitude,
              longitude,
            });
          } catch (error) {
            console.error("Error generating popup content:", error);
            return `
              <div style="padding: 10px;">
                <h3>${carname}</h3>
                <p>Speed: ${speed} km/h</p>
                <p>Status: ${movingstatus}</p>
                <p>Location: ${location}</p>
              </div>
            `;
          }
        };

        // Update existing marker section mein:
        if (markersRef.current[car_id]) {
          const marker = markersRef.current[car_id];

          // Always update icon and status for real-time changes
          const currentStatus = marker.vehicleStatus || "";
          const currentHeading = marker.vehicleHeading || 0;
          const headingDiff = Math.abs((head || 0) - currentHeading);

          // ✅ Only update icon if status changed or significant heading change (for moving vehicles only)
          const isMovingVehicle = movingstatus?.toLowerCase() === "moving";
          const shouldUpdateIcon =
            currentStatus !== movingstatus ||
            (isMovingVehicle && headingDiff > 10);

          if (shouldUpdateIcon) {
            marker.setIcon(createVehicleIcon(movingstatus, head));
            marker.vehicleStatus = movingstatus;
            marker.vehicleHeading = head || 0;
          }

          // Update position if changed
          if (positionChanged && shouldUpdate) {
            if (isMoving && speed > 0) {
              // Use animation for moving vehicles
              marker.slideTo([latitude, longitude], {
                duration: 1500,
                keepAtCenter: false,
              });
              // ✅ Only set rotation angle for moving vehicles
              if (head && isMovingVehicle) {
                marker.setRotationAngle(head);
              }
            } else {
              // Just set position for stopped/idle vehicles
              marker.setLatLng([latitude, longitude]);
            }

            // Update timestamp
            prevPositionsRef.current[car_id].lastUpdate = now;
          }
          // Check if popup is open for this marker
          const isPopupOpen = marker.isPopupOpen();

          if (isPopupOpen) {
            // ✅ Try selective update first
            try {
              updateVehiclePopupValues(car_id, car);
            } catch (error) {
              // ✅ Fallback to full content update
              marker.getPopup().setContent(generatePopupContent());
            }
          } else if (!marker.getPopup()) {
            marker.bindPopup(generatePopupContent(), {
              closeButton: true,
              className: "custom-popup",
            });
          }

          // ✅ Force popup content refresh in cluster mode or when popup is open
          if (isPopupOpen || iconClustering) {
            if (!marker.getPopup()) {
              marker.bindPopup(generatePopupContent(), {
                closeButton: true,
                className: "custom-popup",
              });
            } else {
              // Always refresh popup content for better accuracy
              marker.getPopup().setContent(generatePopupContent());
            }
          } else if (!marker.getPopup()) {
            // Lazy bind popup only when needed
            marker.bindPopup(generatePopupContent(), {
              closeButton: true,
              className: "custom-popup",
            });
          }

          // TOOLTIP HANDLING
          if (marker.getTooltip()) {
            if (
              marker._tooltip &&
              marker._tooltip.options.permanent !== showAllLabels
            ) {
              marker.unbindTooltip();
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
            }
          } else {
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
          }

          // Clear existing event handlers
          marker.off("mouseover").off("mouseout").off("click");

          if (!showAllLabels) {
            let showTooltipTimeout;

            marker.on("mouseover", function (e) {
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

            marker.on("mouseout", function (e) {
              clearTimeout(showTooltipTimeout);
              this.closeTooltip();

              if (currentOpenTooltip === this) {
                currentOpenTooltip = null;
              }
            });
          }

          // ✅ Enhanced click handler for better popup experience
          marker.on("click", function (e) {
            L.DomEvent.stopPropagation(e);
            closeAllNonPermanentTooltips();

            // Force fresh popup content
            this.bindPopup(generatePopupContent(), {
              closeButton: true,
              className: "custom-popup",
              autoPan: true,
            });

            setTimeout(() => {
              this.openPopup();
            }, 50);
          });

          // Add context menu to existing marker
          addVehicleContextMenu(marker, car);
        } else {
          // Create new marker section mein:
          const vehicleIcon = createVehicleIcon(movingstatus, head);
          const marker = L.marker([latitude, longitude], {
            icon: vehicleIcon,
            interactive: true,
            bubblingMouseEvents: false,
          });

          marker.vehicleStatus = movingstatus;
          marker.vehicleHeading = head || 0;

          // ✅ Only set rotation for moving vehicles
          const isMovingVehicle = movingstatus?.toLowerCase() === "moving";
          if (isMovingVehicle && head) {
            marker.setRotationAngle(head);
          }

          marker.bindPopup(generatePopupContent(), {
            closeButton: true,
            className: "custom-popup",
            autoPan: true,
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

          let showTooltipTimeout;

          if (!showAllLabels) {
            marker.on("mouseover", function (e) {
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

            marker.on("mouseout", function (e) {
              clearTimeout(showTooltipTimeout);
              this.closeTooltip();

              if (currentOpenTooltip === this) {
                currentOpenTooltip = null;
              }
            });
          }

          // ✅ Enhanced click handler for new markers
          marker.on("click", function (e) {
            L.DomEvent.stopPropagation(e);
            closeAllNonPermanentTooltips();

            // Force fresh popup content
            this.bindPopup(generatePopupContent(), {
              closeButton: true,
              className: "custom-popup",
              autoPan: true,
            });

            setTimeout(() => {
              this.openPopup();
            }, 50);
          });

          // Add context menu to new marker
          addVehicleContextMenu(marker, car);

          // ✅ Smart clustering logic - bypass cluster for important vehicles
          const bypassCluster = shouldBypassCluster(car);

          if (bypassCluster) {
            // Force individual marker for important vehicles (better popup experience)
            marker.addTo(map);
          } else if (
            markerClusterRef &&
            markerClusterRef.current &&
            iconClustering
          ) {
            // Normal clustering for less important vehicles
            markerClusterRef.current.addLayer(marker);
          } else {
            // No clustering mode
            marker.addTo(map);
          }

          markersRef.current[car_id] = marker;
        }

        // Always update position reference
        prevPositionsRef.current[car_id] = {
          ...targetPosition,
          lastUpdate: shouldUpdate ? now : prevPosition.lastUpdate,
        };
      }

      function removeStaleMarkers() {
        Object.keys(markersRef.current).forEach((id) => {
          if (!currentCarIds.has(parseInt(id))) {
            const marker = markersRef.current[id];

            if (debouncedTooltipHandlers.has(parseInt(id))) {
              debouncedTooltipHandlers.delete(parseInt(id));
            }

            if (currentOpenTooltip === marker) {
              currentOpenTooltip = null;
            }

            if (
              markerClusterRef &&
              markerClusterRef.current &&
              iconClustering
            ) {
              markerClusterRef.current.removeLayer(marker);
            } else {
              map.removeLayer(marker);
            }

            delete markersRef.current[id];
            delete prevPositionsRef.current[id];
          }
        });
      }
      // Add map click event to close all tooltips
      map.off("click", closeAllNonPermanentTooltips);
      map.on("click", closeAllNonPermanentTooltips);
    }
  } catch (error) {
    console.error("Error in updateVehicleMarkers:", error);
  }
};

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
