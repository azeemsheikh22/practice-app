import popup from "../../assets/popup.png"

export const generateVehiclePopupContent = (vehicleData) => {
  const {
    car_id,
    carname = "Unknown Vehicle",
    movingstatus,
    speed = 0,
    gps_time,
    location = "Unknown Address",
    latitude,
    longitude,
    duration,
    voltage,
  } = vehicleData;

  // ✅ Static data for missing fields
  const drivername = "Unknown Driver";

  // ✅ CONDITIONAL SPEED: Only show for moving vehicles
  const isMoving = movingstatus?.toLowerCase() === "moving";
  const speedDisplay = isMoving ? `Speed: ${speed} km/h` : `Status: ${movingstatus || "Unknown"}`;

  // ✅ Format voltage (show only the second value if comma-separated, else show as is)
  let voltageDisplay = "-";
  if (typeof voltage === "string" && voltage.includes(",")) {
    const parts = voltage.split(",");
    voltageDisplay = parts[1] ? `${parts[1]} V` : `${parts[0]} V`;
  } else if (voltage !== undefined && voltage !== null && voltage !== "N/A") {
    voltageDisplay = `${voltage} V`;
  }

  // ✅ Use duration from data, fallback to old calculation if missing
  const durationDisplay = duration && duration !== "N/A" ? duration : formatDuration(gps_time);

  return `
    <div class="popup-container">
      <div class="popup-top">
        <div class="popup-icon">
          <img src="${popup}" width="35" />
        </div>
        <div class="popup-title-block">
          <div class="popup-title">${carname}</div>
          <div class="popup-subtitle">${drivername}</div>
        </div>
      </div>
      <div class="popup-meta">
        <div class="popup-meta-left">${durationDisplay}</div>
        <div class="popup-meta-right ${isMoving ? 'speed-active' : 'status-inactive'}">${speedDisplay}</div>
      </div>
      <div class="popup-info"><strong>Last update:</strong> ${formatDateTime(gps_time)}</div>
      <div class="popup-info">${location}</div>
      <div class="popup-info"><strong>Voltage:</strong> ${voltageDisplay}</div>
      <div class="popup-buttons">
        <button class="popup-btn" onclick="window.zoomToVehicle && window.zoomToVehicle(${car_id})">ZOOM TO</button>
        <button class="popup-btn" onclick="window.openStreetView && window.openStreetView(${latitude}, ${longitude})">STREET VIEW</button>
      </div>
    </div>
  `;
};

// ✅ Helper functions

// Show both date and time in a nice format
function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  } catch (error) {
    return "Invalid date/time";
  }
}

function formatDuration(gps_time) {
  if (!gps_time) return "00:00";
  try {
    const now = new Date();
    const gps = new Date(gps_time);
    const diffMs = now - gps;
    if (diffMs < 0) return "00:00";
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } catch (error) {
    return "00:00";
  }
}

// ✅ UPDATED: Conditional update function
export const updateVehiclePopupValues = (car_id, vehicleData) => {
  try {
    const isMoving = vehicleData.movingstatus?.toLowerCase() === "moving";
    
    // Update speed/status conditionally
    const speedElement = document.querySelector('.popup-meta-right');
    if (speedElement) {
      if (isMoving) {
        speedElement.textContent = `Speed: ${vehicleData.speed || 0} km/h`;
        speedElement.className = 'popup-meta-right speed-active';
      } else {
        speedElement.textContent = `Status: ${vehicleData.movingstatus || "Unknown"}`;
        speedElement.className = 'popup-meta-right status-inactive';
      }
    }

    // Update last update time
    const lastUpdateElement = document.querySelector('.popup-info');
    if (lastUpdateElement && lastUpdateElement.innerHTML.includes('Last update:')) {
      lastUpdateElement.innerHTML = `<strong>Last update:</strong> ${formatTime(vehicleData.gps_time)}`;
    }

    // Update duration
    const durationElement = document.querySelector('.popup-meta-left');
    if (durationElement) {
      durationElement.textContent = formatDuration(vehicleData.gps_time);
    }

    // Update location
    const locationElements = document.querySelectorAll('.popup-info');
    if (locationElements.length > 1) {
      locationElements[1].textContent = vehicleData.location || "Unknown Address";
    }

  } catch (error) {
    console.error("Error updating popup values:", error);
  }
};

// ✅ Setup global functions for buttons
if (typeof window !== 'undefined') {
  window.zoomToVehicle = (vehicleId) => {
    console.log(`Zooming to vehicle: ${vehicleId}`);
  };

  window.openStreetView = (lat, lng) => {
    if (lat && lng) {
      const streetViewUrl = `https://www.google.com/maps/@${lat},${lng},3a,75y,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i13312!8i6656`;
      window.open(streetViewUrl, '_blank');
    }
  };
}
