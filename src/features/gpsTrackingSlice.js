import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import * as signalR from "@microsoft/signalr";


// Variables for throttling and connection state
let lastCarDataUpdateTime = 0;
let pendingCarDataUpdates = [];
let carDataUpdateTimer = null;

// Add these variables for saving connection state
let savedUserId = null;
let savedUserTypeId = null;
let savedVehicleIds = [];
let savedScope = null;

// Initial state
const initialState = {
  connection: null,
  connectionStatus: "disconnected",
  carData: [],
  availableVehicles: [],
  rawVehicleList: [], // Raw data state
  selectedVehicles: [],
  movingStatusFilter: "all", // Filter by moving status
  error: null,
  loading: false,
  dataThrottleTime: 1000, // Default throttle time in ms
};

// Function to process pending car data updates
function processPendingCarData(dispatch, getState) {
  if (pendingCarDataUpdates.length > 0) {
    // Skip processing if no vehicles are selected
    if (getState().gpsTracking.selectedVehicles.length === 0) {
      pendingCarDataUpdates = [];
      carDataUpdateTimer = null;
      return;
    }

    // Get the latest state of each vehicle by car_id
    const latestCarData = {};
    pendingCarDataUpdates.forEach((car) => {
      if (car && car.car_id) {
        latestCarData[car.car_id] = car;
      }
    });

    // Convert back to array with only the latest data for each vehicle
    const uniqueCarData = Object.values(latestCarData);

    // Dispatch the update with deduplicated data
    if (uniqueCarData.length > 0) {
      dispatch(updateCarData(uniqueCarData));
    }

    // Clear pending updates
    pendingCarDataUpdates = [];
    lastCarDataUpdateTime = Date.now();
  }

  // Clear the timer
  carDataUpdateTimer = null;
}

export const initializeConnection = createAsyncThunk(
  "gpsTracking/initializeConnection",
  async (scope = 3, { dispatch, getState }) => {
    const { connection, connectionStatus } = getState().gpsTracking;

    // If already connected, just return the existing connection
    if (connection && connectionStatus === "connected") {
      return connection;
    }
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    // Save connection parameters globally
    const clientId = parseInt(localStorage.getItem("clientId"), 10) || 1;
    const userTypeID = parseInt(localStorage.getItem("userTypeId"), 10) || 1;
    
    // Store values globally for reconnection
    savedUserId = clientId;
    savedUserTypeId = userTypeID;
    savedScope = scope;
    window.savedUserId = clientId;
    window.savedUserTypeId = userTypeID;
    window.savedVehicleIds = getState().gpsTracking.selectedVehicles || [];

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${
          import.meta.env.VITE_API_BASE_URL
        }gpstracking?access_token=${encodeURIComponent(token)}`,
        {
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.LongPolling,
        }
      )
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.warn(
            `🔄 Reconnecting... Attempt: ${retryContext.previousRetryCount + 1}`
          );
          return Math.min(5000, (retryContext.previousRetryCount + 1) * 1000);
        },
      })
      .withKeepAliveInterval(60 * 1000)   // 1 minute
      .withServerTimeout(120 * 1000)      // 2 minutes
      
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await newConnection.start();
      console.log("✅ Connected to SignalR");

      // Connection quality monitoring
      newConnection.onreconnecting((error) => {
        console.warn("Connection lost, reconnecting...", error);
        dispatch(setConnectionStatus("reconnecting"));
      });

      // Optimized reconnection handler
      newConnection.onreconnected(async (newConnectionId) => {
        console.log("🔁 Reconnected:", newConnectionId);
        dispatch(setConnectionStatus("connected"));
        
        try {
          // ✅ Use saved values for resubscription
          await newConnection.invoke("SubscribeToUpdates", window.savedUserId, window.savedUserTypeId);
          
          // Re-request vehicle list with saved scope
          const onlyRoot = window.savedUserTypeId === 1 ? 1 : 0;
          await newConnection.invoke("RequestVehicleList", savedScope, onlyRoot);
          
          // Restore vehicle filter if vehicles were selected
          if (window.savedVehicleIds && window.savedVehicleIds.length > 0) {
            await newConnection.invoke("UpdateVehicleFilter", window.savedVehicleIds);
            console.log("🔄 Restored vehicle filter:", window.savedVehicleIds.length, "vehicles");
          }
        } catch (error) {
          console.error("❌ Error during reconnection setup:", error);
        }
      });

      // Rest of your existing event handlers...
      newConnection.on("ReceiveVehicleList", (vehicles) => {
        if (Array.isArray(vehicles) && vehicles.length > 0) {
          dispatch(setRawVehicleList(vehicles));
          dispatch(updateAvailableVehicles(vehicles));
        }
      });
      // Optimized ReceiveCarData handler with throttling
      newConnection.on("ReceiveCarData", (data) => {
        console.log("vehicle on map", data.length);

        // Skip processing if no vehicles are selected
        if (getState().gpsTracking.selectedVehicles.length === 0) {
          return;
        }

        const now = Date.now();
        const throttleTime = getState().gpsTracking.dataThrottleTime || 1000;

        // Process data to ensure it's in array format
        const carDataArray = Array.isArray(data)
          ? data
          : data && data.car_id
          ? [data]
          : [];

        if (carDataArray.length === 0) {
          return;
        }

        // Queue the data for processing
        pendingCarDataUpdates = [...pendingCarDataUpdates, ...carDataArray];

        // If we've recently processed data, don't process again immediately
        if (now - lastCarDataUpdateTime < throttleTime) {
          // If no timer is set, schedule one
          if (!carDataUpdateTimer) {
            carDataUpdateTimer = setTimeout(() => {
              processPendingCarData(dispatch, getState);
            }, throttleTime - (now - lastCarDataUpdateTime));
          }
          return;
        }

        // Process immediately if no recent update
        processPendingCarData(dispatch, getState);
      });

      newConnection.on("ReceiveMessage", (message) => {
        // console.log("📩 Server Message:", message);
      });

      newConnection.on("FilterUpdated", (vehicleIds) => {
        console.log(
          `✅ Server confirmed filter update: ${vehicleIds.join(", ")}`
        );
      });

      // Now invoke methods
      const clientId = parseInt(localStorage.getItem("clientId"), 10) || 1;
      const userTypeID = parseInt(localStorage.getItem("userTypeId"), 10) || 1;

      if (newConnection.state === signalR.HubConnectionState.Connected) {
        await newConnection.invoke("SubscribeToUpdates", clientId, userTypeID);

        const onlyRoot = userTypeID === 1 ? 1 : 0;
        await newConnection.invoke("RequestVehicleList", scope, onlyRoot);
      }

      return newConnection;
    } catch (error) {
      console.error("❌ Connection failed:", error);
      throw error;
    }
  }
);

export const requestVehicleListWithScope = createAsyncThunk(
  "gpsTracking/requestVehicleListWithScope",
  async (scope, { getState }) => {
    const { connection } = getState().gpsTracking;
    const userTypeID = parseInt(localStorage.getItem("userTypeId"), 10) || 1;
    const onlyRoot = userTypeID === 1 ? 1 : 0;

    if (
      connection &&
      connection.state === signalR.HubConnectionState.Connected
    ) {
      await connection.invoke("RequestVehicleList", scope, onlyRoot);
      return scope;
    } else {
      throw new Error("Connection not established");
    }
  }
);

export const updateVehicleFilter = createAsyncThunk(
  "gpsTracking/updateVehicleFilter",
  async (vehicleIds, { getState }) => {
    const { connection } = getState().gpsTracking;

    // Update saved vehicle IDs for reconnection
    window.savedVehicleIds = vehicleIds || [];

    if (
      connection &&
      connection.state === signalR.HubConnectionState.Connected
    ) {
      console.log("Updating vehicle filter:", vehicleIds.length);
      await connection.invoke("UpdateVehicleFilter", vehicleIds);
      return vehicleIds;
    } else {
      throw new Error("Connection not established");
    }
  }
);


// Slice
const gpsTrackingSlice = createSlice({
  name: "gpsTracking",
  initialState,
  reducers: {
    // Optimized updateCarData reducer
    updateCarData: (state, action) => {
      // Skip processing if no vehicles are selected
      if (state.selectedVehicles.length === 0) {
        state.carData = [];
        return;
      }

      // Convert all IDs to strings for consistent comparison
      const selectedVehiclesSet = new Set(
        state.selectedVehicles.map((id) => String(id))
      );

      // Filter using string comparison for consistency
      let filteredData = action.payload.filter(
        (car) =>
          car && car.car_id && selectedVehiclesSet.has(String(car.car_id))
      );

      // Then apply moving status filter if needed
      if (state.movingStatusFilter !== "all") {
        filteredData = filteredData.filter(
          (car) => car.movingstatus === state.movingStatusFilter
        );
      }

      // Update state with filtered data
      state.carData = filteredData;
    },

    updateAvailableVehicles: (state, action) => {
      const newVehicles = action.payload;

      // Skip processing if no new vehicles
      if (!Array.isArray(newVehicles) || newVehicles.length === 0) {
        return;
      }

      // Apply moving status filter to new vehicles if needed
      const filteredNewVehicles =
        state.movingStatusFilter === "all"
          ? newVehicles
          : newVehicles.filter(
              (v) => v.movingstatus === state.movingStatusFilter
            );

      // Use Map for efficient deduplication
      const vehicleMap = new Map();

      // First add existing vehicles to map
      state.availableVehicles.forEach((vehicle) => {
        if (vehicle && vehicle.car_id) {
          vehicleMap.set(String(vehicle.car_id), vehicle);
        }
      });

      // Then update with new vehicles
      filteredNewVehicles.forEach((vehicle) => {
        if (vehicle && vehicle.car_id) {
          vehicleMap.set(String(vehicle.car_id), vehicle);
        }
      });

      // Convert map back to array
      state.availableVehicles = Array.from(vehicleMap.values());
    },

    setRawVehicleList: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.rawVehicleList = action.payload;
      }
    },

    setSelectedVehicles: (state, action) => {
      state.selectedVehicles = action.payload;

      // If no vehicles selected, clear car data
      if (!action.payload || action.payload.length === 0) {
        state.carData = [];
      }
    },

    addSelectedVehicle: (state, action) => {
      if (action.payload && !state.selectedVehicles.includes(action.payload)) {
        state.selectedVehicles.push(action.payload);
      }
    },

    removeSelectedVehicle: (state, action) => {
      state.selectedVehicles = state.selectedVehicles.filter(
        (id) => id !== action.payload
      );

      // If all vehicles removed, clear car data
      if (state.selectedVehicles.length === 0) {
        state.carData = [];
      }
    },

    clearConnection: (state) => {
      if (state.connection) {
        state.connection
          .stop()
          .catch((err) => console.error("Error stopping connection:", err));
      }
      state.connection = null;
      state.connectionStatus = "disconnected";
    },

    clearRawVehicleList: (state) => {
      state.rawVehicleList = [];
    },

    setMovingStatusFilter: (state, action) => {
      state.movingStatusFilter = action.payload;

      // If we already have car data, filter it immediately
      if (state.rawVehicleList.length > 0) {
        if (state.movingStatusFilter === "all") {
          // No filtering needed
          state.availableVehicles = state.rawVehicleList;
        } else {
          // Filter by moving status
          state.availableVehicles = state.rawVehicleList.filter(
            (vehicle) => vehicle.movingstatus === state.movingStatusFilter
          );
        }
      }

      // Also update carData based on the new filter and selected vehicles
      if (state.selectedVehicles.length > 0) {
        // Convert all IDs to strings for consistent comparison
        const selectedVehiclesSet = new Set(
          state.selectedVehicles.map((id) => String(id))
        );

        if (state.movingStatusFilter === "all") {
          state.carData = state.carData.filter(
            (car) =>
              car && car.car_id && selectedVehiclesSet.has(String(car.car_id))
          );
        } else {
          state.carData = state.carData.filter(
            (car) =>
              car &&
              car.car_id &&
              selectedVehiclesSet.has(String(car.car_id)) &&
              car.movingstatus === state.movingStatusFilter
          );
        }
      } else {
        state.carData = [];
      }
    },

    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(initializeConnection.pending, (state) => {
        state.connectionStatus = "connecting";
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeConnection.fulfilled, (state, action) => {
        state.connection = action.payload;
        state.connectionStatus = "connected";
        state.loading = false;
      })
      .addCase(initializeConnection.rejected, (state, action) => {
        state.connectionStatus = "error";
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(updateVehicleFilter.fulfilled, (state, action) => {
        state.selectedVehicles = action.payload;

        // Clear car data if no vehicles selected
        if (!action.payload || action.payload.length === 0) {
          state.carData = [];
        } else {
          // If we have raw data, immediately filter it for the selected vehicles
          if (state.rawVehicleList.length > 0) {
            const selectedVehiclesSet = new Set(
              action.payload.map((id) => String(id))
            );

            // Filter raw data for immediate display
            let filteredData = state.rawVehicleList.filter(
              (car) =>
                car && car.car_id && selectedVehiclesSet.has(String(car.car_id))
            );

            // Apply moving status filter if needed
            if (state.movingStatusFilter !== "all") {
              filteredData = filteredData.filter(
                (car) => car.movingstatus === state.movingStatusFilter
              );
            }

            // Update car data with filtered results
            state.carData = filteredData;
          }
        }
      });
  },
});

// Export actions
export const {
  updateCarData,
  updateAvailableVehicles,
  setRawVehicleList,
  setSelectedVehicles,
  clearRawVehicleList,
  addSelectedVehicle,
  removeSelectedVehicle,
  clearConnection,
  setMovingStatusFilter,
  setConnectionStatus,
} = gpsTrackingSlice.actions;

// Export selectors
export const selectCarData = (state) => state.gpsTracking.carData;
export const selectAvailableVehicles = (state) =>
  state.gpsTracking.availableVehicles;
export const selectRawVehicleList = (state) => state.gpsTracking.rawVehicleList;
export const selectSelectedVehicles = (state) =>
  state.gpsTracking.selectedVehicles;
export const selectConnectionStatus = (state) =>
  state.gpsTracking.connectionStatus;
export const selectMovingStatusFilter = (state) =>
  state.gpsTracking.movingStatusFilter;

// Add a memoized selector for filtered car data
export const selectFilteredCarData = createSelector(
  [selectCarData, selectSelectedVehicles, selectMovingStatusFilter],
  (carData, selectedVehicles, movingStatusFilter) => {
    // If no vehicles selected, return empty array
    if (selectedVehicles.length === 0) return [];

    // Create a Set for faster lookups
    const selectedVehiclesSet = new Set(
      selectedVehicles.map((id) => String(id))
    );

    // Filter by selected vehicles
    let filteredData = carData.filter(
      (car) => car && car.car_id && selectedVehiclesSet.has(String(car.car_id))
    );

    // Apply moving status filter if needed
    if (movingStatusFilter !== "all") {
      filteredData = filteredData.filter(
        (car) => car.movingstatus === movingStatusFilter
      );
    }

    return filteredData;
  }
);

export default gpsTrackingSlice.reducer;
