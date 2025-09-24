import { Edit2, Users, Clock, Bell, MapPin } from "lucide-react";

const PolicyReview = ({ policyData, onEdit, onSave, onCancel }) => {
  const {
    // policyName,
    alertType,
    selectedVehicles,
    selectedGroups,
    selectedDrivers,
    entireFleetEnabled,
    // selectedLocationOption,
    // selectedIdlingOption,
    // excessIdleMinutes,
    // geofenceOption,
    // geofenceTime,
    // geofenceDuration,
    // interruptionOption,
    // longStopOption,
    // seatBeltOption,
    // ignoreSeatbeltActivity,
    // speedExceedingFrom,
    // speedExceedingTo,
    // speedExceedingTime,
    // speedExceedingOption,
    // speedingThreshold,
    // speedingType,
    // speedingCount,
    // speedingPlaceChecked,
    // tempRangeType,
    // tempStart,
    // tempEnd,
    // tempDuration,
    // unAssignedDriverMinutes,
    // gpsDistanceKm,
    selectedPlaces,
    timeRange,
    customDaysChecked,
    customDaysStart,
    customDaysEnd,
    alertFrequency,
    limitAlertsPerDriver,
    additionalEmails,
    smsDeliveryOption,
    customizeEmailIntro,
    customEmailText,
    onlyIncludeDrivers,
    controlGroupOption,
    userSelections,
    idlingTrigger,
  } = policyData;

  //   const getTotalSelectedCount = () => {
  //     if (!selectedPlaces) return 0;
  //     return (
  //       (selectedPlaces.geofences?.length || 0) +
  //       (selectedPlaces.categories?.length || 0) +
  //       (selectedPlaces.routes?.length || 0)
  //     );
  //   };

  const formatTimeRange = () => {
    if (timeRange === "everyDay") return "Every day (24 Hours)";
    if (timeRange === "custom") {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const selectedDays = customDaysChecked
        .map((checked, index) =>
          checked
            ? `${days[index]} (${customDaysStart[index]} - ${customDaysEnd[index]})`
            : null
        )
        .filter(Boolean);
      return selectedDays.length > 0
        ? selectedDays.join(", ")
        : "Custom schedule";
    }
    return timeRange || "Not configured";
  };

  const getRecipientCount = () => {
    if (!userSelections) return 0;
    return Object.values(userSelections).reduce((count, user) => {
      return (
        count + (user.email ? 1 : 0) + (user.sms ? 1 : 0) + (user.push ? 1 : 0)
      );
    }, 0);
  };

  const getSmsDeliveryText = () => {
    switch (smsDeliveryOption) {
      case "none":
        return "None";
      case "primary":
        return "Primary Contact Person";
      case "secondary":
        return "Secondary Contact Person";
      default:
        return "Not configured";
    }
  };

  const InfoCard = ({ title, children, editAction }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--text-color)" }}
          >
            {title}
          </h3>
        </div>
        <button
          onClick={() => onEdit(editAction)}
          className="flex items-center cursor-pointer gap-2 px-2 py-1 text-xs rounded border hover:bg-gray-50 transition-colors"
          style={{
            color: "var(--primary-color)",
            borderColor: "var(--primary-color)",
          }}
        >
          <Edit2 size={12} />
          Edit
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-start py-1">
      <span
        className="text-xs font-medium text-gray-600"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}:
      </span>
      <span
        className="text-xs font-semibold text-right max-w-xs ml-4"
        style={{ color: "var(--text-color)" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div
      className="min-h-screen p-4"
      style={{ backgroundColor: "var(--background-color)" }}
    >
      <div>
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Resources */}
          <InfoCard icon={Users} title="Resources" editAction="vehicle">
            {entireFleetEnabled ? (
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--primary-color)" }}
                >
                  Entire Fleet Enabled
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedVehicles?.length > 0 && (
                  <div>
                    <span
                      className="text-xs font-medium block mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Vehicles ({selectedVehicles.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedVehicles.slice(0, 15).map((vehicle, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200"
                        >
                          {vehicle.text ||
                            vehicle.name ||
                            vehicle.vehicleNumber ||
                            vehicle.vehicleName ||
                            vehicle.VehicleReg ||
                            vehicle}
                        </span>
                      ))}
                      {selectedVehicles.length > 15 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{selectedVehicles.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {selectedGroups?.length > 0 && (
                  <div>
                    <span
                      className="text-xs font-medium block mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Groups ({selectedGroups.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedGroups.slice(0, 3).map((group, index) => (
                        <span
                          key={index}
                          className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200"
                        >
                          {group.text || group.name || group.groupName || group}
                        </span>
                      ))}
                      {selectedGroups.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{selectedGroups.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {selectedDrivers?.length > 0 && (
                  <div>
                    <span
                      className="text-xs font-medium block mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Drivers ({selectedDrivers.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDrivers.slice(0, 3).map((driver, index) => (
                        <span
                          key={index}
                          className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs border border-purple-200"
                        >
                          {driver.text ||
                            driver.name ||
                            driver.driverName ||
                            driver.fullName ||
                            driver}
                        </span>
                      ))}
                      {selectedDrivers.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{selectedDrivers.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {!selectedVehicles?.length &&
                  !selectedGroups?.length &&
                  !selectedDrivers?.length && (
                    <div className="text-center py-2 text-gray-500 text-xs">
                      No resources selected
                    </div>
                  )}
              </div>
            )}
          </InfoCard>

          {/* Time & Frequency */}
          <InfoCard icon={Clock} title="Time & Frequency" editAction="time">
            <InfoRow
              label="Active Time"
              value={
                timeRange === "everyDay"
                  ? "Every day (24 Hours)"
                  : timeRange === "weekdays"
                  ? "Weekdays only (Monday - Friday, 24 Hours)"
                  : timeRange === "weekends"
                  ? "Weekends only (Saturday - Sunday, 24 Hours)"
                  : formatTimeRange()
              }
            />

            {/* Alert Frequency Section */}
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
              {/* Alert Trigger Information */}
              {alertType === "Excess Idling" ||
              alertType === "Activity" ||
              alertType === "Late Start" ||
              alertType === "Long Stop" ||
              alertType === "Seat belt Alert" ||
              alertType === "Speeding" ||
              alertType === "Towing" ? (
                <InfoRow label="Alert Frequency" value={idlingTrigger} />
              ) : (
                ""
              )}
              <InfoRow
                label="Limit Alerts per Driver"
                value={`${limitAlertsPerDriver}`}
              />
              <InfoRow label="Total Daily Limit" value={`${alertFrequency}`} />
            </div>
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <InfoCard
            icon={Bell}
            title="Alert Recipients"
            editAction="recipients"
          >
            {userSelections && Object.keys(userSelections).length > 0 ? (
              <div>
                <span
                  className="text-xs font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Selected Recipients ({getRecipientCount()} notifications):
                </span>
                <div className="space-y-1">
                  {Object.entries(userSelections)
                    .filter(([userId, user]) => user.display || user.email)
                    .slice(0, 3)
                    .map(([userId, user]) => (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--text-color)" }}
                        >
                          {user.userInfo?.fullName ||
                            user.userInfo?.name ||
                            userId}
                        </span>
                        <div className="flex gap-1">
                          {user.display && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                              Display
                            </span>
                          )}
                          {user.email && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                              Email
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  {Object.keys(userSelections).filter(
                    ([userId, user]) => user.display || user.email
                  ).length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +
                      {Object.keys(userSelections).filter(
                        ([userId, user]) => user.display || user.email
                      ).length - 3}{" "}
                      more recipients
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-gray-500 text-xs">
                No recipients selected
              </div>
            )}

            {/* Delivery Options Section */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <h4
                className="text-xs font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Delivery Options:
              </h4>

              <div className="space-y-1">
                <InfoRow label="SMS Delivery" value={getSmsDeliveryText()} />

                {additionalEmails && additionalEmails.trim() && (
                  <div>
                    <span
                      className="text-xs font-medium block mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Additional Emails:
                    </span>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-color)" }}
                      >
                        {additionalEmails}
                      </p>
                    </div>
                  </div>
                )}

                <InfoRow
                  label="Customize Email Introduction"
                  value={customizeEmailIntro ? "Yes" : "No"}
                />

                {customizeEmailIntro && (
                  <div>
                    <span
                      className="text-xs font-medium block mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Custom Email Message:
                    </span>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <p
                        className="text-xs whitespace-pre-wrap"
                        style={{ color: "var(--text-color)" }}
                      >
                        {customEmailText || "No custom message entered"}
                      </p>
                    </div>
                  </div>
                )}

                <InfoRow
                  label="Only Include Drivers with Access"
                  value={
                    onlyIncludeDrivers
                      ? `Yes - Using ${
                          controlGroupOption === "all"
                            ? "All Groups for that user"
                            : "Only the admin control group"
                        }`
                      : "No"
                  }
                />
              </div>
            </div>
          </InfoCard>

          {/* Alert Option - Full Width */}
          <InfoCard icon={MapPin} title="Alert Option" editAction="alerts">
            <div className="space-y-1">
              <InfoRow label="Alert Type" value={alertType} />
            </div>

            {/* More Details Button */}
            <div className="mt-2 pt-2 border-t border-gray-100 text-center">
              <button
                onClick={() => onEdit("alerts")}
                className="flex items-center  gap-1 px-3 py-1 text-xs rounded border hover:bg-gray-50 transition-colors mx-auto cursor-pointer"
                style={{
                  color: "var(--primary-color)",
                  borderColor: "var(--primary-color)",
                }}
              >
                More Details
              </button>
            </div>

            {/* Selected Places */}
            {/* {getTotalSelectedCount() > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4
                className="text-sm font-medium mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Selected Places:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlaces?.geofences?.length > 0 && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                    {selectedPlaces.geofences.length} Geofences
                  </span>
                )}
                {selectedPlaces?.categories?.length > 0 && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                    {selectedPlaces.categories.length} Categories
                  </span>
                )}
                {selectedPlaces?.routes?.length > 0 && (
                  <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm border border-orange-200">
                    {selectedPlaces.routes.length} Routes
                  </span>
                )}
              </div>
            </div>
          )} */}
          </InfoCard>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-6 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 cursor-pointer text-white rounded font-medium transition-colors hover:opacity-90 text-sm"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyReview;
