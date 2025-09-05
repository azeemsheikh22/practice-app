import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUserReportList = createAsyncThunk(
  "reports/fetchUserReportList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("clientId");
      const usertype = localStorage.getItem("userTypeId");
      const apiUrl = `${API_BASE_URL}api/reports/UserReportList?userid=${userid}&usertype=${usertype}`;
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
      console.error("UserReportList API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const generateReport = createAsyncThunk(
  "reports/generateReport",
  async (reportParams, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("clientId");

      const { reportId, selectedValueIds, fromDateTime, toDateTime } =
        reportParams;

      // Build API URL with parameters
      let apiUrl = `${API_BASE_URL}api/reports/ReportHeading?ReportId=${reportId}&VehicleId=${selectedValueIds}&UserId=${userId}&FromDate=${fromDateTime}&ToDate=${toDateTime}`;

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
      console.error("Generate Report API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    reports: [],
    reportData: null,
    loading: false,
    generateLoading: false,
    error: null,
  },
  reducers: {
    clearReports: (state) => {
      state.reports = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearReportData: (state) => {
      state.reportData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReportList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReportList.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchUserReportList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateReport.pending, (state) => {
        state.generateLoading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generateLoading = false;
        state.reportData = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReports, clearError, clearReportData } =
  reportsSlice.actions;
export default reportsSlice.reducer;
