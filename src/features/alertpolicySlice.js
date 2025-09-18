import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch policy details async thunk
export const fetchPolicyDetails = createAsyncThunk(
  "alertpolicy/fetchPolicyDetails",
  async (policyId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = `${API_BASE_URL}api/Alerts/PolicyDetails?policyid=${policyId}`;

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
      console.error("PolicyDetails API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

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

// Fetch policy user list async thunk
export const fetchPolicyUserList = createAsyncThunk(
  "alertpolicy/fetchPolicyUserList",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userid = localStorage.getItem("clientId");
      const apiUrl = `${API_BASE_URL}api/Alerts/PolicyUserList?UserId=${userid}`;

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
      console.error("PolicyUserList API Error:", error);
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
    // Policy User List
    policyUserList: [],
    policyUsersLoading: false,
    policyUsersError: null,
    // Policy Details
    policyDetails: null,
    policyDetailsLoading: false,
    policyDetailsError: null,
  },
  reducers: {
    clearPolicyTypeList: (state) => {
      state.policyTypeList = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPolicyUserList: (state) => {
      state.policyUserList = [];
      state.policyUsersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPolicyTypeList cases
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
      })
      // fetchPolicyUserList cases
      .addCase(fetchPolicyUserList.pending, (state) => {
        state.policyUsersLoading = true;
        state.policyUsersError = null;
      })
      .addCase(fetchPolicyUserList.fulfilled, (state, action) => {
        state.policyUsersLoading = false;
        state.policyUserList = action.payload || [];
        state.policyUsersError = null;
      })
      .addCase(fetchPolicyUserList.rejected, (state, action) => {
        state.policyUsersLoading = false;
        state.policyUsersError =
          action.payload || "Failed to fetch policy user list";
        state.policyUserList = [];
      })
      // fetchPolicyDetails cases
      .addCase(fetchPolicyDetails.pending, (state) => {
        state.policyDetailsLoading = true;
        state.policyDetailsError = null;
        state.policyDetails = null;
      })
      .addCase(fetchPolicyDetails.fulfilled, (state, action) => {
        state.policyDetailsLoading = false;
        state.policyDetails = action.payload || null;
        state.policyDetailsError = null;
      })
      .addCase(fetchPolicyDetails.rejected, (state, action) => {
        state.policyDetailsLoading = false;
        state.policyDetailsError = action.payload || "Failed to fetch policy details";
        state.policyDetails = null;
      });
  },
});

export const { clearPolicyTypeList, clearError, clearPolicyUserList } =
  alertpolicySlice.actions;

// Selectors
export const selectPolicyTypeList = (state) => state.alertpolicy.policyTypeList;
export const selectPolicyTypeListLoading = (state) => state.alertpolicy.loading;
export const selectPolicyTypeListError = (state) => state.alertpolicy.error;

export const selectPolicyUserList = (state) => state.alertpolicy.policyUserList;
export const selectPolicyUsersLoading = (state) =>
  state.alertpolicy.policyUsersLoading;
export const selectPolicyUsersError = (state) =>
  state.alertpolicy.policyUsersError;

export default alertpolicySlice.reducer;
