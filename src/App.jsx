import { useDispatch } from "react-redux";
import "./App.css";
import AllRoute from "./router";
import { useEffect } from "react";
import SessionManager from "./auth/SessionManager";
import { fetchGeofenceCatList } from "./features/geofenceSlice";
import { Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGeofenceCatList());
  }, [dispatch]);

  

  return (
    <>
      <Toaster position="top-center" />
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
