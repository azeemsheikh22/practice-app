import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { useSelector } from "react-redux";
import { selectShowRoutes } from "../../features/routeSlice";

const RouteManager = ({ mapInstanceRef, onRouteContextMenu }) => {
  const routeLayersRef = useRef({});
  const showRoutes = useSelector(selectShowRoutes);
  // Access filtered routemap in other components
  const { routemap } = useSelector((state) => state.route);

  // ✅ Correct route string parsing
  const parseRouteString = useCallback((routeString) => {
    if (!routeString) return [];

    try {
      const coordinates = routeString.split(",").map((coord) => coord.trim());
      const latLngs = [];

      for (let coord of coordinates) {
        const [latStr, lngStr] = coord.split(" ");
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          latLngs.push([lat, lng]);
        }
      }

      return latLngs;
    } catch (error) {
      console.error("Error parsing route string:", error);
      return [];
    }
  }, []);

  const createRoutePolyline = useCallback(
    (route, index) => {
      const coordinates = parseRouteString(route.routeString);
      if (coordinates.length < 2) return null;

      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
      const color = colors[index % colors.length];

      const polyline = L.polyline(coordinates, {
        color: color,
        weight: 4,
        opacity: 0.8,
        smoothFactor: 2,
        routeData: route,
        routeIndex: index,
        className: "route-polyline",
      });

      // ✅ Enhanced hover with route name display
      polyline.on("mouseover", function (e) {
        this.setStyle({ weight: 6, opacity: 1 });

        // Show floating route name
        if (mapInstanceRef.current) {
          const tooltip = L.tooltip({
            permanent: true,
            direction: "top",
            className: "route-hover-name",
          })
            .setContent(`🛣️ ${route.routeName}`)
            .setLatLng(e.latlng);

          this._hoverTooltip = tooltip;
          tooltip.addTo(mapInstanceRef.current);
        }
      });

      polyline.on("mouseout", function () {
        this.setStyle({ weight: 4, opacity: 0.8 });

        // Remove floating route name
        if (this._hoverTooltip && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(this._hoverTooltip);
          this._hoverTooltip = null;
        }
      });

      // Context menu still works
      polyline.on("contextmenu", function (e) {
        if (onRouteContextMenu && mapInstanceRef.current) {
          const { x, y } = e.containerPoint;
          const rect = mapInstanceRef.current
            .getContainer()
            .getBoundingClientRect();
          onRouteContextMenu(route, rect.left + x, rect.top + y);
        }
      });

      return polyline;
    },
    [parseRouteString, mapInstanceRef, onRouteContextMenu]
  );

  // ✅ UPDATED: createRouteMarkers with route name tooltips and CSS classes
  const createRouteMarkers = useCallback((route) => {
    const markers = [];
    try {
      const originCoords = route.originLatLng?.split(" ");
      const destCoords = route.destinationLatLng?.split(" ");

      // ✅ Origin marker with route name tooltip
      if (originCoords?.length === 2) {
        const lat = parseFloat(originCoords[0]);
        const lng = parseFloat(originCoords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            fillColor: "#10b981",
            color: "white",
            weight: 2,
            fillOpacity: 0.9,
            className: "route-origin-marker", // ✅ Add CSS class
          }).bindTooltip(
            `🚀 Origin - ${route.routeName}`, // ✅ Show route name with origin
            {
              direction: "top",
              permanent: false,
              sticky: true,
              className: "route-origin-tooltip", // ✅ Add CSS class
            }
          );
          markers.push(marker);
        }
      }

      // ✅ Destination marker with route name tooltip
      if (destCoords?.length === 2) {
        const lat = parseFloat(destCoords[0]);
        const lng = parseFloat(destCoords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            fillColor: "#ef4444",
            color: "white",
            weight: 2,
            fillOpacity: 0.9,
            className: "route-destination-marker", // ✅ Add CSS class
          }).bindTooltip(
            `🏁 Destination - ${route.routeName}`, // ✅ Show route name with destination
            {
              direction: "top",
              permanent: false,
              sticky: true,
              className: "route-destination-tooltip", // ✅ Add CSS class
            }
          );
          markers.push(marker);
        }
      }
    } catch (err) {
      console.error("Route marker error:", err);
    }

    return markers;
  }, []);

  const clearRoutes = useCallback(() => {
    if (!mapInstanceRef.current) return;
    Object.entries(routeLayersRef.current).forEach(([key, routeGroup]) => {
      if (
        routeGroup?.polyline &&
        mapInstanceRef.current.hasLayer(routeGroup.polyline)
      ) {
        mapInstanceRef.current.removeLayer(routeGroup.polyline);
      }

      if (Array.isArray(routeGroup?.markers)) {
        routeGroup.markers.forEach((marker) => {
          if (marker && mapInstanceRef.current.hasLayer(marker)) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
      }
    });

    routeLayersRef.current = {};
  }, [mapInstanceRef]);

  const addRoutesToMap = useCallback(() => {
    if (!mapInstanceRef.current || !routemap?.length) return;
    clearRoutes();
    routemap.forEach((route, index) => {
      const polyline = createRoutePolyline(route, index);
      const markers = createRouteMarkers(route);

      if (polyline) {
        polyline.addTo(mapInstanceRef.current);
      }

      markers.forEach((marker) => {
        if (marker) {
          marker.addTo(mapInstanceRef.current);
        }
      });

      // ✅ Use unique key instead of routeName
      routeLayersRef.current[`route-${index}`] = {
        polyline,
        markers,
        route,
      };
    });
  }, [
    routemap,
    mapInstanceRef,
    clearRoutes,
    createRoutePolyline,
    createRouteMarkers,
  ]);

  // ✅ Effect to watch toggle and routemap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (showRoutes && routemap?.length > 0) {
      addRoutesToMap();
    } else {
      clearRoutes();
    }
  }, [showRoutes, routemap, addRoutesToMap, clearRoutes, mapInstanceRef]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRoutes();
    };
  }, [clearRoutes]);

  return null;
};

export default RouteManager;
