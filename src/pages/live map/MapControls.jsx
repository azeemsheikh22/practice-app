import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsFullScreen,
  selectMapType,
  selectShowTraffic,
} from '../../features/mapControlsSlice';
import {
  toggleFullScreenThunk,
  changeMapTypeThunk,
  toggleTrafficThunk,
} from '../../features/mapControlsThunks';
import FullscreenButton from '../../components/map/FullscreenButton';
import MapTypeSelector from '../../components/map/MapTypeSelector';
import ZoomControls from '../../components/map/ZoomControls';
import mapicon from '../../assets/mapicon.png';

const MapControls = ({ mapCoreRef, onFitToMap }) => {
  const isFullScreen = useSelector(selectIsFullScreen);
  const mapType = useSelector(selectMapType);
  const showTraffic = useSelector(selectShowTraffic);
  const dispatch = useDispatch();

  const handleZoomIn = () => {
    const mapInstance = mapCoreRef.current?.getMapInstance();
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const mapInstance = mapCoreRef.current?.getMapInstance();
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const FitToMapButton = ({ onFitToMap, sidebarWidth = 340 }) => {
    return (
      <div className="absolute top-2 z-[700] left-2 transition-all duration-500 ease-in-out">
        <button
          onClick={onFitToMap}
          className="bg-white hover:bg-gray-50 shadow-lg rounded-sm py-2 px-3 cursor-pointer flex gap-2 text-gray-800 hover:text-gray-900 text-md font-medium justify-center items-center group transition-all duration-200 hover:scale-105 active:scale-95"
          title="Fit to Map"
        >
          <img
            src={mapicon}
            alt="fit"
            className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
          />
          <span className="hidden lg:inline-block text-sm font-medium">
            Fit Map
          </span>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Fit to Map Button */}
      <FitToMapButton onFitToMap={onFitToMap} />

      {/* Fullscreen Button */}
      <FullscreenButton
        isFullScreen={isFullScreen}
        toggleFullScreen={() => dispatch(toggleFullScreenThunk())}
      />

      {/* Map Type Selector */}
      <MapTypeSelector
        mapType={mapType}
        showTraffic={showTraffic}
        onChangeMapType={(type) => dispatch(changeMapTypeThunk(type))}
        onToggleTraffic={() => dispatch(toggleTrafficThunk())}
      />

      {/* Zoom Controls */}
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </>
  );
};

export default MapControls;
