
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

      const response = await fetch(apiUrl,{
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

// Async thunk for fetching route plan list
export const fetchRoutePlanList = createAsyncThunk(
  "route/fetchRoutePlanList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const usertype = localStorage.getItem("userTypeId");
      const userid = localStorage.getItem("clientId");

      const apiUrl = `${API_BASE_URL}api/geofence/RoutePlanList?UserId=${userid}&usertype=${usertype}`;


      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try alternative endpoint if this fails
        if (response.status === 404) {
          const altApiUrl = `${API_BASE_URL}api/geofence/RoutePlanList?UserId=${userid}&usertype=${usertype}`;
          const altResponse = await fetch(altApiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (!altResponse.ok) {
            throw new Error(`HTTP error! status: ${response.status} (original), ${altResponse.status} (alternative)`);
          }
          
          const altData = await altResponse.json();

          return altData;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("RoutePlanList API Error:", error);
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
    currentRoute: null, // Add this for current route being created
    routeCalculationData: null, // Add this for route calculation results
    searchQuery: "", // <-- Add search query to state
    // Route Plan List
    routePlans: [],
    routePlansLoading: false,
    routePlansError: null,
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
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
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
    // New reducers for route creation
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload;
    },
    setRouteCalculationData: (state, action) => {
      state.routeCalculationData = action.payload;
    },
    clearCurrentRoute: (state) => {
      state.currentRoute = null;
      state.routeCalculationData = null;
    },
    setRouteWaypoints: (state, action) => {
      if (state.currentRoute) {
        state.currentRoute.waypoints = action.payload;
      }
    },
    
    updateRouteCalculationData: (state, action) => {
      state.routeCalculationData = {
        ...state.routeCalculationData,
        ...action.payload
      };
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
      })
      // fetchRoutePlanList cases
      .addCase(fetchRoutePlanList.pending, (state) => {
        state.routePlansLoading = true;
        state.routePlansError = null;
      })
      .addCase(fetchRoutePlanList.fulfilled, (state, action) => {
        state.routePlansLoading = false;
        state.routePlans = action.payload;
      })
      .addCase(fetchRoutePlanList.rejected, (state, action) => {
        state.routePlansLoading = false;
        state.routePlansError = action.payload;
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
  initializeRoutemap,
  setCurrentRoute,
  setRouteCalculationData,
  clearCurrentRoute,
  setRouteWaypoints,
  updateRouteCalculationData,
  setSearchQuery,
} = routeSlice.actions;

// Selectors
export const selectShowRoutes = (state) => state.route.showRoutes;
export const selectRoutes = (state) => state.route.routes;
export const selectRoutesLoading = (state) => state.route.loading;
export const selectRoutesError = (state) => state.route.error;
export const selectRoutemap = (state) => state.route.routemap;
export const selectSelectedRouteNames = (state) => state.route.selectedRouteNames;
export const selectRouteFiltersApplied = (state) => state.route.routeFiltersApplied;
export const selectCurrentRoute = (state) => state.route.currentRoute;
export const selectRouteCalculationData = (state) => state.route.routeCalculationData;
export const selectRouteWaypoints = (state) => state.route.currentRoute?.waypoints || [];
export const selectRouteDistance = (state) => state.route.routeCalculationData?.distance;
export const selectRouteDuration = (state) => state.route.routeCalculationData?.duration;
export const selectRoutePlans = (state) => state.route.routePlans;
export const selectRoutePlansLoading = (state) => state.route.routePlansLoading;
export const selectRoutePlansError = (state) => state.route.routePlansError;

export default routeSlice.reducer;

// Selector for filtered routes based on search query
export const selectFilteredRoutes = (state) => {
  const query = state.route.searchQuery?.toLowerCase() || "";
  if (!query) return state.route.routes;
  return state.route.routes.filter(route =>
    (route.routeName || "").toLowerCase().includes(query) ||
    (route.originLatLng || "").toLowerCase().includes(query) ||
    (route.destinationLatLng || "").toLowerCase().includes(query)
  );
};

export const selectFilteredRoutesCount = (state) => selectFilteredRoutes(state).length;
export const selectTotalRoutesCount = (state) => state.route.routes.length;

