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
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
export const selectDashboardCategories = (state) => state.chartApi.dashboardCategories;
export const selectDashboardCategoriesLoading = (state) => state.chartApi.dashboardCategoriesLoading;
export const selectDashboardCategoriesError = (state) => state.chartApi.dashboardCategoriesError;
export const selectUserDashboardData = (state) => state.chartApi.userDashboardData;
export const selectUserDashboardLoading = (state) => state.chartApi.userDashboardLoading;
export const selectUserDashboardError = (state) => state.chartApi.userDashboardError;

export default chartApiSlice.reducer;
