import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get date range based on selection
const getDateRange = (timeRange, startDateTime, endDateTime) => {
  const today = new Date();
  let datefrom, dateto;

  switch (timeRange) {
    case "Today":
      datefrom = today.toISOString().split("T")[0] + " 00:00:00";
      dateto = today.toISOString().split("T")[0] + " 23:59:59";
      break;

    case "Yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      datefrom = yesterday.toISOString().split("T")[0] + " 00:00:00";
      dateto = yesterday.toISOString().split("T")[0] + " 23:59:59";
      break;

    case "This Week":
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      datefrom = startOfWeek.toISOString().split("T")[0] + " 00:00:00";
      dateto = today.toISOString().split("T")[0] + " 23:59:59";
      break;

    case "This Month":
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      datefrom = startOfMonth.toISOString().split("T")[0] + " 00:00:00";
      dateto = today.toISOString().split("T")[0] + " 23:59:59";
      break;

    case "Last Week":
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      datefrom = lastWeekStart.toISOString().split("T")[0] + " 00:00:00";
      dateto = lastWeekEnd.toISOString().split("T")[0] + " 23:59:59";
      break;

    case "Last Month":
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      datefrom = lastMonth.toISOString().split("T")[0] + " 00:00:00";
      dateto = lastMonthEnd.toISOString().split("T")[0] + " 23:59:59";
      break;

    case "Other":
      if (startDateTime && endDateTime) {
        // Convert datetime-local format to required format
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        datefrom =
          startDate.getFullYear() +
          "/" +
          String(startDate.getMonth() + 1).padStart(2, "0") +
          "/" +
          String(startDate.getDate()).padStart(2, "0") +
          " " +
          String(startDate.getHours()).padStart(2, "0") +
          ":" +
          String(startDate.getMinutes()).padStart(2, "0") +
          ":" +
          String(startDate.getSeconds()).padStart(2, "0");

        dateto =
          endDate.getFullYear() +
          "/" +
          String(endDate.getMonth() + 1).padStart(2, "0") +
          "/" +
          String(endDate.getDate()).padStart(2, "0") +
          " " +
          String(endDate.getHours()).padStart(2, "0") +
          ":" +
          String(endDate.getMinutes()).padStart(2, "0") +
          ":" +
          String(endDate.getSeconds()).padStart(2, "0");
      } else {
        datefrom = today.toISOString().split("T")[0] + " 00:00:00";
        dateto = today.toISOString().split("T")[0] + " 23:59:59";
      }
      break;

    default:
      datefrom = today.toISOString().split("T")[0] + " 00:00:00";
      dateto = today.toISOString().split("T")[0] + " 23:59:59";
  }

  // Convert to YYYY/MM/DD HH:mm:ss format for all cases except "Other"
  if (timeRange !== "Other") {
    // Convert YYYY-MM-DD to YYYY/MM/DD format
    datefrom = datefrom.replace(/-/g, "/");
    dateto = dateto.replace(/-/g, "/");
  }

  return { datefrom, dateto };
};

// Export function for getting formatted date range
export const getFormattedDateRange = (
  timeRange,
  startDateTime,
  endDateTime
) => {
  return getDateRange(timeRange, startDateTime, endDateTime);
};

export const fetchGeofences = createAsyncThunk(
  "geofence/fetchGeofences",
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const usertype = localStorage.getItem("userTypeId") || "2";
      const userid = localStorage.getItem("clientId") || "6571"; // Updated default

      const {
        timeRange = "Today",
        startDateTime = "",
        endDateTime = "",
      } = filterParams;

      const { datefrom, dateto } = getDateRange(
        timeRange,
        startDateTime,
        endDateTime
      );

      // URL encode the date parameters to handle spaces and special characters
      const encodedDateFrom = encodeURIComponent(datefrom);
      const encodedDateTo = encodeURIComponent(dateto);

      const apiUrl = `${API_BASE_URL}api/geofence?userid=${userid}&usertype=${usertype}&datefrom=${encodedDateFrom}&dateto=${encodedDateTo}`;

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
      console.error("Geofence API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// fetchGeofenceForUser async thunk
export const fetchGeofenceForUser = createAsyncThunk(
  "geofence/fetchGeofenceForUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("clientId") || "6571";

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

// fetchGeofenceCatList async thunk
export const fetchGeofenceCatList = createAsyncThunk(
  "geofence/fetchGeofenceCatList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const apiUrl = `${API_BASE_URL}api/Geofence/GeofenceCatList`;

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
      console.error("GeofenceCatList API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const geofenceSlice = createSlice({
  name: "geofence",
  initialState: {
    geofences: [],
    loading: false,
    error: null,
    totalCount: 0,
    totalGeofences: 0,
    geofencesToCorrect: 0,
    allMapGeofences: [],
    selectedGeofenceIds: [],
    selectedCategories: [],
    filtersApplied: false,
    searchQuery: "",
    selectedTimeRange: "Today",
    showCustomRange: false,
    startDateTime: "",
    endDateTime: "",
    currentDate: new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "/"),
    userGeofences: [],
    userGeofencesLoading: false,
    userGeofencesError: null,
    geofenceCatList: [],
    geofenceCatListLoading: false,
    geofenceCatListError: null,
    filteredMapGeofences: [],
    // ✅ NEW STATE: Show shapes for geofences
    showShapes: false, // By default uncheck
    // ✅ NEW STATE: Current date range being used
    currentDateRange: {
      datefrom: "",
      dateto: "",
    },
  },
  reducers: {
    clearGeofences: (state) => {
      state.geofences = [];
      state.error = null;
      state.totalGeofences = 0;
      state.geofencesToCorrect = 0;
      state.allMapGeofences = [];
      state.selectedGeofenceIds = [];
      state.selectedCategories = [];
      state.filtersApplied = false;
      state.searchQuery = "";
      state.selectedTimeRange = "Today";
      state.showCustomRange = false;
      state.startDateTime = "";
      state.endDateTime = "";
      state.showShapes = false; // ✅ Reset showShapes too
      state.currentDateRange = { datefrom: "", dateto: "" }; // ✅ Reset date range
    },

    // Clear user geofences
    clearUserGeofences: (state) => {
      state.userGeofences = [];
      state.userGeofencesError = null;
      state.filteredMapGeofences = [];
    },

    clearGeofenceCatList: (state) => {
      state.geofenceCatList = [];
      state.geofenceCatListError = null;
    },

    clearError: (state) => {
      state.error = null;
      state.userGeofencesError = null;
    },

    setTotalGeofences: (state, action) => {
      state.totalGeofences = action.payload;
    },
    setGeofencesToCorrect: (state, action) => {
      state.geofencesToCorrect = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload;
      state.showCustomRange = action.payload === "Other";
    },
    setCustomDateTime: (state, action) => {
      const { startDateTime, endDateTime } = action.payload;
      state.startDateTime = startDateTime || state.startDateTime;
      state.endDateTime = endDateTime || state.endDateTime;
    },
    setShowCustomRange: (state, action) => {
      state.showCustomRange = action.payload;
    },
    setShowShapes: (state, action) => {
      state.showShapes = action.payload;
    },
    // ✅ NEW REDUCER: Set current date range
    setCurrentDateRange: (state, action) => {
      state.currentDateRange = action.payload;
    },
    applyTimeFilters: (state) => {
      state.filtersApplied = true;
      // ✅ Update current date range when filters are applied
      const { datefrom, dateto } = getDateRange(
        state.selectedTimeRange,
        state.startDateTime,
        state.endDateTime
      );
      state.currentDateRange = { datefrom, dateto };
    },
    setSelectedGeofenceIds: (state, action) => {
      state.selectedGeofenceIds = action.payload;
    },
    setSelectedCategories: (state, action) => {
      state.selectedCategories = action.payload;
    },

    // Update the applyGeofenceFilters reducer
    applyGeofenceFilters: (state) => {
      const selectedIds = state.selectedGeofenceIds;
      const selectedCategories = state.selectedCategories;

      // If no geofences or categories are selected, clear the filtered array
      if (selectedIds.length === 0 || selectedCategories.length === 0) {
        state.filteredMapGeofences = [];
        state.filtersApplied = true;
        return;
      }

      // Filter geofences based on selected IDs and categories
      const filtered = state.userGeofences.filter((geofence) => {
        const isGeofenceSelected = selectedIds.includes(geofence.id);
        const isCategorySelected = selectedCategories.includes(
          geofence.Categoryname
        );

        return isGeofenceSelected && isCategorySelected;
      });

      state.filteredMapGeofences = filtered;
      state.filtersApplied = true;
    },

    resetGeofenceFilters: (state) => {
      // Show all geofences when filters are reset
      state.filteredMapGeofences = [...state.userGeofences];
      state.filtersApplied = false;

      // Reset selections to all
      const allGeofenceIds = state.userGeofences.map((g) => g.id);
      const allCategories = [
        ...new Set(state.userGeofences.map((g) => g.Categoryname)),
      ];

      state.selectedGeofenceIds = allGeofenceIds;
      state.selectedCategories = allCategories;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing fetchGeofences cases
      .addCase(fetchGeofences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeofences.fulfilled, (state, action) => {
        state.loading = false;
        state.geofences = action.payload;
        state.totalCount = action.payload?.length || 0;

        state.totalGeofences = action.payload?.length || 0;

        state.geofencesToCorrect =
          action.payload?.filter((geofence) => geofence.needCorrection === true)
            .length || 0;

        const mapGeofencesData =
          action.payload?.filter(
            (geofence) => geofence.chkShowOnMap === "true"
          ) || [];

        state.allMapGeofences = mapGeofencesData;

        // ✅ UPDATE CURRENT DATE RANGE when data is fetched
        const { datefrom, dateto } = getDateRange(
          state.selectedTimeRange,
          state.startDateTime,
          state.endDateTime
        );
        state.currentDateRange = { datefrom, dateto };

        state.currentDate = new Date()
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, "/");
      })
      .addCase(fetchGeofences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATED: fetchGeofenceForUser cases
      .addCase(fetchGeofenceForUser.pending, (state) => {
        state.userGeofencesLoading = true;
        state.userGeofencesError = null;
      })
      // UPDATED: fetchGeofenceForUser cases
      .addCase(fetchGeofenceForUser.fulfilled, (state, action) => {
        state.userGeofencesLoading = false;
        state.userGeofences = action.payload.filter(
          (geofence) => geofence.chkShowOnMap === "true"
        );

        // By default, show all geofences on map BUT only those with chkShowOnMap = "true"
        if (!state.filtersApplied) {
          state.filteredMapGeofences = action.payload.filter(
            (geofence) => geofence.chkShowOnMap === "true"
          );
        }
      })

      .addCase(fetchGeofenceForUser.rejected, (state, action) => {
        state.userGeofencesLoading = false;
        state.userGeofencesError = action.payload;
        console.error("Failed to load user geofences:", action.payload);
      })

      // fetchGeofenceCatList cases
      .addCase(fetchGeofenceCatList.pending, (state) => {
        state.geofenceCatListLoading = true;
        state.geofenceCatListError = null;
      })
      .addCase(fetchGeofenceCatList.fulfilled, (state, action) => {
        state.geofenceCatListLoading = false;
        state.geofenceCatList = action.payload;
      })
      .addCase(fetchGeofenceCatList.rejected, (state, action) => {
        state.geofenceCatListLoading = false;
        state.geofenceCatListError = action.payload;
      });
  },
});

export const {
  clearGeofences,
  clearUserGeofences,
  clearError,
  setTotalGeofences,
  setGeofencesToCorrect,
  setSearchQuery,
  setSelectedTimeRange,
  setCustomDateTime,
  setShowCustomRange,
  applyTimeFilters,
  setSelectedGeofenceIds,
  setSelectedCategories,
  applyGeofenceFilters,
  resetGeofenceFilters,
  clearGeofenceCatList,
  setShowShapes, // ✅ NEW EXPORT
  setCurrentDateRange, // ✅ NEW EXPORT
} = geofenceSlice.actions;

export default geofenceSlice.reducer;
