import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vehicles: [],
  filteredVehicles: [],
  activeFilter: null,
  dashboardStats: [],
  loading: false,
  error: null,
  lastUpdated: null,
  totalVehicles: 0,
  // Complete static data structure
  dashboardData: [
    {
      name: "vehiclecard",
      data: [
        { id: "nr", label: "NR", subLabel: "Nr Vehicles", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 5 },
        { id: "c-speed", label: "City Speed", subLabel: "City Speed", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 4 },
        { id: "nh-speed", label: "NH Speed", subLabel: "National Highway Speed", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "mw-limit", label: "MW Limit", subLabel: "Motorway Limit", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "hills-speeding", label: "Hills Speeding", subLabel: "Hills Speeding", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "cd-duration", label: "CD Duration", subLabel: "CD Duration", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "dd-duration", label: "DD Duration", subLabel: "DD Duration", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "nrv-general", label: "NRV General", subLabel: "NRV General", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "nrv-mw", label: "NRV MW", subLabel: "NRV MW", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "nrv-city", label: "NRV City", subLabel: "NRV City", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "black-spot", label: "Black Spot", subLabel: "Black Spot", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "harsh-braking", label: "Harsh Braking", subLabel: "Harsh Braking", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "harsh-acceleration", label: "Harsh Acceleration", subLabel: "Harsh Acceleration", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "panic", label: "Panic", subLabel: "Panic", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },
        { id: "seat-belt", label: "Seat Belt", subLabel: "Seat Belt", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_m7viZ7c1MDy8Ld0U6eVQGcvaYX30ppKN0Q&s", count: 0 },

      ],
    },
    {
      name: "tableData",
      data: [
        {
          id: 1,
          group: "",
          vehicle: "C-2815",
          driver: "",
          status: "Stop",
          lastUpdate: "29 May 2025 12:08:26:000",
          speed: 0,
          location: "Khaskheli Oil Field BP Pakistan, Mirpur Bathoro-Kario Ghanwar Rd, Dist Badin",
          todayTravel: "05:02:28",
          cdDuration: "00:00:00",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: true },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "ev", value: true },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "City",
          sim: "+923342126706",
        },
        {
          id: 2,
          group: "",
          vehicle: "C-2500",
          driver: "",
          status: "Moving",
          lastUpdate: "29 May 2025 12:08:26:000",
          speed: 45,
          location: "Khaskheli Oil Field BP Pakistan, Mirpur Bathoro-Kario Ghanwar Rd, Dist Badin",
          todayTravel: "05:02:28",
          cdDuration: "00:00:00",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: true },
            { name: "hs", value: false },
            { name: "moving", value: true },
            { name: "stopped", value: false },
            { name: "idle", value: false },
          ],
          currentSpot: "City",
          sim: "+923342126706",
        },
        {
          id: 3,
          group: "Fleet A",
          vehicle: "C-9717",
          driver: "Ahmed Ali",
          status: "Stop",
          lastUpdate: "29 May 2025 12:43:57:000",
          speed: 0,
          location: "PSO Kiamari Terminal C Sharah Ghalib Shreen jinah Colony KHI",
          todayTravel: "02:42:52",
          cdDuration: "00:00:00",
          restDuration: "00:29:57",
          type: [
            { name: "nr", value: true },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "City",
          sim: "+923348576908",
        },
        {
          id: 4,
          group: "Fleet B",
          vehicle: "E-4083",
          driver: "Hassan Khan",
          status: "Stop",
          lastUpdate: "23 May 2025 10:00:12:000",
          speed: 0,
          location: "Shakoor & Co Limited Yard Qasim port Rd Karachi",
          todayTravel: "00:00:00",
          cdDuration: "00:00:00",
          restDuration: "00:00:11",
          type: [
            { name: "nr", value: true },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "City",
          sim: "+923342127018",
        },
        {
          id: 5,
          group: "Fleet C",
          vehicle: "JQ-0671-50KL",
          driver: "Usman Ahmed",
          status: "Stop",
          lastUpdate: "29 May 2025 12:52:20:000",
          speed: 0,
          location: "Askar Oil Bulk Terminal Lahore Rd Dera odan Shekhupura",
          todayTravel: "03:22:46",
          cdDuration: "00:00:00",
          restDuration: "00:31:04",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: true },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "City",
          sim: "+923307493543",
        },
        {
          id: 6,
          group: "Fleet D",
          vehicle: "JQ-0692-50KL",
          driver: "Ali Hassan",
          status: "Idle",
          lastUpdate: "29 May 2025 12:42:48:000",
          speed: 0,
          location: "Pak Grease Manufacturing Company Ltd, Shahrah-e-Ghalib, Kemari, khi",
          todayTravel: "01:37:53",
          cdDuration: "00:00:00",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: false },
            { name: "stopped", value: false },
            { name: "idle", value: true },
          ],
          currentSpot: "City",
          sim: "+923363246443",
        },
        {
          id: 7,
          group: "Fleet E",
          vehicle: "JQ-0770-50KL",
          driver: "Sara Khan",
          status: "Moving",
          lastUpdate: "29 May 2025 13:04:02:000",
          speed: 22,
          location: "Govt High School Haji Shah, Sadiqabad, G.T Rd N-5, Dist Attock",
          todayTravel: "02:51:16",
          cdDuration: "00:00:30",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: true },
            { name: "stopped", value: false },
            { name: "idle", value: false },
          ],
          currentSpot: "National Highway",
          sim: "+923326277112",
        },
        {
          id: 8,
          group: "Fleet F",
          vehicle: "JQ-0773",
          driver: "Fatima Ali",
          status: "Moving",
          lastUpdate: "29 May 2025 12:25:53:000",
          speed: 85,
          location: "Pa Council of Scientific & Indus Research, KHI-Hyd-Motrway Rd Hyd",
          todayTravel: "09:41:58",
          cdDuration: "00:11:23",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: true },
            { name: "moving", value: false },
            { name: "stopped", value: false },
            { name: "idle", value: false },
          ],
          currentSpot: "Motorway",
          sim: "+923303978427",
        },
        {
          id: 9,
          group: "Fleet G",
          vehicle: "JQ-0778-50KL",
          driver: "Zain Ahmed",
          status: "Stop",
          lastUpdate: "29 May 2025 12:50:16:000",
          speed: 0,
          location: "PSO Tariq Shinwari Trucking Sation, Babar Bund Super Hwy Near lucky Cement",
          todayTravel: "02:23:58",
          cdDuration: "00:00:00",
          restDuration: "00:05:24",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "Motorway",
          sim: "+923302005267",
        },
        {
          id: 10,
          group: "Fleet H",
          vehicle: "JQ-0833-50KL",
          driver: "Maria Khan",
          status: "Stop",
          lastUpdate: "29 May 2025 11:34:29:000",
          speed: 0,
          location: "Pakistan Hotel Khanewal (Rasch Rest Area) N-5, S-Kassi, Khanewal, Punjab, Pakistan",
          todayTravel: "05:02:50",
          cdDuration: "00:00:00",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: true },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "NA",
          sim: "+923302005260",
        },
        {
          id: 11,
          group: "Fleet I",
          vehicle: "MT-2001",
          driver: "Bilal Ahmed",
          status: "Stop",
          lastUpdate: "29 May 2025 14:30:00:000",
          speed: 0,
          location: "Workshop Garage, Industrial Area, Karachi",
          todayTravel: "00:00:00",
          cdDuration: "00:00:00",
          restDuration: "08:30:00",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: false },
            { name: "moving", value: false },
            { name: "stopped", value: true },
            { name: "idle", value: false },
          ],
          currentSpot: "Workshop",
          sim: "+923001234570",
        },
        {
          id: 12,
          group: "Fleet J",
          vehicle: "HS-3001",
          driver: "Kamran Ali",
          status: "Moving",
          lastUpdate: "29 May 2025 15:45:00:000",
          speed: 95,
          location: "Motorway M2, Lahore to Islamabad Route",
          todayTravel: "06:15:30",
          cdDuration: "02:30:00",
          restDuration: "00:00:00",
          type: [
            { name: "nr", value: false },
            { name: "c-speed", value: false },
            { name: "hs", value: true },
            { name: "moving", value: false },
            { name: "stopped", value: false },
            { name: "idle", value: false },
          ],
          currentSpot: "Motorway",
          sim: "+923001234571",
        },
      ],
    },
  ],
};

const liveDashboardSlice = createSlice({
  name: "liveDashboard",
  initialState,
  reducers: {
    initializeDashboard: (state) => {
      // Extract table data
      const tableDataSection = state.dashboardData.find(section => section.name === "tableData");
      if (tableDataSection && tableDataSection.data) {
        state.vehicles = tableDataSection.data;
        state.filteredVehicles = tableDataSection.data;
        state.totalVehicles = tableDataSection.data.length;
      }
      
      // Extract card data and update counts dynamically
      const cardDataSection = state.dashboardData.find(section => section.name === "vehiclecard");
      if (cardDataSection && cardDataSection.data) {
        // Update card counts based on actual vehicle data
        state.dashboardStats = updateCardCounts(cardDataSection.data, state.vehicles);
      }
      
      state.lastUpdated = new Date().toISOString();
    },
    

    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
      
      // Extract table data
      const tableDataSection = state.dashboardData.find(section => section.name === "tableData");
      if (tableDataSection) {
        state.vehicles = tableDataSection.data;
        state.filteredVehicles = tableDataSection.data;
        state.totalVehicles = tableDataSection.data.length;
      }
      
      // Extract card data
      const cardDataSection = state.dashboardData.find(section => section.name === "vehiclecard");
      if (cardDataSection) {
        state.dashboardStats = updateCardCounts(cardDataSection.data, state.vehicles);
      }
      
      state.lastUpdated = new Date().toISOString();
    },

    setVehicles: (state, action) => {
      // Update tableData section
      const tableDataIndex = state.dashboardData.findIndex(section => section.name === "tableData");
      if (tableDataIndex !== -1) {
        state.dashboardData[tableDataIndex].data = action.payload;
      }
      
      state.vehicles = action.payload;
      state.filteredVehicles = action.payload;
      state.totalVehicles = action.payload.length;
      state.lastUpdated = new Date().toISOString();
      
      // Update card counts dynamically
      const cardDataSection = state.dashboardData.find(section => section.name === "vehiclecard");
      if (cardDataSection) {
        state.dashboardStats = updateCardCounts(cardDataSection.data, action.payload);
      }
    },

    setActiveFilter: (state, action) => {
      const filterType = action.payload;
      state.activeFilter = filterType;
    
      if (!filterType) {
        state.filteredVehicles = state.vehicles;
      } else {
        // Filter vehicles based on type with safety checks
        state.filteredVehicles = state.vehicles.filter(vehicle => {
          // Check if vehicle has type array
          if (!vehicle.type || !Array.isArray(vehicle.type)) return false;
          
          return vehicle.type.some(t => {
            // Check if type object is valid
            if (!t || typeof t !== 'object') return false;
            return t.name === filterType && t.value === true;
          });
        });
      }
    },
    

    clearFilter: (state) => {
      state.activeFilter = null;
      state.filteredVehicles = state.vehicles;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    updateVehicleStatus: (state, action) => {
      const { vehicleId, newStatus } = action.payload;
      const vehicleIndex = state.vehicles.findIndex((v) => v.id === vehicleId);

      if (vehicleIndex !== -1) {
        state.vehicles[vehicleIndex] = {
          ...state.vehicles[vehicleIndex],
          ...newStatus,
        };
        
        // Update tableData section
        const tableDataIndex = state.dashboardData.findIndex(section => section.name === "tableData");
        if (tableDataIndex !== -1) {
          state.dashboardData[tableDataIndex].data = state.vehicles;
        }
        
        // Update card counts
        const cardDataSection = state.dashboardData.find(section => section.name === "vehiclecard");
        if (cardDataSection) {
          state.dashboardStats = updateCardCounts(cardDataSection.data, state.vehicles);
        }

        // Update filtered vehicles if filter is active
        if (state.activeFilter) {
          state.filteredVehicles = state.vehicles.filter(vehicle => {
            return vehicle.type?.some(t => t.name === state.activeFilter && t.value === true);
          });
        } else {
          state.filteredVehicles = state.vehicles;
        }
      }
    },

    // New action to update card data
    updateCardData: (state, action) => {
      const cardDataIndex = state.dashboardData.findIndex(section => section.name === "vehiclecard");
      if (cardDataIndex !== -1) {
        state.dashboardData[cardDataIndex].data = action.payload;
        state.dashboardStats = updateCardCounts(action.payload, state.vehicles);
      }
    },

    // New action to add new card
    addNewCard: (state, action) => {
      const cardDataIndex = state.dashboardData.findIndex(section => section.name === "vehiclecard");
      if (cardDataIndex !== -1) {
        state.dashboardData[cardDataIndex].data.push(action.payload);
        state.dashboardStats = updateCardCounts(state.dashboardData[cardDataIndex].data, state.vehicles);
      }
    },
  },
});

// Helper function to update card counts based on vehicle data
const updateCardCounts = (cards, vehicles) => {
  return cards.map(card => {
    const count = vehicles.filter(vehicle => 
      vehicle.type?.some(t => t.name === card.id && t.value === true)
    ).length;
    
    return {
      ...card,
      count: count
    };
  });
};

export const {
  initializeDashboard,
  setDashboardData,
  setVehicles,
  setActiveFilter,
  clearFilter,
  setLoading,
  setError,
  updateVehicleStatus,
  updateCardData,
  addNewCard,
} = liveDashboardSlice.actions;

export default liveDashboardSlice.reducer;

