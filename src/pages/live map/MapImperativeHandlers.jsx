import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import L from 'leaflet';

const MapImperativeHandlers = forwardRef(({ mapCoreRef }, ref) => {
  const [isMapFitted, setIsMapFitted] = useState(false);

  // Memoized function to check if coordinates are valid
  const isValidCoordinate = (lat, lng) =>
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0;

  useImperativeHandle(ref, () => ({
    fitToAllMarkers: () => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      const markersRef = mapCoreRef.current?.getMarkersRef();
      
      if (mapInstance && markersRef) {
        mapInstance.closePopup();
        const markerCount = Object.keys(markersRef).length;

        if (markerCount === 0) {
          mapInstance.setView([30.3753, 69.3451], 5.5, {
            animate: true,
            duration: 1.5,
          });
          setIsMapFitted(true);
          setTimeout(() => setIsMapFitted(false), 1000);
          return true;
        } else if (markerCount === 1) {
          const marker = Object.values(markersRef)[0];
          mapInstance.setView(marker.getLatLng(), 18);
          setIsMapFitted(true);
          setTimeout(() => setIsMapFitted(false), 1000);
          return true;
        } else {
          const bounds = L.latLngBounds(
            Object.values(markersRef)
              .map((marker) => marker.getLatLng())
              .filter((pos) => isValidCoordinate(pos.lat, pos.lng))
          );

          if (bounds.isValid()) {
            mapInstance.fitBounds(bounds, { padding: [50, 50] });
            setIsMapFitted(true);
            setTimeout(() => setIsMapFitted(false), 1000);
            return true;
          }
        }
      }
      return false;
    },

    zoomToPakistan: () => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      if (mapInstance) {
        mapInstance.setView([30.3753, 69.3451], 5.5, {
          animate: true,
          duration: 1.5,
        });
        setIsMapFitted(true);
        setTimeout(() => setIsMapFitted(false), 1000);
        return true;
      }
      return false;
    },

    zoomToLocation: (lat, lng, locationName, isCoordinates = false) => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      if (mapInstance) {
        mapInstance.closePopup();

        // Remove existing location marker
        const existingLocationMarker = mapCoreRef.current?.getLocationMarker();
        if (existingLocationMarker && mapInstance.hasLayer(existingLocationMarker)) {
          mapInstance.removeLayer(existingLocationMarker);
        }

        const markerIcon = isCoordinates
          ? L.divIcon({
              className: "coordinates-search-marker",
              html: `
                <div style="
                  background: #2563eb; 
                  border: 3px solid white; 
                  border-radius: 50%; 
                  width: 28px; 
                  height: 28px;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                  position: relative;
                  animation: coordinatesPulse 2s infinite;
                  z-index: 1000;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                  "></div>
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14],
            })
          : L.divIcon({
              className: "location-search-marker",
              html: `
                <div style="
                  background: #ef4444; 
                  border: 3px solid white; 
                  border-radius: 50%; 
                  width: 24px; 
                  height: 24px;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                  position: relative;
                  animation: locationPulse 2s infinite;
                  z-index: 1000;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                  "></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12],
            });

        const locationMarker = L.marker([lat, lng], {
          icon: markerIcon,
          isLocationMarker: true,
        });

        mapCoreRef.current?.setLocationMarker(locationMarker);
        locationMarker.addTo(mapInstance);

        const popupContent = isCoordinates
          ? `
            <div style="text-align: center; padding: 12px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px;">
              <div style="font-weight: 600; font-size: 16px; color: #1f2937; margin-bottom: 8px; line-height: 1.3;">📍 Coordinates</div>
              <div style="font-size: 13px; color: #374151; margin-bottom: 4px; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">Lat: ${lat.toFixed(6)}</div>
              <div style="font-size: 13px; color: #374151; margin-bottom: 8px; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">Lng: ${lng.toFixed(6)}</div>
              <div style="font-size: 11px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Geographic Location</div>
            </div>
          `
          : `
            <div style="text-align: center; padding: 8px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 150px;">
              <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px; line-height: 1.3;">${locationName.split(",")[0]}</div>
              <div style="font-size: 11px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">📍 Searched Location</div>
            </div>
          `;

        locationMarker
          .bindPopup(popupContent, {
            closeButton: true,
            autoClose: false,
            closeOnClick: false,
            className: isCoordinates ? "coordinates-search-popup" : "location-search-popup",
          })
          .openPopup();

        const zoomLevel = isCoordinates ? 16 : 15;
        mapInstance.setView([lat, lng], zoomLevel, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.25,
        });

        setIsMapFitted(true);
        setTimeout(() => setIsMapFitted(false), 2000);

        // Auto-remove marker after 15 seconds
        setTimeout(() => {
          const currentLocationMarker = mapCoreRef.current?.getLocationMarker();
          if (currentLocationMarker && mapInstance.hasLayer(currentLocationMarker)) {
            const markerElement = currentLocationMarker.getElement();
            if (markerElement) {
              markerElement.style.transition = "opacity 1s ease-out";
              markerElement.style.opacity = "0";

              setTimeout(() => {
                if (currentLocationMarker && mapInstance.hasLayer(currentLocationMarker)) {
                  mapInstance.removeLayer(currentLocationMarker);
                  mapCoreRef.current?.setLocationMarker(null);
                }
              }, 1000);
            }
          }
        }, 15000);

        return true;
      }
      return false;
    },

    resetAutoZoom: () => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      if (mapInstance) {
        window.dispatchEvent(new CustomEvent("resetAutoZoom"));
      }
    },

    isMapFitted: () => isMapFitted,

    closeAllPopups: () => {
      const mapInstance = mapCoreRef.current?.getMapInstance();
      if (mapInstance) {
        mapInstance.closePopup();
      }
    },
  }));

  return null;
});

MapImperativeHandlers.displayName = 'MapImperativeHandlers';

export default MapImperativeHandlers;
