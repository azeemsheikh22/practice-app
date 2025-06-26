export const generateVehiclePopupContent = (vehicleData) => {
  const {
    car_id,
    carname,
    movingstatus,
    speed,
    location,
    gps_time,
    mileage,
    latitude,
    longitude,
  } = vehicleData;


  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "moving":
        return "w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.3)]";
      case "idle":
        return "w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.3)]";
      default:
        return "w-2 h-2 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.3)]";
    }
  };

  return `
  <div class="font-inter p-0 w-[320px]">
    <div class="bg-gradient-to-br from-[#00263e] to-[#003d5c] p-2 rounded-t-md relative">
      <div style="display: flex; align-items: center;">
        <div class="${getStatusClass(movingstatus)} mr-2"></div>
        
        <div style="flex: 1;">
          <h3 class="text-[13px] font-semibold m-0 text-white leading-tight">
            ${carname}
          </h3>
          
          <div class="flex items-center mt-1 text-[10px] text-white/80">
            <span class="bg-white/15 text-white px-1 py-0.5 rounded-md text-[9px] font-medium uppercase">
              ${movingstatus || "Unknown"}
            </span>
            <span class="ml-2 text-[9px]">ID: ${car_id}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="p-2.5 bg-white">
      <!-- Address with multi-line support -->
      <div class="mb-2 flex items-start p-1.5 bg-slate-50 rounded border-l-2 border-emerald-500">
        <div class="flex-1 min-w-0">
          <div class="text-[10px] text-slate-800 font-medium leading-snug break-words whitespace-normal">
            ${location}
          </div>
        </div>
      </div>

      <!-- Speed and Mileage metrics -->
      <div class="grid ${movingstatus?.toLowerCase() === 'moving' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-2">
        ${movingstatus?.toLowerCase() === 'moving' ? `
          <div class="bg-slate-50 border border-slate-200 rounded-md p-1.5 flex items-center min-h-[32px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div class="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1.5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 2-5.5 9h11L12 2z"></path>
                <circle cx="17.5" cy="17.5" r="3.5"></circle>
                <circle cx="6.5" cy="17.5" r="3.5"></circle>
              </svg>
            </div>
            <div class="flex-1">
              <div id="speed-${car_id}" data-value="${speed}" class="text-xs font-semibold text-slate-800 leading-none transition-all duration-300">${speed}</div>
              <div class="text-[8px] text-slate-500 leading-none">KM/H</div>
            </div>
          </div>
        ` : ''}
        
        <div class="bg-slate-50 border border-slate-200 rounded-md p-1.5 flex items-center min-h-[32px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div class="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center mr-1.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
          </div>
          <div class="flex-1">
            <div id="mileage-${car_id}" data-value="${mileage}" class="text-xs font-semibold text-slate-800 leading-none transition-all duration-300">
              ${mileage ? mileage.toFixed(1) : "N/A"}
            </div>
            <div class="text-[8px] text-slate-500 leading-none">KM</div>
          </div>
        </div>
      </div>
      
      <!-- GPS Time section -->
      <div class="mb-2">
        <div class="flex items-center p-1.5 bg-slate-50 rounded mb-1 border-l-2 border-blue-500">
          <div class="bg-blue-500 w-3 h-3 rounded-sm flex items-center justify-center mr-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-[8px] text-slate-500">Last Update</div>
            <div id="gps-time-${car_id}" class="text-[10px] text-slate-800 font-medium">
              ${new Date(gps_time).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex gap-1.5 pt-1.5 border-t border-slate-200">
        <button onclick="window.zoomToVehicle(${car_id})" class="flex-1 border-none rounded bg-[#00263e] hover:bg-[#003d5c] px-2 py-1.5 text-[10px] font-medium cursor-pointer flex items-center justify-center transition-colors duration-200 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
            <path d="M11 8v6"></path>
            <path d="M8 11h6"></path>
          </svg>
          Zoom
        </button>
        
        <button onclick="window.openStreetView(${latitude}, ${longitude})" class="flex-1 border-none rounded bg-indigo-500 hover:bg-indigo-600 px-2 py-1.5 text-[10px] font-medium cursor-pointer flex items-center justify-center transition-colors duration-200 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
            <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"></path>
            <path d="M3.6 9h16.8"></path>
            <path d="M3.6 15h16.8"></path>
            <path d="M11.5 3a17 17 0 0 0 0 18"></path>
            <path d="M12.5 3a17 17 0 0 1 0 18"></path>
          </svg>
          Street
        </button>
      </div>
    </div>
  </div>
`;

};

// Selective update function with Tailwind classes for animations
export const updateVehiclePopupValues = (car_id, vehicleData) => {
  const speedElement = document.getElementById(`speed-${car_id}`);
  const mileageElement = document.getElementById(`mileage-${car_id}`);
  const gpsTimeElement = document.getElementById(`gps-time-${car_id}`);

  if (
    speedElement &&
    speedElement.dataset.value !== vehicleData.speed.toString()
  ) {
    speedElement.textContent = vehicleData.speed;
    speedElement.dataset.value = vehicleData.speed;
    speedElement.style.transform = "scale(1.1)";
    setTimeout(() => (speedElement.style.transform = "scale(1)"), 200);
  }

  if (
    mileageElement &&
    mileageElement.dataset.value !== vehicleData.mileage?.toString()
  ) {
    mileageElement.textContent = vehicleData.mileage
      ? vehicleData.mileage.toFixed(1)
      : "N/A";
    mileageElement.dataset.value = vehicleData.mileage;
    mileageElement.style.transform = "scale(1.1)";
    setTimeout(() => (mileageElement.style.transform = "scale(1)"), 200);
  }

  if (gpsTimeElement) {
    gpsTimeElement.textContent = new Date(
      vehicleData.gps_time
    ).toLocaleString();
  }
};
