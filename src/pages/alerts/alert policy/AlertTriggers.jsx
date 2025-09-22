import { useState } from "react";
import SelectedPlaceModal from "./SelectedPlaceModal";

const AlertTriggers = ({
  alertType,
  selectedLocationOption,
  setSelectedLocationOption,
  selectedIdlingOption,
  setSelectedIdlingOption,
  geofenceOption,
  setGeofenceOption,
  geofenceTime,
  setGeofenceTime,
  geofenceDuration,
  setGeofenceDuration,
  interruptionOption,
  setInterruptionOption,
  longStopOption,
  setLongStopOption,
  seatBeltOption,
  setSeatBeltOption,
  ignoreSeatbeltActivity,
  setIgnoreSeatbeltActivity,
  speedExceedingFrom,
  setSpeedExceedingFrom,
  speedExceedingTo,
  setSpeedExceedingTo,
  speedExceedingTime,
  setSpeedExceedingTime,
  speedExceedingOption,
  setSpeedExceedingOption,
  speedingThreshold,
  setSpeedingThreshold,
  speedingType,
  setSpeedingType,
  speedingCount,
  setSpeedingCount,
  speedingPlaceChecked,
  setSpeedingPlaceChecked,
  tempRangeType,
  setTempRangeType,
  tempStart,
  setTempStart,
  tempEnd,
  setTempEnd,
  tempDuration,
  setTempDuration,
  unAssignedDriverMinutes,
  setUnAssignedDriverMinutes,
  gpsDistanceKm,
  setGpsDistanceKm,
}) => {
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const alertTypeLower = alertType?.toLowerCase() || "";

  if (alertTypeLower === "activity") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: "var(--text-color)" }}
        >
          This alert will trigger if a vehicle registers activity. Activity can
          be:
        </p>

        {/* Activity Options */}
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="activityTrigger"
              value="anyActivity"
              defaultChecked
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: "var(--primary-color)",
                boxShadow: "none",
                outline: "none",
                border: "2px solid #3b82f6",
              }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Any activity during the monitoring time range
            </span>
          </label>

          <p className="text-xs text-blue-600 ml-6">
            Includes ignition on/off, traveling, and any other sensors you have
            installed.
          </p>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="activityTrigger"
              value="movementOnly"
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: "var(--primary-color)",
                boxShadow: "none",
                outline: "none",
                border: "2px solid #3b82f6",
              }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Movement only during the monitoring time range
            </span>
          </label>

          {/* Time Threshold */}
          <div className="ml-6 flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--text-color)" }}>
              Time Threshold
            </span>
            <input
              type="text"
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
              style={{
                color: "var(--text-color)",
                "--tw-ring-color": "var(--primary-color)",
              }}
            />
            <span className="text-sm" style={{ color: "var(--text-color)" }}>
              Minutes
            </span>
          </div>

          <p className="text-xs text-blue-600 ml-6">
            This would be limited to where the vehicle is moving and the speed
            is greater than zero.
          </p>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="activityTrigger"
              value="fobKeyDetection"
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: "var(--primary-color)",
                boxShadow: "none",
                outline: "none",
                border: "2px solid #3b82f6",
              }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Fob Key Detection
            </span>
          </label>

          <p className="text-xs text-blue-600 ml-6">
            Alert will trigger when Driver Fob Key is detected
          </p>

          <label className="flex items-center cursor-pointer opacity-50">
            <input
              type="radio"
              name="activityTrigger"
              value="activityAfterIdling"
              disabled
              className="h-4 w-4 rounded-full transition-colors cursor-not-allowed"
              style={{
                accentColor: "var(--primary-color)",
                boxShadow: "none",
                outline: "none",
                border: "2px solid #9ca3af",
              }}
            />
            <span className="ml-2 text-sm text-gray-400">
              Activity after idling
            </span>
          </label>

          <p className="text-xs text-gray-400 ml-6">
            Decide if you want to continue monitoring the vehicle when it is
            idling.
          </p>
        </div>

        {/* Location Options */}
        <div className="mt-6 space-y-3">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="locationCheck"
                value="onlyCheckActivity"
                checked={selectedLocationOption === "onlyCheckActivity"}
                onChange={(e) => setSelectedLocationOption(e.target.value)}
                className="h-4 w-4 rounded-full transition-colors cursor-pointer"
                style={{
                  accentColor: "var(--primary-color)",
                  boxShadow: "none",
                  outline: "none",
                  border: "2px solid #3b82f6",
                }}
              />
              <span
                className="ml-2 text-sm"
                style={{ color: "var(--text-color)" }}
              >
                Only Check Activity within selected places.
              </span>
            </label>

            {selectedLocationOption === "onlyCheckActivity" && (
              <button
                className="ml-6 mt-2 text-blue-600 text-sm hover:underline cursor-pointer"
                style={{ color: "var(--primary-color)" }}
                onClick={() => setIsPlaceModalOpen(true)}
              >
                Select places
              </button>
            )}
          </div>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="locationCheck"
                value="ignoreActivity"
                checked={selectedLocationOption === "ignoreActivity"}
                onChange={(e) => setSelectedLocationOption(e.target.value)}
                className="h-4 w-4 rounded-full transition-colors cursor-pointer"
                style={{
                  accentColor: "var(--primary-color)",
                  boxShadow: "none",
                  outline: "none",
                  border: "2px solid #3b82f6",
                }}
              />
              <span
                className="ml-2 text-sm"
                style={{ color: "var(--text-color)" }}
              >
                Ignore Activity within selected places.
              </span>
            </label>

            {selectedLocationOption === "ignoreActivity" && (
              <button
                className="ml-6 mt-2 text-blue-600 text-sm hover:underline cursor-pointer"
                style={{ color: "var(--primary-color)" }}
                onClick={() => setIsPlaceModalOpen(true)}
              >
                Select places
              </button>
            )}
          </div>
        </div>
        {isPlaceModalOpen && (
          <SelectedPlaceModal
            isOpen={isPlaceModalOpen}
            onClose={() => setIsPlaceModalOpen(false)}
          />
        )}
      </div>
    );
  }

  if (alertTypeLower === "driving hours exceeding alert") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <span
            className="font-normal text-sm"
            style={{ color: "var(--text-color)" }}
          >
            When selected vehicle Exceed driving duration in a day above
            specified duration
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <input
            type="text"
            className="w-46 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Minutes of Maximum Driving in a day
          </span>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "excess idling") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-4">
          <span
            className="font-normal text-sm"
            style={{ color: "var(--text-color)" }}
          >
            When selected vehicles is idling above specified duration
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Minutes of excess idle
          </span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="idlingPlaceOption"
              value="ignoreIdling"
              checked={selectedIdlingOption === "ignoreIdling"}
              onChange={(e) => setSelectedIdlingOption(e.target.value)}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: "var(--primary-color)",
                boxShadow: "none",
                outline: "none",
                border: "2px solid #3b82f6",
              }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Ignore idling in the following places
            </span>
          </label>
          {selectedIdlingOption === "ignoreIdling" && (
            <button
              className="ml-6 mt-2 text-blue-600 text-sm hover:underline cursor-pointer"
              style={{ color: "var(--primary-color)" }}
              onClick={() => setIsPlaceModalOpen(true)}
            >
              Select Places
            </button>
          )}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="idlingPlaceOption"
              value="includeIdling"
              checked={selectedIdlingOption === "includeIdling"}
              onChange={(e) => setSelectedIdlingOption(e.target.value)}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: "var(--primary-color)",
                boxShadow: "none",
                outline: "none",
                border: "2px solid #3b82f6",
              }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Include idling only in the following places
            </span>
          </label>
          {selectedIdlingOption === "includeIdling" && (
            <button
              className="ml-6 mt-2 text-blue-600 text-sm hover:underline cursor-pointer"
              style={{ color: "var(--primary-color)" }}
              onClick={() => setIsPlaceModalOpen(true)}
            >
              Select Places
            </button>
          )}
        </div>
        {isPlaceModalOpen && (
          <SelectedPlaceModal
            isOpen={isPlaceModalOpen}
            onClose={() => setIsPlaceModalOpen(false)}
          />
        )}
      </div>
    );
  }

  if (alertTypeLower === "fatigue driving alert") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            Fatigue Driving Event occour when :
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Minutes of continuous driving exceeded
          </span>
        </div>
        <div className="mb-2 font-semibold text-gray-500">OR</div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Rest duration is less than specified minutes after 1 hour driving
            duration
          </span>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "fuel level change alert") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert is triggered Fuel level is changed :
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-64">
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Scale level
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            ltr
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-64 mt-2">
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Duration
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Mins
          </span>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "geofence") {
    const geofenceTimes = [
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
      "07:00 PM",
      "08:00 PM",
      "09:00 PM",
      "10:00 PM",
      "11:00 PM",
    ];

    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            When selected vehicles and drivers :
          </span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="geofenceOption"
              value="entered"
              checked={geofenceOption === "entered"}
              onChange={() => setGeofenceOption("entered")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Entered a Geofence
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="geofenceOption"
              value="exited"
              checked={geofenceOption === "exited"}
              onChange={() => setGeofenceOption("exited")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Exited a Geofence
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="geofenceOption"
              value="both"
              checked={geofenceOption === "both"}
              onChange={() => setGeofenceOption("both")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Both entered and exited a Geofence
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="geofenceOption"
              value="stopped"
              checked={geofenceOption === "stopped"}
              onChange={() => setGeofenceOption("stopped")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Stopped within a Geofence
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="geofenceOption"
              value="notEntered"
              checked={geofenceOption === "notEntered"}
              onChange={() => setGeofenceOption("notEntered")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Has not entered a Geofence by a specified time
            </span>
            {geofenceOption === "notEntered" && (
              <select
                className="ml-4 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
                style={{ color: "var(--text-color)" }}
                value={geofenceTime}
                onChange={(e) => setGeofenceTime(e.target.value)}
              >
                <option value="">Select time</option>
                {geofenceTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="geofenceOption"
              value="longerThan"
              checked={geofenceOption === "longerThan"}
              onChange={() => setGeofenceOption("longerThan")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Has been in a Geofence for longer than specified time(minutes)
            </span>
            {geofenceOption === "longerThan" && (
              <input
                type="text"
                className="ml-4 w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
                style={{ color: "var(--text-color)" }}
                value={geofenceDuration}
                onChange={(e) => setGeofenceDuration(e.target.value)}
                placeholder="Minutes"
              />
            )}
          </label>
        </div>
        <div className="mt-4">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            Choose the Geofences you would like to monitor here
          </span>
          <br />
          <button
            className="mt-2 text-blue-600 text-sm hover:underline cursor-pointer"
            style={{ color: "var(--primary-color)" }}
            onClick={() => setIsPlaceModalOpen(true)}
          >
            Select Places
          </button>
        </div>
        {isPlaceModalOpen && (
          <SelectedPlaceModal
            isOpen={isPlaceModalOpen}
            onClose={() => setIsPlaceModalOpen(false)}
          />
        )}
      </div>
    );
  }

  if (alertTypeLower === "ignition") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This Alert is triggered when vehicle is :
          </span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="ignitionOption"
              value="on"
              defaultChecked
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Ignition ON
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="ignitionOption"
              value="off"
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Ignition OFF
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="ignitionOption"
              value="both"
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Both Ignition ON and OFF
            </span>
          </label>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "inactivity") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          This alert is triggered when vehicle is inactive for specified Period
          of Time :
        </h3>
        <div className="grid grid-cols-3 gap-2 items-center w-64">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-color)" }}
          >
            Hours:
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-64 mt-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-color)" }}
          >
            Minutes:
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
        </div>
      </div>
    );
  }

  if (alertTypeLower === "interruption of transmission") {
    const handleResetSelection = () => setInterruptionOption("");

    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert will activate based on interruption of transmission of
            data above a given threshold in non-coverage areas.
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            minutes of interruption
          </span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="interruptionOption"
              value="onlyCheck"
              checked={interruptionOption === "onlyCheck"}
              onChange={() => setInterruptionOption("onlyCheck")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Only Check Activity within selected places.
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="interruptionOption"
              value="ignoreActivity"
              checked={interruptionOption === "ignoreActivity"}
              onChange={() => setInterruptionOption("ignoreActivity")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Ignore Activity within selected places.
            </span>
          </label>
        </div>
        <button
          className="mt-4 text-gray-400 text-sm cursor-pointer"
          type="button"
          onClick={handleResetSelection}
        >
          Reset Selection
        </button>
      </div>
    );
  }

  if (alertTypeLower === "late start") {
    const startTimeOptions = [
      "First Ignition On",
      "First movement",
      "Arrival at first stop",
      "Arrival at first Work Order",
      "Arrival at a place",
      "Departure from a place",
    ];

    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert will activate based on vehicle activity occurring after a
            set time
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Late start time
          </span>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          * This time will be compared to the vehicle's local time
        </div>
        <div className="mb-2 text-sm" style={{ color: "var(--text-color)" }}>
          The start time of day should be defined by
        </div>
        <div>
          <select
            className="w-64 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
          >
            {startTimeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "long stop") {
    const handleLongStopReset = () => setLongStopOption("");

    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert notifies when a vehicle stops for longer than a set
            amount of time.
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{
              color: "var(--text-color)",
              "--tw-ring-color": "var(--primary-color)",
            }}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Minutes of long stop
          </span>
        </div>
        <hr />
        <div
          className="mt-4 font-bold text-sm"
          style={{ color: "var(--text-color)" }}
        >
          Ignore activity when
        </div>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="longStopOption"
              value="ignoreStop"
              checked={longStopOption === "ignoreStop"}
              onChange={() => setLongStopOption("ignoreStop")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Ignore stop in the following places
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="longStopOption"
              value="includeOnlyStop"
              checked={longStopOption === "includeOnlyStop"}
              onChange={() => setLongStopOption("includeOnlyStop")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Include only stop in the following places
            </span>
          </label>
        </div>
        <button
          className="mt-4 text-gray-400 text-sm cursor-pointer"
          type="button"
          onClick={handleLongStopReset}
        >
          Reset Selection
        </button>
      </div>
    );
  }

  if (alertTypeLower === "seat belt alert") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert is triggered when driver fasten/unfasten seatbelt.
          </span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="seatBeltOption"
              value="fasten"
              checked={seatBeltOption === "fasten"}
              onChange={() => setSeatBeltOption("fasten")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Seat Belt Fasten for the selected Vehicles
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="seatBeltOption"
              value="unfasten"
              checked={seatBeltOption === "unfasten"}
              onChange={() => setSeatBeltOption("unfasten")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Seat Belt Unfasten for the selected Vehicles
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="seatBeltOption"
              value="both"
              checked={seatBeltOption === "both"}
              onChange={() => setSeatBeltOption("both")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Both Seat Belt Fasten or Unfasten
            </span>
          </label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
              style={{
                color: "var(--text-color)",
                "--tw-ring-color": "var(--primary-color)",
              }}
              placeholder=""
            />
            <span className="text-sm" style={{ color: "var(--text-color)" }}>
              Duration (Seconds)
            </span>
          </div>
          <label className="flex items-center cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={ignoreSeatbeltActivity}
              onChange={() =>
                setIgnoreSeatbeltActivity(!ignoreSeatbeltActivity)
              }
              className="h-4 w-4 rounded transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Ignore Seatbelt Activity in the following places
            </span>
          </label>
          {ignoreSeatbeltActivity && (
            <button
              className="ml-6 mt-2 text-blue-600 text-sm hover:underline cursor-pointer"
              style={{ color: "var(--primary-color)" }}
              onClick={() => setIsPlaceModalOpen(true)}
            >
              Select Places
            </button>
          )}
        </div>
      </div>
    );
  }

  if (alertTypeLower === "speed exceeding alert") {
    const handleSpeedExceedingReset = () => {
      setSpeedExceedingFrom("");
      setSpeedExceedingTo("");
      setSpeedExceedingTime("");
      setSpeedExceedingOption("");
    };
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert is triggered when vehicle exceeds a set Speed/Posted
            Speed Limit/Road speed limit :
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-64 mb-2">
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            From Speed
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={speedExceedingFrom}
            onChange={(e) => setSpeedExceedingFrom(e.target.value)}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Km/h
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-64 mb-2">
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            To Speed
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={speedExceedingTo}
            onChange={(e) => setSpeedExceedingTo(e.target.value)}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Km/h
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-64 mb-2">
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Time
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={speedExceedingTime}
            onChange={(e) => setSpeedExceedingTime(e.target.value)}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Seconds
          </span>
        </div>
        <label className="flex items-center cursor-pointer mt-2">
          <input
            type="radio"
            name="speedExceedingOption"
            value="onlySend"
            checked={speedExceedingOption === "onlySend"}
            onChange={() => setSpeedExceedingOption("onlySend")}
            className="h-4 w-4 rounded-full transition-colors cursor-pointer"
            style={{ accentColor: "var(--primary-color)" }}
          />
          <span className="ml-2 text-sm" style={{ color: "var(--text-color)" }}>
            Only send Speeding Exceeding Alerts for incidents that occur within
            selected places.
          </span>
        </label>
        {speedExceedingOption === "onlySend" && (
          <button
            className="ml-6 text-blue-600 text-sm hover:underline cursor-pointer"
            style={{ color: "var(--primary-color)" }}
            type="button"
            onClick={() => setIsPlaceModalOpen(true)}
          >
            Select Places
          </button>
        )}
        <label className="flex items-center cursor-pointer mt-2">
          <input
            type="radio"
            name="speedExceedingOption"
            value="ignoreSend"
            checked={speedExceedingOption === "ignoreSend"}
            onChange={() => setSpeedExceedingOption("ignoreSend")}
            className="h-4 w-4 rounded-full transition-colors cursor-pointer"
            style={{ accentColor: "var(--primary-color)" }}
          />
          <span className="ml-2 text-sm" style={{ color: "var(--text-color)" }}>
            Ignore Speeding Exceeding Alerts for incidents that occur within
            selected places.
          </span>
        </label>
        {speedExceedingOption === "ignoreSend" && (
          <button
            className="ml-6 text-blue-600 text-sm hover:underline cursor-pointer"
            style={{ color: "var(--primary-color)" }}
            type="button"
            onClick={() => setIsPlaceModalOpen(true)}
          >
            Select Places
          </button>
        )}
        <button
          className="mt-4 text-gray-400 text-sm cursor-pointer"
          type="button"
          onClick={handleSpeedExceedingReset}
        >
          Reset Selection
        </button>
      </div>
    );
  }

  if (alertTypeLower === "speeding") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert is triggered when vehicle exceeds a set Speed/Posted
            Speed Limit/Road speed limit :
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            High Speed Event over
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={speedingThreshold}
            onChange={(e) => setSpeedingThreshold(e.target.value)}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Km/h
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            Do not send the alert until after :
          </span>
          <select
            value={speedingType}
            onChange={(e) => setSpeedingType(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
          >
            <option value="Consecutive">Consecutive</option>
            <option value="Non-Consecutive">Non-Consecutive</option>
          </select>
          <input
            type="number"
            min={1}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={speedingCount}
            onChange={(e) => setSpeedingCount(e.target.value)}
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            speeding messages occur
          </span>
        </div>
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={speedingPlaceChecked}
              onChange={() => setSpeedingPlaceChecked(!speedingPlaceChecked)}
              className="h-4 w-4 rounded transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Only send Speeding Alerts for incidents that occur within selected
              places.
            </span>
          </label>
          {speedingPlaceChecked && (
            <button
              className="ml-6 text-blue-600 text-sm hover:underline cursor-pointer"
              style={{ color: "var(--primary-color)" }}
              type="button"
              onClick={() => setIsPlaceModalOpen(true)}
            >
              Select places
            </button>
          )}
        </div>
        {isPlaceModalOpen && (
          <SelectedPlaceModal
            isOpen={isPlaceModalOpen}
            onClose={() => setIsPlaceModalOpen(false)}
          />
        )}
      </div>
    );
  }

  if (alertTypeLower === "temperature alert") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert is triggered when temperature exceeds or below the given
            range for specified duration :
          </span>
        </div>
        <div className="flex items-center gap-8 mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="tempRangeType"
              value="in"
              checked={tempRangeType === "in"}
              onChange={() => setTempRangeType("in")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Temp with in range
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="tempRangeType"
              value="out"
              checked={tempRangeType === "out"}
              onChange={() => setTempRangeType("out")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{ accentColor: "var(--primary-color)" }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: "var(--text-color)" }}
            >
              Temp out of range
            </span>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-full mb-4">
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-color)" }}
          >
            Start Temperature range in
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={tempStart}
            onChange={(e) => setTempStart(e.target.value)}
            placeholder=""
          />
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-color)" }}
          >
            °C
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-full mb-4">
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-color)" }}
          >
            End Temperature range in
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={tempEnd}
            onChange={(e) => setTempEnd(e.target.value)}
            placeholder=""
          />
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-color)" }}
          >
            °C
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center w-full mb-4">
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-color)" }}
          >
            Duration
          </span>
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={tempDuration}
            onChange={(e) => setTempDuration(e.target.value)}
            placeholder=""
          />
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-color)" }}
          >
            Mins
          </span>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "un-assigned driver") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert is triggered when driver is not assigned to vehicle and
            vehicle ignition is on for specified time period :
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={unAssignedDriverMinutes}
            onChange={(e) => setUnAssignedDriverMinutes(e.target.value)}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            Minutes
          </span>
        </div>
      </div>
    );
  }

  if (alertTypeLower === "variation of gps") {
    return (
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          Alert Triggers:
        </h3>
        <div className="mb-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-color)" }}
          >
            This alert will activate based on the variation of GPS position
            between voluntary disconnection and reconnection. activity occurring
            after a set Distance Travelled.
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
            style={{ color: "var(--text-color)" }}
            value={gpsDistanceKm}
            onChange={(e) => setGpsDistanceKm(e.target.value)}
            placeholder=""
          />
          <span className="text-sm" style={{ color: "var(--text-color)" }}>
            No of KM
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3
        className="text-sm font-medium mb-4"
        style={{ color: "var(--primary-color)" }}
      >
        Alert Triggers:
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--text-color)" }}
      >
        This alert is triggered when vehicle face high Impact values :
      </p>
    </div>
  );
};

export default AlertTriggers;
