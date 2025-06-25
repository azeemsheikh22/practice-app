import Navbar from "../../components/navber/Navbar";
import GeofenceHeader from "../../components/Geofence/GeofenceHeader";
import GeofenceFilter from "../../components/Geofence/GeofenceFilter";
import GeofenceTable from "../../components/Geofence/GeofenceTable";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGeofences } from "../../features/geofenceSlice";

export default function GeoFence() {
  const dispatch = useDispatch();
  const { geofences } = useSelector((state) => state.geofence);
  
  // FETCH DATA ON COMPONENT MOUNT
  useEffect(() => {
    if (!geofences || geofences.length === 0) {
      dispatch(fetchGeofences());
    }
  }, [dispatch, geofences]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <GeofenceHeader />
        <GeofenceFilter />
        <GeofenceTable />
      </div>
    </div>
  );
}
