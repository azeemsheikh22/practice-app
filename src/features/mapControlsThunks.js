import { createAsyncThunk } from '@reduxjs/toolkit';
import { setFullScreen, setMapType, setShowTraffic } from './mapControlsSlice';
import L from 'leaflet';

// These refs will be set by the component
let mapInstanceRef = null;
let mapElementRef = null;
let tileLayerRef = null;
let trafficLayerRef = null;

// Function to set refs (call this from your component)
export const setMapRefs = (refs) => {
  mapInstanceRef = refs.mapInstanceRef;
  mapElementRef = refs.mapElementRef;
  tileLayerRef = refs.tileLayerRef;
  trafficLayerRef = refs.trafficLayerRef;
};

// Thunk for toggling fullscreen
export const toggleFullScreenThunk = createAsyncThunk(
  'mapControls/toggleFullScreen',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const isCurrentlyFullScreen = state.mapControls.isFullScreen;
    
    if (!isCurrentlyFullScreen) {
      mapElementRef?.current?.requestFullscreen?.();
      dispatch(setFullScreen(true));
    } else {
      document.exitFullscreen?.();
      dispatch(setFullScreen(false));
    }
  }
);

// Thunk for changing map type
export const changeMapTypeThunk = createAsyncThunk(
  'mapControls/changeMapType',
  async (type, { dispatch, getState }) => {
    const state = getState();
    const currentMapType = state.mapControls.mapType;
    
    if (mapInstanceRef?.current && type !== currentMapType) {
      // First, remove traffic layer if it exists
      if (trafficLayerRef?.current) {
        mapInstanceRef.current.removeLayer(trafficLayerRef.current);
        trafficLayerRef.current = null;
        dispatch(setShowTraffic(false));
      }

      // Then remove current tile layer
      if (tileLayerRef?.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      let layerType = type === "map" ? "m" : "y";

      // Add the new tile layer
      const newTileLayer = L.tileLayer(
        `https://{s}.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`,
        {
          minZoom: 3,
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "© Google",
        }
      ).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTileLayer;
      dispatch(setMapType(type));
    }
  }
);

// Thunk for toggling traffic
export const toggleTrafficThunk = createAsyncThunk(
  'mapControls/toggleTraffic',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const currentShowTraffic = state.mapControls.showTraffic;
    const currentMapType = state.mapControls.mapType;
    const newTrafficState = !currentShowTraffic;
    
    dispatch(setShowTraffic(newTrafficState));
    
    if (!mapInstanceRef?.current) return;

    if (newTrafficState) {
      // If traffic should be shown
      if (trafficLayerRef?.current) {
        // Remove existing traffic layer first
        mapInstanceRef.current.removeLayer(trafficLayerRef.current);
        trafficLayerRef.current = null;
      }

      // Create a new traffic layer based on current map type
      let trafficUrl = currentMapType === "satellite"
        ? "https://{s}.google.com/vt/lyrs=h@159000000,traffic&x={x}&y={y}&z={z}"
        : "https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}";

      const trafficLayer = L.tileLayer(trafficUrl, {
        minZoom: 3,
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google",
      }).addTo(mapInstanceRef.current);

      trafficLayerRef.current = trafficLayer;
    } else {
      // If traffic should be hidden
      if (trafficLayerRef?.current) {
        mapInstanceRef.current.removeLayer(trafficLayerRef.current);
        trafficLayerRef.current = null;
      }
    }
  }
);
