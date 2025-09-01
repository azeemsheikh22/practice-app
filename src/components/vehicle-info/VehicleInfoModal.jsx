import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Car } from "lucide-react";

const VehicleInfoModal = ({ isOpen, onClose, vehicleData }) => {
  const [activeTab, setActiveTab] = useState("details");

  // Form state for edit fields
  const [form, setForm] = useState({
    registration: vehicleData?.registration || "",
    registrationType: vehicleData?.registrationType || "Private",
    vehicleName: vehicleData?.carname || "",
    vehicleNumber: vehicleData?.vehicleNumber || "",
    notes: vehicleData?.notes || "",
    odometer: vehicleData?.mileage || "",
    hoursOfUse: vehicleData?.hoursOfUse || 0,
    immobilizer: vehicleData?.immobilizer || true,
    hasTechno: vehicleData?.hasTechno || false,
    currentDriver: vehicleData?.driver || "",
    hideFromSelection: vehicleData?.hideFromSelection || false,
    keyFobAlarm: vehicleData?.keyFobAlarm || false,
  });

  useEffect(() => {
    // Reset form when vehicleData changes
    setForm({
      registration: vehicleData?.registration || "",
      registrationType: vehicleData?.registrationType || "Private",
      vehicleName: vehicleData?.carname || "",
      vehicleNumber: vehicleData?.vehicleNumber || "",
      notes: vehicleData?.notes || "",
      odometer: vehicleData?.mileage || "",
      hoursOfUse: vehicleData?.hoursOfUse || 0,
      immobilizer: vehicleData?.immobilizer || true,
      hasTechno: vehicleData?.hasTechno || false,
      currentDriver: vehicleData?.driver || "",
      hideFromSelection: vehicleData?.hideFromSelection || false,
      keyFobAlarm: vehicleData?.keyFobAlarm || false,
    });
  }, [vehicleData]);

  if (!isOpen) return null;
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  }

  // Dummy driver list for select
  const driverList = [
    "Munir Ahmad Javed",
    "Ali Raza",
    "John Doe",
    "Jane Smith"
  ];

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Tab names as per user request
  const tabs = [
    { id: "details", label: "Details" },
    { id: "assignment", label: "Assignment History" },
    { id: "vehicleinfo", label: "Vehicle Information" },
    { id: "contact", label: "Contact Information" },
  ];

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[906]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl z-10 mx-4" style={{maxHeight: '80vh'}}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Car size={20} className="text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Vehicle
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap cursor-pointer ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 overflow-y-auto" style={{maxHeight: '50vh'}}>
          {activeTab === "details" && (
            <form className="flex flex-col md:flex-row gap-6">
              {/* Car image and group access */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-48 w-full mb-4 cursor-pointer">
                  <Car size={100} className="text-gray-400" />
                </div>
                <div className="text-xs text-gray-600 mb-2 cursor-pointer">Group Access:<br /><span className="text-blue-600">Member of 4 Groups</span></div>
              </div>
              {/* Form fields */}
              <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Registration #</label>
                  <input name="registration" value={form.registration} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Registration Type</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center text-sm cursor-pointer">
                      <input type="radio" name="registrationType" value="Private" checked={form.registrationType === "Private"} onChange={handleChange} className="mr-1 cursor-pointer" /> Private
                    </label>
                    <label className="flex items-center text-sm cursor-pointer">
                      <input type="radio" name="registrationType" value="Business" checked={form.registrationType === "Business"} onChange={handleChange} className="mr-1 cursor-pointer" /> Business
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Vehicle Name</label>
                  <input name="vehicleName" value={form.vehicleName} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm cursor-pointer" rows={2} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Vehicle Number</label>
                  <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Current odometer</label>
                  <div className="flex items-center gap-2">
                    <input name="odometer" type="number" value={form.odometer} onChange={handleChange} className="w-24 border rounded px-2 py-1 text-sm cursor-pointer" />
                    <button type="button" className="text-blue-600 text-xs underline cursor-pointer">Change</button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 cursor-pointer">Last modified: -</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Current hours of use</label>
                  <div className="flex items-center gap-2">
                    <input name="hoursOfUse" type="number" value={form.hoursOfUse} onChange={handleChange} className="w-24 border rounded px-2 py-1 text-sm cursor-pointer" />
                    <button type="button" className="text-blue-600 text-xs underline cursor-pointer">Change</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Immobilizer :</label>
                  <span className="ml-1 text-green-700 font-semibold cursor-pointer">ACTIVATED</span>
                  <div className="mt-1">
                    <label className="flex items-center text-xs cursor-pointer">
                      <input type="checkbox" name="hasTechno" checked={form.hasTechno} onChange={handleChange} className="mr-1 cursor-pointer" />
                      Vehicle has a digital technograph installed
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Current driver</label>
                  <div className="flex gap-2 items-center">
                    <select name="currentDriver" value={form.currentDriver} onChange={handleChange} className="border rounded px-2 py-1 text-sm cursor-pointer">
                      <option value="">Select driver</option>
                      {driverList.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="button" className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 cursor-pointer">Assign</button>
                  </div>
                  <div className="text-xs text-blue-600 mt-1 cursor-pointer">Assignment Options</div>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" name="hideFromSelection" checked={form.hideFromSelection} onChange={handleChange} className="mr-1 cursor-pointer" />
                  <span className="text-xs cursor-pointer">Hide from vehicle selections</span>
                </div>
                <div className="col-span-2 mt-4">
                  <label className="block text-xs text-gray-500 mb-1 cursor-pointer">Key Fob Alarm</label>
                  <button type="button" className={`px-3 py-1 rounded border mr-2 cursor-pointer ${form.keyFobAlarm ? 'bg-gray-200' : 'bg-green-100'}`}>Enable</button>
                  <button type="button" className={`px-3 py-1 rounded border cursor-pointer ${!form.keyFobAlarm ? 'bg-gray-200' : 'bg-red-100'}`}>Disable</button>
                </div>
              </div>
            </form>
          )}
          {activeTab !== "details" && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-base">
              {activeTab === "assignment" && <span>Assignment History tab content coming soon.</span>}
              {activeTab === "vehicleinfo" && <span>Vehicle Information tab content coming soon.</span>}
              {activeTab === "contact" && <span>Contact Information tab content coming soon.</span>}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

// Helper component for displaying information items
const InfoItem = ({ label, value, statusColor }) => {
  return (
    <div className="bg-gray-50 rounded-md p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-medium ${statusColor || 'text-gray-800'}`}>{value}</div>
    </div>
  );
};

// Helper function to determine status color
const getStatusColor = (status) => {
  if (!status) return "";
  
  switch (status.toLowerCase()) {
    case "moving":
    case "run":
      return "text-green-600";
    case "idle":
      return "text-yellow-600";
    case "stop":
      return "text-red-600";
    case "offline":
      return "text-gray-600";
    default:
      return "text-blue-600";
  }
};

// Helper function to format date time
const formatDateTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    const date = new Date(timeString);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    return "N/A";
  }
};

// Helper function to format voltage
const formatVoltage = (voltage) => {
  if (voltage === null || voltage === undefined) return "N/A";
  if (typeof voltage === "string" && voltage.includes(",")) {
    const parts = voltage.split(",");
    return (
      (parts[1]
        ? parseFloat(parts[1]).toFixed(2)
        : parseFloat(parts[0]).toFixed(2)) + " V"
    );
  }
  if (voltage !== "N/A") {
    return parseFloat(voltage).toFixed(2) + " V";
  }
  return "N/A";
};

export default VehicleInfoModal;
