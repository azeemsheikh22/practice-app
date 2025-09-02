import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Async thunk for fetching replay trips
export const fetchReplayTrips = createAsyncThunk(
  "replay/fetchReplayTrips",
  async (
    { carId, datefrom, dateto, fromTime, toTime },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const fromT = fromTime || "00:00:00";
      const toT = toTime || "23:59:59";
      const apiUrl = `${API_BASE_URL}api/replay/ReplayTrips?carid=${carId}&datefrom=${datefrom} ${fromT}&dateto=${dateto} ${toT}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("ReplayTrips API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReplayData = createAsyncThunk(
  "replay/fetchReplayData",
  async (
    { carId, datefrom, dateto, fromTime, toTime },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const fromT = fromTime || "00:00:00";
      const toT = toTime || "23:59:59";
      const apiUrl = `${API_BASE_URL}api/replay/replay?carid=${carId}&datefrom=${datefrom} ${fromT}&dateto=${dateto} ${toT}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Replay API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReplayGeofenceForUser = createAsyncThunk(
  "replay/fetchReplayGeofenceForUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("clientId");
      const apiUrl = `${API_BASE_URL}api/Geofence/GeofenceForUser?userid=${userid}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("GeofenceForUser API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const replaySlice = createSlice({
  name: "replay",
  initialState: {
    replayData: null,
    loading: false,
    error: null,
    // Trips state
    replayTrips: null,
    tripsLoading: false,
    tripsError: null,
    // Geofence state
    geofences: null,
    showGeofences: null,
    geofencesLoading: false,
    geofencesError: null,
    // Category state
    categories: null,
    showCategories: null,
    filters: {
      displayMode: "line", // 'line' | 'marker' | 'all'
      stopDuration: "all",
      showAlarms: true,
      showStops: true,
      showSummary: false,
    },
    showShapes: false, // for geofence shapes toggle
    currentReplayIndex: null, // index of the currently animated point
    isReplayPaused: true, // replay pause state
    showGeofenceOnMap: false, // Add to Map menu ke liye
  },
  reducers: {
    setFilters: (state, action) => {
      // Remove followVehicle if present in payload
      const { followVehicle, ...rest } = action.payload || {};
      state.filters = { ...state.filters, ...rest };
    },
    setCurrentReplayIndex: (state, action) => {
      state.currentReplayIndex = action.payload;
    },
    setReplayPaused: (state, action) => {
      state.isReplayPaused = action.payload;
    },
    setShowShapes: (state, action) => {
      state.showShapes = action.payload;
    },
    setShowGeofences: (state, action) => {
      // Directly set showGeofences to the provided array
      state.showGeofences = action.payload;
    },
    setShowCategories: (state, action) => {
      // Directly set showCategories to the provided array
      state.showCategories = action.payload;
    },
    setShowGeofenceOnMap: (state, action) => {
      state.showGeofenceOnMap = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Replay Data
      .addCase(fetchReplayData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReplayData.fulfilled, (state, action) => {
        state.loading = false;
        state.replayData = action.payload;
        state.error = null;
      })
      .addCase(fetchReplayData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch replay data";
        state.replayData = null;
      })
      // Replay Trips
      .addCase(fetchReplayTrips.pending, (state) => {
        state.tripsLoading = true;
        state.tripsError = null;
      })
      .addCase(fetchReplayTrips.fulfilled, (state, action) => {
        state.tripsLoading = false;
        state.replayTrips = action.payload;
        state.tripsError = null;
      })
      .addCase(fetchReplayTrips.rejected, (state, action) => {
        state.tripsLoading = false;
        state.tripsError = action.payload || "Failed to fetch replay trips";
        state.replayTrips = null;
      })
      // Geofence For User
      .addCase(fetchReplayGeofenceForUser.pending, (state) => {
        state.geofencesLoading = true;
        state.geofencesError = null;
      })
      .addCase(fetchReplayGeofenceForUser.fulfilled, (state, action) => {
        state.geofencesLoading = false;
        const filtered = Array.isArray(action.payload)
          ? action.payload.filter(g => g.chkShowOnMap === 'true')
          : [];
        state.geofences = filtered;
        // Sirf tab set karo jab showGeofences empty hai
        if (!state.showGeofences || state.showGeofences.length === 0) {
          state.showGeofences = filtered;
        }
        
        // Extract unique categories from geofences
        const uniqueCategories = Array.from(
          new Set(filtered.map(g => g.CategoryId))
        ).map(catId => {
          const geofence = filtered.find(g => g.CategoryId === catId);
          return {
            id: catId,
            Categoryname: geofence?.Categoryname || 'Uncategorized'
          };
        }).filter(cat => cat.id); // Remove empty category IDs
        
        state.categories = uniqueCategories;
        // Initialize showCategories if empty
        if (!state.showCategories || state.showCategories.length === 0) {
          state.showCategories = uniqueCategories;
        }
        
        state.geofencesError = null;
      })
      .addCase(fetchReplayGeofenceForUser.rejected, (state, action) => {
        state.geofencesLoading = false;
        state.geofencesError = action.payload || "Failed to fetch geofences";
        state.geofences = null;
      });
  },
});

export const { setFilters, setCurrentReplayIndex, setReplayPaused, setShowShapes, setShowGeofences, setShowCategories, setShowGeofenceOnMap } =
  replaySlice.actions;
export const selectShowShapes = (state) => state.replay.showShapes;
export default replaySlice.reducer;
export const selectReplayData = (state) => state.replay.replayData;
export const selectReplayLoading = (state) => state.replay.loading;
export const selectReplayError = (state) => state.replay.error;
export const selectReplayFilters = (state) => state.replay.filters;
export const selectReplayPaused = (state) => state.replay.isReplayPaused;
export const selectCurrentReplayIndex = (state) =>
  state.replay.currentReplayIndex;
// Trips selectors
export const selectReplayTrips = (state) => state.replay.replayTrips;
export const selectReplayTripsLoading = (state) => state.replay.tripsLoading;
export const selectReplayTripsError = (state) => state.replay.tripsError;

const userid = localStorage.getItem("clientId");
