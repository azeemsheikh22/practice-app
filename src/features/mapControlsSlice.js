import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFullScreen: false,
  mapType: 'map', // 'map' or 'satellite'
  showTraffic: false,
  // You can add more map-related state here
};

export const mapControlsSlice = createSlice({
  name: 'mapControls',
  initialState,
  reducers: {
    setFullScreen: (state, action) => {
      state.isFullScreen = action.payload;
    },
    setMapType: (state, action) => {
      state.mapType = action.payload;
    },
    setShowTraffic: (state, action) => {
      state.showTraffic = action.payload;
    },
    toggleFullScreen: (state) => {
      state.isFullScreen = !state.isFullScreen;
    },
    toggleTraffic: (state) => {
      state.showTraffic = !state.showTraffic;
    },
  },
});

// Export actions
export const {
  setFullScreen,
  setMapType,
  setShowTraffic,
  toggleFullScreen,
  toggleTraffic,
} = mapControlsSlice.actions;

// Export selectors
export const selectIsFullScreen = (state) => state.mapControls.isFullScreen;
export const selectMapType = (state) => state.mapControls.mapType;
export const selectShowTraffic = (state) => state.mapControls.showTraffic;

export default mapControlsSlice.reducer;
