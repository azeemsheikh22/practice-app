import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchReplayData = createAsyncThunk(
  "replay/fetchReplayData",
  async ({ carId, datefrom, dateto }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = `${API_BASE_URL}api/replay/replay?carid=${carId}&datefrom=${datefrom} 00:00:00&dateto=${dateto} 23:59:59`;

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
    filters: {
      displayMode: 'line', // 'line' | 'marker' | 'all'
      stopDuration: 'all',
      showAlarms: true,
      showStops: true,
    },
    currentReplayIndex: null, // index of the currently animated point
    isReplayPaused: true, // replay pause state
  },
  reducers: {
    setFilters: (state, action) => {
      // Remove followVehicle if present in payload
      const { followVehicle, ...rest } = action.payload || {};
      state.filters = { ...state.filters, ...rest };
    },
    setCurrentReplayIndex: (state, action) => {
      state.currentReplayIndex = action.payload;
    },
    setReplayPaused: (state, action) => {
      state.isReplayPaused = action.payload;
    },
  },
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

export const { setFilters, setCurrentReplayIndex, setReplayPaused } = replaySlice.actions;
export default replaySlice.reducer;
export const selectReplayData = (state) => state.replay.replayData;
export const selectReplayLoading = (state) => state.replay.loading;
export const selectReplayError = (state) => state.replay.error;
export const selectReplayFilters = (state) => state.replay.filters;
export const selectReplayPaused = (state) => state.replay.isReplayPaused;
export const selectCurrentReplayIndex = (state) => state.replay.currentReplayIndex;
