import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedVehicleId: null,
  vehicleFilter: "all",
  zoomToVehicle: false,
  iconClustering: false,
  showAllLabels: false,
  showGeofences: false, // New field added
  visuallySelectedItems: [],
};

const mapInteractionSlice = createSlice({
  name: "mapInteraction",
  initialState,
  reducers: {
    setSelectedVehicle: (state, action) => {
      state.selectedVehicleId = action.payload;
      state.zoomToVehicle = true;
    },
    setVehicleFilter: (state, action) => {
      state.vehicleFilter = action.payload;
    },
    resetZoomFlag: (state) => {
      state.zoomToVehicle = false;
    },
    setIconClustering: (state, action) => {
      state.iconClustering = action.payload;
    },
    setShowAllLabels: (state, action) => {
      state.showAllLabels = action.payload;
    },
    setShowGeofences: (state, action) => {
      state.showGeofences = action.payload;
    },
    setVisuallySelectedItems: (state, action) => {
      state.visuallySelectedItems = action.payload;
    },
  },
});

export const { 
  setSelectedVehicle, 
  resetZoomFlag, 
  setVehicleFilter,
  setIconClustering,
  setShowAllLabels,
  setShowGeofences,
  setVisuallySelectedItems
} = mapInteractionSlice.actions;

export const selectSelectedVehicleId = (state) =>
  state.mapInteraction.selectedVehicleId;
export const selectZoomToVehicle = (state) =>
  state.mapInteraction.zoomToVehicle;
export const selectVehicleFilter = (state) =>
  state.mapInteraction.vehicleFilter;
export const selectIconClustering = (state) =>
  state.mapInteraction.iconClustering;
export const selectShowAllLabels = (state) =>
  state.mapInteraction.showAllLabels;
export const selectShowGeofences = (state) =>
  state.mapInteraction.showGeofences;
export const selectVisuallySelectedItems = (state) =>
  state.mapInteraction.visuallySelectedItems;

export default mapInteractionSlice.reducer;
