import L from "leaflet";
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";

/**
 * Creates a custom vehicle icon based on its status and heading
 * @param {string} status - Vehicle status (moving, idle, stop)
 * @param {number} head - Vehicle heading in degrees
 * @returns {L.DivIcon} - Leaflet div icon for the vehicle
 */
export const createVehicleIcon = (status, head = 0) => {
  let iconUrl;
  switch (status?.toLowerCase()) {
    case "moving":
      iconUrl = movingIcon;
      break;
    case "idle":
      iconUrl = idleIcon;
      break;
    case "stop":
    default:
      iconUrl = stoppedIcon;
      break;
  }

  const baseRotation = -140; // rotation offset

  return L.divIcon({
    className: "",
    html: `
      <div style="transform: rotate(${
        head + baseRotation
      }deg); transition: transform 0.3s ease;">
        <img src="${iconUrl}" style="width: 28px; height: 28px; transform-origin: center center;" />
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

/**
 * Adds rotation capability to Leaflet markers
 * Should be called once to extend Leaflet's functionality
 */
export const extendMarkerWithRotation = () => {
  // Smooth movement and rotation plugin
  L.Marker.include({
    slideTo: function (newLatLng, options) {
      options = options || {};
      const duration = options.duration || 1000;
      const startLatLng = this.getLatLng();
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const lat = startLatLng.lat + (newLatLng[0] - startLatLng.lat) * progress;
        const lng = startLatLng.lng + (newLatLng[1] - startLatLng.lng) * progress;
        this.setLatLng([lat, lng]);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
      return this;
    },

    setRotationAngle: function (angle) {
      const icon = this._icon;
      if (!icon) return this;
      icon.style.transform = `${
        icon.style.transform?.replace(/rotate\(.*?deg\)/, "") || ""
      } rotate(${angle}deg)`;
      return this;
    },
  });
};

/**
 * Validates if coordinates are valid numbers
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Whether coordinates are valid
 */
export const isValidCoordinate = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  !isNaN(lat) &&
  !isNaN(lng);
