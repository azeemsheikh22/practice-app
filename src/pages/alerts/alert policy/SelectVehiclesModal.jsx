import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { selectRawVehicleList } from "../../../features/gpsTrackingSlice";
import { useSelector } from "react-redux";

const SelectVehiclesModal = ({ isOpen, onClose, onSave }) => {
  const rawVehicles = useSelector(selectRawVehicleList);

  // Filter only vehicles (Type: "Vehicle")
  const allVehicles = useMemo(() => {
    return rawVehicles?.filter((item) => item.Type === "Vehicle") || [];
  }, [rawVehicles]);

  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered based on search
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) =>
      vehicle.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVehicles, searchTerm]);

  const handleCheckboxChange = (vehicleId) => {
    setSelectedVehicles((prevSelected) =>
      prevSelected.includes(vehicleId)
        ? prevSelected.filter((id) => id !== vehicleId)
        : [...prevSelected, vehicleId]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredVehicles.map((v) => v.id);
    setSelectedVehicles(visibleIds);
  };

  const handleDeselectAll = () => {
    setSelectedVehicles([]);
  };

  const handleSave = () => {
    const selected = allVehicles.filter((v) => selectedVehicles.includes(v.id));
    onSave(selected);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedVehicles([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-lg shadow-xl"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-3 border-gray-300 border-b">
            <h2 className="text-md font-bold" style={{ color: 'var(--primary-color)' }}>
              Select from your fleet:
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-4 py-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Start typing to search"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Vehicle List */}
          <div className="px-4 h-[45vh] overflow-y-auto flex-1">
            {filteredVehicles.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No vehicles found.</p>
            ) : (
              <ul className="space-y-2 py-1">
                {filteredVehicles.map((vehicle) => (
                  <li key={vehicle.id} className={`flex items-center gap-2 p-2 rounded-md ${selectedVehicles.includes(vehicle.id) ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                    <input
                      type="checkbox"
                      id={`vehicle-${vehicle.id}`}
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleCheckboxChange(vehicle.id)}
                      className="hidden" // Hide the default checkbox
                    />
                    <label htmlFor={`vehicle-${vehicle.id}`} className="flex items-center cursor-pointer">
                      <span className={`w-4 h-4 border rounded-md flex items-center justify-center ${selectedVehicles.includes(vehicle.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {selectedVehicles.includes(vehicle.id) && <span className="w-2 h-2 bg-white rounded-full" />}
                      </span>
                      <span className="text-sm text-gray-700 ml-2">{vehicle.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between p-4 border-t">
            <button
              onClick={handleSelectAll}
              className="text-sm font-medium text-gray-500 hover:underline cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm font-medium text-gray-500 hover:underline cursor-pointer"
            >
              Deselect All
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm  font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    ));
};

export default SelectVehiclesModal;