
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STATIC_CAR_ID = 1005631;
const STATIC_DATE = "2025/06/17";

export const fetchReplayData = createAsyncThunk(
  "replay/fetchReplayData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      // You can also get clientId if needed: const userid = localStorage.getItem("clientId");
      const apiUrl = `${API_BASE_URL}api/replay/replay?carid=${STATIC_CAR_ID}&datefrom=${STATIC_DATE} 00:00:00&dateto=${STATIC_DATE} 23:59:59`;

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
      console.error("Replay API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const replaySlice = createSlice({
  name: "replay",
  initialState: {
    replayData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReplayData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReplayData.fulfilled, (state, action) => {
        state.loading = false;
        state.replayData = action.payload;
        state.error = null;
      })
      .addCase(fetchReplayData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch replay data";
        state.replayData = null;
      });
  },
});

export default replaySlice.reducer;
export const selectReplayData = (state) => state.replay.replayData;
export const selectReplayLoading = (state) => state.replay.loading;
export const selectReplayError = (state) => state.replay.error;
