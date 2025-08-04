import { configureStore } from "@reduxjs/toolkit";
import gpsTrackingReducer from "../features/gpsTrackingSlice";
import mapInteractionReducer from '../features/mapInteractionSlice';
import mapControlsReducer from '../features/mapControlsSlice';
import geofenceReducer from '../features/geofenceSlice';
import liveDashboardReducer from '../features/liveDashboardSlice';
import locationSearchReducer from '../features/locationSearchSlice';
import routeReducer from '../features/routeSlice'; // ✅ NEW IMPORT
import alertReducer from '../features/alertSlice'; // ✅ ALERT IMPORT

export const store = configureStore({
  reducer: {
    gpsTracking: gpsTrackingReducer,
    mapInteraction: mapInteractionReducer,
    mapControls: mapControlsReducer,
    geofence: geofenceReducer,
    liveDashboard: liveDashboardReducer,
    locationSearch: locationSearchReducer,
    route: routeReducer, // ✅ NEW REDUCER
    alert: alertReducer, // ✅ ALERT REDUCER
    // other reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Fix for large state serialization
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "gpsTracking/initializeConnection/fulfilled",
          "gpsTracking/updateCarData",
          "gpsTracking/updateAvailableVehicles",
          "gpsTracking/setRawVehicleList",
          "gpsTracking/requestVehicleListWithScope/fulfilled",
          "gpsTracking/updateVehicleFilter/fulfilled",
          "route/fetchRouteListForUser/fulfilled", // ✅ NEW ACTION
          "alert/fetchAlertsPolicyList/fulfilled", // ✅ ALERT ACTION
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          "payload.connection",
          "payload.carData",
          "payload.rawVehicleList",
          "payload.availableVehicles",
          "payload.routes", // ✅ NEW PAYLOAD PATH
          "payload.policyList", // ✅ ALERT PAYLOAD PATH
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          "gpsTracking.connection",
          "gpsTracking.carData",
          "gpsTracking.rawVehicleList",
          "gpsTracking.availableVehicles",
          "route.routes", // ✅ NEW STATE PATH
          "alert.policyList", // ✅ ALERT STATE PATH
        ],
      },
      // Reduce immutability check time for large datasets
      immutableCheck: {
        warnAfter: 128, // Increase warning threshold from 32ms to 128ms
        ignoredPaths: [
          "gpsTracking.connection",
          "gpsTracking.carData",
          "gpsTracking.rawVehicleList",
          "gpsTracking.availableVehicles",
          "route.routes", // ✅ NEW IMMUTABILITY PATH
        ],
      },
      // Add thunk configuration for better async handling
      thunk: {
        extraArgument: {
          // You can add extra services here if needed
        },
      },
    }),
  // Optimize Redux DevTools for large datasets
  devTools: process.env.NODE_ENV !== 'production' && {
    maxAge: 50, // Limit action history to last 50 actions
    trace: false, // Disable stack trace for performance
    traceLimit: 25, // Limit trace to 25 actions
    actionSanitizer: (action) => {
      // Sanitize large payloads in DevTools
      if (action.type === 'gpsTracking/setRawVehicleList' && action.payload?.length > 100) {
        return {
          ...action,
          payload: `[${action.payload.length} vehicles] - Truncated for DevTools`,
        };
      }
      if (action.type === 'gpsTracking/updateCarData' && action.payload?.length > 50) {
        return {
          ...action,
          payload: `[${action.payload.length} car updates] - Truncated for DevTools`,
        };
      }
      if (action.type === 'gpsTracking/updateAvailableVehicles' && action.payload?.length > 100) {
        return {
          ...action,
          payload: `[${action.payload.length} available vehicles] - Truncated for DevTools`,
        };
      }
      // ✅ NEW ROUTE ACTION SANITIZER
      if (action.type === 'route/fetchRouteListForUser/fulfilled' && action.payload?.length > 50) {
        return {
          ...action,
          payload: `[${action.payload.length} routes] - Truncated for DevTools`,
        };
      }
      return action;
    },
    stateSanitizer: (state) => {
      // Sanitize large state objects in DevTools
      if (state.gpsTracking) {
        return {
          ...state,
          gpsTracking: {
            ...state.gpsTracking,
            rawVehicleList: state.gpsTracking.rawVehicleList?.length > 100 
              ? `[${state.gpsTracking.rawVehicleList.length} vehicles] - Truncated for DevTools`
              : state.gpsTracking.rawVehicleList,
            carData: state.gpsTracking.carData?.length > 50
              ? `[${state.gpsTracking.carData.length} cars] - Truncated for DevTools`
              : state.gpsTracking.carData,
            availableVehicles: state.gpsTracking.availableVehicles?.length > 100
              ? `[${state.gpsTracking.availableVehicles.length} available] - Truncated for DevTools`
              : state.gpsTracking.availableVehicles,
          },
          // ✅ NEW ROUTE STATE SANITIZER
          route: {
            ...state.route,
            routes: state.route?.routes?.length > 50
              ? `[${state.route.routes.length} routes] - Truncated for DevTools`
              : state.route?.routes,
          },
        };
      }
      return state;
    },
  },
  // Add preloaded state handling if needed
  preloadedState: undefined,
  // Enhance store for better debugging
  enhancers: (getDefaultEnhancers) => {
    if (process.env.NODE_ENV === 'development') {
      return getDefaultEnhancers().concat(
        // Add any custom enhancers for development
      );
    }
    return getDefaultEnhancers();
  },
});

// Add store subscription for debugging large state changes
if (process.env.NODE_ENV === 'development') {
  let previousState = store.getState();
  
  store.subscribe(() => {
    const currentState = store.getState();
    
    // Monitor large state changes
    const prevVehicleCount = previousState.gpsTracking?.rawVehicleList?.length || 0;
    const currVehicleCount = currentState.gpsTracking?.rawVehicleList?.length || 0;
    
    if (Math.abs(currVehicleCount - prevVehicleCount) > 1000) {
      console.warn(
        `🚨 Large vehicle list change detected: ${prevVehicleCount} → ${currVehicleCount}`
      );
    }
    
    const prevCarCount = previousState.gpsTracking?.carData?.length || 0;
    const currCarCount = currentState.gpsTracking?.carData?.length || 0;
    
    if (Math.abs(currCarCount - prevCarCount) > 500) {
      console.warn(
        `🚨 Large car data change detected: ${prevCarCount} → ${currCarCount}`
      );
    }
    
    // ✅ NEW ROUTE MONITORING
    const prevRouteCount = previousState.route?.routes?.length || 0;
    const currRouteCount = currentState.route?.routes?.length || 0;
    
    if (Math.abs(currRouteCount - prevRouteCount) > 100) {
      console.warn(
        `🚨 Large route data change detected: ${prevRouteCount} → ${currRouteCount}`
      );
    }
    
    previousState = currentState;
  });
}

// Performance monitoring for store operations
if (process.env.NODE_ENV === 'development') {
  const originalDispatch = store.dispatch;
  
  store.dispatch = function(action) {
    const start = performance.now();
    const result = originalDispatch(action);
    const end = performance.now();
    
    // Log slow actions
    if (end - start > 50) {
      console.warn(
        `⚠️ Slow action detected: ${action.type} took ${Math.round(end - start)}ms`
      );
    }
    
    return result;
  };
}

export default store;
