import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk for fetching user dashboard data by category
export const fetchUserDashboardByCategory = createAsyncThunk(
  "chart/fetchUserDashboardByCategory",
  async ({ catid }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const finalUserId = localStorage.getItem("clientId");
      const apiUrl = `${API_BASE_URL}api/reports/UserDashboard?UserId=${finalUserId}&catid=${catid}`;
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
      console.error("UserDashboard API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching chart data for individual charts
export const fetchChartData = createAsyncThunk(
  "chart/fetchChartData",
  async (chartConfig, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const finalUserId = localStorage.getItem("clientId");

      // Safely access chartConfig properties with defaults
      //   const noOfRec = chartConfig?.DPsLimit || 10;
      const noOfRec = 10;
      const rangeDays = chartConfig?.RangeNumOfDays || "total";
      const showBy = chartConfig?.showBy || "daily";
      const spName = chartConfig?.ChartProcedure || "";
      const fromDate = chartConfig?.fromDate || "";
      const toDate = chartConfig?.toDate || "";
      const groupid = chartConfig?.vehicleGroup || "";

      const apiUrl = `${API_BASE_URL}api/reports/ChartData?UserId=${finalUserId}&fromDate=${fromDate}&toDate=${toDate}&groupid=${groupid}&noOfRec=${noOfRec}&RangeDays=${rangeDays}&showby=${showBy}&VehRegNo=%&spName=${spName}`;

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

      // Log chart data for debugging
      console.log(
        `📊 ${chartConfig?.chartTitle || "Unknown Chart"} Data:`,
        data
      );

      // Create unique chart ID using GroupID and ChartProcedure
      const uniqueChartId = `${chartConfig?.GroupID || "unknown"}-${
        chartConfig?.ChartProcedure || "default"
      }`;

      return {
        chartId: uniqueChartId,
        chartTitle: chartConfig?.chartTitle || "Unknown Chart",
        data,
      };
    } catch (error) {
      console.error("ChartData API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching dashboard categories for user
export const fetchDashboardCategoriesForUser = createAsyncThunk(
  "chart/fetchDashboardCategoriesForUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const finalUserId = localStorage.getItem("clientId");
      const apiUrl = `${API_BASE_URL}api/reports/DashboardCategoriesForUser?UserId=${finalUserId}`;
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
      console.error("DashboardCategoriesForUser API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const chartApiSlice = createSlice({
  name: "chartApi",
  initialState: {
    dashboardCategories: [],
    dashboardCategoriesLoading: false,
    dashboardCategoriesError: null,
    userDashboardData: null,
    userDashboardLoading: false,
    userDashboardError: null,
    chartData: {},
    chartDataLoading: {},
    chartDataError: {},
  },
  reducers: {
    clearDashboardCategories: (state) => {
      state.dashboardCategories = [];
      state.dashboardCategoriesError = null;
    },
    clearDashboardCategoriesError: (state) => {
      state.dashboardCategoriesError = null;
    },
    clearUserDashboardData: (state) => {
      state.userDashboardData = null;
      state.userDashboardError = null;
    },
    clearUserDashboardError: (state) => {
      state.userDashboardError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardCategoriesForUser.pending, (state) => {
        state.dashboardCategoriesLoading = true;
        state.dashboardCategoriesError = null;
      })
      .addCase(fetchDashboardCategoriesForUser.fulfilled, (state, action) => {
        state.dashboardCategoriesLoading = false;
        state.dashboardCategories = action.payload;
      })
      .addCase(fetchDashboardCategoriesForUser.rejected, (state, action) => {
        state.dashboardCategoriesLoading = false;
        state.dashboardCategoriesError = action.payload;
      })
      // UserDashboard API
      .addCase(fetchUserDashboardByCategory.pending, (state) => {
        state.userDashboardLoading = true;
        state.userDashboardError = null;
      })
      .addCase(fetchUserDashboardByCategory.fulfilled, (state, action) => {
        state.userDashboardLoading = false;
        state.userDashboardData = action.payload;
      })
      .addCase(fetchUserDashboardByCategory.rejected, (state, action) => {
        state.userDashboardLoading = false;
        state.userDashboardError = action.payload;
      })
      // ChartData API
      .addCase(fetchChartData.pending, (state, action) => {
        const uniqueChartId = `${action.meta.arg.GroupID}-${action.meta.arg.ChartProcedure}`;
        state.chartDataLoading[uniqueChartId] = true;
        state.chartDataError[uniqueChartId] = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        const { chartId, chartTitle, data } = action.payload;
        state.chartDataLoading[chartId] = false;
        state.chartData[chartId] = { chartTitle, data };
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        const uniqueChartId = `${action.meta.arg.GroupID}-${action.meta.arg.ChartProcedure}`;
        state.chartDataLoading[uniqueChartId] = false;
        state.chartDataError[uniqueChartId] = action.payload;
      });
  },
});

export const {
  clearDashboardCategories,
  clearDashboardCategoriesError,
  clearUserDashboardData,
  clearUserDashboardError,
} = chartApiSlice.actions;

// Selectors
export const selectDashboardCategories = (state) =>
  state.chartApi.dashboardCategories;
export const selectDashboardCategoriesLoading = (state) =>
  state.chartApi.dashboardCategoriesLoading;
export const selectDashboardCategoriesError = (state) =>
  state.chartApi.dashboardCategoriesError;
export const selectUserDashboardData = (state) =>
  state.chartApi.userDashboardData;
export const selectUserDashboardLoading = (state) =>
  state.chartApi.userDashboardLoading;
export const selectUserDashboardError = (state) =>
  state.chartApi.userDashboardError;
export const selectChartData = (state) => state.chartApi.chartData;
export const selectChartDataLoading = (state) =>
  state.chartApi.chartDataLoading;
export const selectChartDataError = (state) => state.chartApi.chartDataError;

export default chartApiSlice.reducer;
