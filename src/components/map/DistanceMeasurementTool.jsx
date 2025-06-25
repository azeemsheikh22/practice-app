import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const DistanceMeasurementTool = ({ 
  mapInstanceRef, 
  isActive, 
  onClose, 
  onMeasurementComplete 
}) => {
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const tooltipRef = useRef(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    } else {
      return `${distance.toFixed(2)} km`;
    }
  };

  // Create distance marker
  const createDistanceMarker = (latlng, isStart = false) => {
    const markerIcon = L.divIcon({
      className: 'distance-marker',
      html: `
        <div class="distance-marker-icon ${isStart ? 'start-marker' : 'waypoint-marker'}">
          <div class="distance-marker-inner">
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    return L.marker(latlng, { 
      icon: markerIcon,
      draggable: false,
      zIndexOffset: 1000
    });
  };

  // Create distance line
  const createDistanceLine = (latlngs, distance) => {
    const polyline = L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 10',
      className: 'distance-line'
    });

    // Add distance label at midpoint
    if (latlngs.length >= 2) {
      const midpoint = [
        (latlngs[0][0] + latlngs[latlngs.length - 1][0]) / 2,
        (latlngs[0][1] + latlngs[latlngs.length - 1][1]) / 2
      ];

      const distanceLabel = L.marker(midpoint, {
        icon: L.divIcon({
          className: 'distance-label',
          html: `
            <div class="distance-label-content">
              ${formatDistance(distance)}
            </div>
          `,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        }),
        interactive: false,
        zIndexOffset: 1001
      });

      return { polyline, distanceLabel };
    }

    return { polyline, distanceLabel: null };
  };

  // Handle map click for distance measurement
  const handleMapClick = (e) => {
    if (!isActive || !mapInstanceRef.current) return;

    const { lat, lng } = e.latlng;
    const newPoint = [lat, lng];

    if (!currentMeasurement) {
      // Start new measurement
      const startMarker = createDistanceMarker(newPoint, true);
      startMarker.addTo(mapInstanceRef.current);
      markersRef.current.push(startMarker);

      setCurrentMeasurement({
        points: [newPoint],
        markers: [startMarker],
        lines: [],
        totalDistance: 0
      });
    } else {
      // Add point to current measurement
      const lastPoint = currentMeasurement.points[currentMeasurement.points.length - 1];
      const segmentDistance = calculateDistance(lastPoint[0], lastPoint[1], lat, lng);
      
      // Create waypoint marker
      const wayPointMarker = createDistanceMarker(newPoint, false);
      wayPointMarker.addTo(mapInstanceRef.current);
      markersRef.current.push(wayPointMarker);

      // Create line segment
      const { polyline, distanceLabel } = createDistanceLine([lastPoint, newPoint], segmentDistance);
      polyline.addTo(mapInstanceRef.current);
      polylinesRef.current.push(polyline);
      
      if (distanceLabel) {
        distanceLabel.addTo(mapInstanceRef.current);
        markersRef.current.push(distanceLabel);
      }

      const newTotalDistance = currentMeasurement.totalDistance + segmentDistance;

      setCurrentMeasurement(prev => ({
        ...prev,
        points: [...prev.points, newPoint],
        markers: [...prev.markers, wayPointMarker],
        lines: [...prev.lines, { polyline, distanceLabel }],
        totalDistance: newTotalDistance
      }));

      setTotalDistance(newTotalDistance);
    }
  };

  // Finish current measurement
  const finishMeasurement = () => {
    if (currentMeasurement && currentMeasurement.points.length >= 2) {
      setMeasurements(prev => [...prev, currentMeasurement]);
      
      if (onMeasurementComplete) {
        onMeasurementComplete({
          points: currentMeasurement.points,
          totalDistance: currentMeasurement.totalDistance,
          formattedDistance: formatDistance(currentMeasurement.totalDistance)
        });
      }
    }
    
    setCurrentMeasurement(null);
  };

  // Clear all measurements
  const clearAllMeasurements = () => {
    if (!mapInstanceRef.current) return;

    // Remove all markers and lines
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    
    polylinesRef.current.forEach(polyline => {
      mapInstanceRef.current.removeLayer(polyline);
    });

    markersRef.current = [];
    polylinesRef.current = [];
    setMeasurements([]);
    setCurrentMeasurement(null);
    setTotalDistance(0);
  };

  // Setup map event listeners
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    if (isActive) {
      // Change cursor to crosshair
      map.getContainer().style.cursor = 'crosshair';
      
      // Add click event listener
      map.on('click', handleMapClick);
      
      // Disable default map interactions that might interfere
      map.doubleClickZoom.disable();
    } else {
      // Reset cursor
      map.getContainer().style.cursor = '';
      
      // Remove event listeners
      map.off('click', handleMapClick);
      
      // Re-enable map interactions
      map.doubleClickZoom.enable();
    }

    return () => {
      map.getContainer().style.cursor = '';
      map.off('click', handleMapClick);
      map.doubleClickZoom.enable();
    };
  }, [isActive, currentMeasurement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllMeasurements();
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="distance-tool-panel fixed top-10 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-[1000] min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M2 12h10"></path>
            <path d="M9 4v16"></path>
            <path d="M14 7l3 3-3 3"></path>
          </svg>
          Distance Measurement
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Instructions */}
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          {!currentMeasurement 
            ? "Click on the map to start measuring distance"
            : `Click to add waypoints. Total: ${formatDistance(totalDistance)}`
          }
        </div>

        {/* Current measurement info */}
        {currentMeasurement && (
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-600">Current measurement:</div>
            <div className="text-sm font-medium text-gray-800">
              {currentMeasurement.points.length} point(s)
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatDistance(totalDistance)}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {currentMeasurement && currentMeasurement.points.length >= 2 && (
            <button
              onClick={finishMeasurement}
              className="flex-1 bg-green-600 text-white text-xs py-2 px-3 rounded hover:bg-green-700 transition-colors"
            >
              Finish
            </button>
          )}
          
          <button
            onClick={clearAllMeasurements}
            className="flex-1 bg-red-600 text-white text-xs py-2 px-3 rounded hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Measurements history */}
        {measurements.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Previous Measurements:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {measurements.map((measurement, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                  <span>{measurement.points.length} points</span>
                  <span className="font-medium text-blue-600">
                    {formatDistance(measurement.totalDistance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistanceMeasurementTool;
