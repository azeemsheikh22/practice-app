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
    showRoutes: false, // ✅ NEW STATE: Routes show/hide toggle
  },
  reducers: {
    clearRoutes: (state) => {
      state.routes = [];
      state.error = null;
      state.totalRoutes = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTotalRoutes: (state, action) => {
      state.totalRoutes = action.payload;
    },
    // ✅ NEW REDUCER: Toggle routes visibility
    setShowRoutes: (state, action) => {
      state.showRoutes = action.payload;
    },
    // ✅ NEW REDUCER: Toggle routes (convenience function)
    toggleShowRoutes: (state) => {
      state.showRoutes = !state.showRoutes;
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
        // ✅ AUTO SET: Routes successfully load hone pe showRoutes true kar do
        state.showRoutes = true;
      })
      .addCase(fetchRouteListForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // ✅ ERROR HANDLING: Error pe showRoutes false kar do
        state.showRoutes = false;
      });
  },
});

export const {
  clearRoutes,
  clearError,
  setTotalRoutes,
  setShowRoutes, // ✅ NEW EXPORT
  toggleShowRoutes, // ✅ NEW EXPORT
} = routeSlice.actions;

// ✅ NEW SELECTOR: Routes visibility selector
export const selectShowRoutes = (state) => state.route.showRoutes;
export const selectRoutes = (state) => state.route.routes;
export const selectRoutesLoading = (state) => state.route.loading;
export const selectRoutesError = (state) => state.route.error;

export default routeSlice.reducer;
