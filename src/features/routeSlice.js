import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk for fetching routes for user
export const fetchRouteListForUser = createAsyncThunk(
  "route/fetchRouteListForUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("clientId") || "6571";

      const apiUrl = `${API_BASE_URL}api/geofence/RouteListforUser?userid=${userid}`;

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
      console.error("RouteListForUser API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const routeSlice = createSlice({
  name: "route",
  initialState: {
    routes: [],
    loading: false,
    error: null,
    totalRoutes: 0,
    showRoutes: false, // ✅ Manual control - default false
    // Route filtering
    selectedRouteNames: [], // Array of selected route names
    routemap: [], // Filtered routes array
    routeFiltersApplied: false, // Flag to track if filters are applied
  },
  reducers: {
    clearRoutes: (state) => {
      state.routes = [];
      state.error = null;
      state.totalRoutes = 0;
      state.routemap = [];
      state.selectedRouteNames = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setTotalRoutes: (state, action) => {
      state.totalRoutes = action.payload;
    },
    // ✅ Manual control for showing routes
    setShowRoutes: (state, action) => {
      state.showRoutes = action.payload;
    },
    toggleShowRoutes: (state) => {
      state.showRoutes = !state.showRoutes;
    },
    // Route filtering reducers
    setSelectedRouteNames: (state, action) => {
      state.selectedRouteNames = action.payload;
      // ✅ Update routemap based on selected route names
      state.routemap = state.routes.filter(route => 
        action.payload.includes(route.routeName)
      );
    },
    applyRouteFilters: (state) => {
      // Filter routes based on selected route names
      state.routemap = state.routes.filter(route => 
        state.selectedRouteNames.includes(route.routeName)
      );
      state.routeFiltersApplied = true;
    },
    resetRouteFilters: (state) => {
      // Reset to show all routes
      state.routemap = [...state.routes];
      state.selectedRouteNames = state.routes.map(route => route.routeName);
      state.routeFiltersApplied = false;
    },
    // ✅ NEW: Initialize routemap with full data
    initializeRoutemap: (state) => {
      state.routemap = [...state.routes];
      state.selectedRouteNames = state.routes.map(route => route.routeName);
      state.routeFiltersApplied = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRouteListForUser cases
      .addCase(fetchRouteListForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteListForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
        state.totalRoutes = action.payload?.length || 0;
        
        // ✅ DON'T auto-set showRoutes to true
        // ✅ Initialize routemap and selectedRouteNames with all routes
        state.routemap = [...action.payload];
        state.selectedRouteNames = action.payload.map(route => route.routeName);
        state.routeFiltersApplied = false;
      })
      .addCase(fetchRouteListForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // ✅ Don't change showRoutes on error
        state.routemap = [];
        state.selectedRouteNames = [];
      });
  },
});

export const {
  clearRoutes,
  clearError,
  setTotalRoutes,
  setShowRoutes,
  toggleShowRoutes,
  setSelectedRouteNames,
  applyRouteFilters,
  resetRouteFilters,
  initializeRoutemap, // ✅ NEW EXPORT
} = routeSlice.actions;

// Selectors
export const selectShowRoutes = (state) => state.route.showRoutes;
export const selectRoutes = (state) => state.route.routes;
export const selectRoutesLoading = (state) => state.route.loading;
export const selectRoutesError = (state) => state.route.error;
export const selectRoutemap = (state) => state.route.routemap;
export const selectSelectedRouteNames = (state) => state.route.selectedRouteNames;
export const selectRouteFiltersApplied = (state) => state.route.routeFiltersApplied;

export default routeSlice.reducer;
