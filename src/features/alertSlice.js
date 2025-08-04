import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch alerts policy list async thunk
export const fetchAlertsPolicyList = createAsyncThunk(
  "alert/fetchAlertsPolicyList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const usertype = localStorage.getItem("userTypeId");
      const userid = localStorage.getItem("clientId");

      const apiUrl = `${API_BASE_URL}api/Alerts/policylist?userid=${userid}&usertypeix=${usertype}`;

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
      console.error("Alert Policy List API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch alert summary async thunk
export const fetchAlertSummary = createAsyncThunk(
  "alert/fetchAlertSummary",
  async ({ datefrom, dateto }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("clientId");

      const apiUrl = `${API_BASE_URL}api/Alerts/AlertSummary?userid=${userid}&datefrom=${datefrom}&dateto=${dateto}`;

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
      console.error("Alert Summary API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const alertSlice = createSlice({
  name: "alert",
  initialState: {
    policyList: [],
    alertSummary: [],
    loading: false,
    summaryLoading: false,
    error: null,
    summaryError: null,
    totalPolicies: 0,
    selectedDateRange: "Today",
  },
  reducers: {
    clearAlerts: (state) => {
      state.policyList = [];
      state.error = null;
      state.totalPolicies = 0;
    },
    clearError: (state) => {
      state.error = null;
      state.summaryError = null;
    },
    setTotalPolicies: (state, action) => {
      state.totalPolicies = action.payload;
    },
    setSelectedDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
    },
    clearAlertSummary: (state) => {
      state.alertSummary = [];
      state.summaryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Policy List Cases
      .addCase(fetchAlertsPolicyList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlertsPolicyList.fulfilled, (state, action) => {
        state.loading = false;
        state.policyList = action.payload || [];
        state.totalPolicies = action.payload?.length || 0;
        state.error = null;
      })
      .addCase(fetchAlertsPolicyList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch alert policy list";
        state.policyList = [];
        state.totalPolicies = 0;
      })
      // Alert Summary Cases
      .addCase(fetchAlertSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchAlertSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.alertSummary = action.payload || [];
        state.summaryError = null;
      })
      .addCase(fetchAlertSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload || "Failed to fetch alert summary";
        state.alertSummary = [];
      });
  },
});

export const {
  clearAlerts,
  clearError,
  setTotalPolicies,
  setSelectedDateRange,
  clearAlertSummary,
} = alertSlice.actions;

export default alertSlice.reducer;
