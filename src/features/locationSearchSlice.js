import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for searching locations
export const searchLocations = createAsyncThunk(
  'locationSearch/searchLocations',
  async (query, { rejectWithValue }) => {
    try {
      if (!query || query.length < 3) return [];
      
      // Using Nominatim API (free alternative to Google Places)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pk&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      
      // Format data for our use
      return data.map(item => ({
        id: item.place_id,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name,
        type: item.type || 'location'
      }));
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const locationSearchSlice = createSlice({
  name: 'locationSearch',
  initialState: {
    searchResults: [],
    selectedLocation: null,
    contextMenuLocation: null,
    loading: false,
    error: null,
    searchQuery: '',
    globalSearchQuery: '', // NEW: Global search query for tree search
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setGlobalSearchQuery: (state, action) => { // NEW: Set global search query
      state.globalSearchQuery = action.payload;
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    setContextMenuLocation: (state, action) => {
      state.contextMenuLocation = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },
    clearContextMenuLocation: (state) => {
      state.contextMenuLocation = null;
    },
    clearGlobalSearchQuery: (state) => { // NEW: Clear global search query
      state.globalSearchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export const { 
  setSearchQuery, 
  setGlobalSearchQuery, // EXPORT NEW ACTION
  setSelectedLocation, 
  setContextMenuLocation,
  clearSearchResults, 
  clearSelectedLocation,
  clearContextMenuLocation,
  clearGlobalSearchQuery // EXPORT NEW ACTION
} = locationSearchSlice.actions;

export default locationSearchSlice.reducer;
