import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch policy type list async thunk
export const fetchPolicyTypeList = createAsyncThunk(
  "alertpolicy/fetchPolicyTypeList",
  async (_, { rejectWithValue }) => {
    try {

      const token = localStorage.getItem("token");
      const apiUrl = `${API_BASE_URL}api/Alerts/PolicyTypeList`;

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
      console.error("Policy Type List API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const alertpolicySlice = createSlice({
  name: "alertpolicy",
  initialState: {
    policyTypeList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPolicyTypeList: (state) => {
      state.policyTypeList = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicyTypeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyTypeList.fulfilled, (state, action) => {
        state.loading = false;
        state.policyTypeList = action.payload || [];
        state.error = null;
      })
      .addCase(fetchPolicyTypeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch policy type list";
        state.policyTypeList = [];
      });
  },
});

export const { clearPolicyTypeList, clearError } = alertpolicySlice.actions;
export default alertpolicySlice.reducer;
