import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import AllRoute from "./router";
import {
  initializeConnection,
  selectConnectionStatus,
} from "./features/gpsTrackingSlice";
import { useEffect } from "react";
import SessionManager from "./auth/SessionManager";
import { fetchGeofenceCatList } from "./features/geofenceSlice";

function App() {
  const dispatch = useDispatch();
  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    dispatch(fetchGeofenceCatList());
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, [connectionStatus, dispatch]);



  return (
    <>
      <div className="app-main">
        <SessionManager
          sessionTimeout={30 * 60 * 1000} // 30 minutes (changed from 2 minutes)
          checkInterval={30 * 1000} // Check every 30 seconds
          warningTime={2 * 60 * 1000} // Warning 2 minutes before (changed from 30 seconds)
        >
          <AllRoute />
        </SessionManager>
      </div>
    </>
  );
}

export default App;
