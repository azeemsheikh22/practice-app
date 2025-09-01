import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Car } from "lucide-react";

const VehicleDispatchModal = ({ isOpen, onClose, vehicleData }) => {
  const [form, setForm] = useState({
    customer: "",
    contactName: "",
    contactPhone: "",
    origin: "",
    destination: "",
    movementTrend: "Up Country",
    comments: "",
    workOrderId: "",
    regCapacity: "",
    load: "",
    quantity: "",
    commodity: "",
    departureTime: "",
    eta: "",
    priority: "Standard",
  });

  if (!isOpen) return null;
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-4xl p-0 overflow-hidden animate-fadeIn relative" style={{maxHeight: '90vh'}}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Car size={20} className="text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Dispatch ({vehicleData?.registration || vehicleData?.carname || "Vehicle"})
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl font-bold cursor-pointer p-1" title="Close">
            ×
          </button>
        </div>
        <form className="p-6 overflow-y-auto" style={{maxHeight: '70vh'}}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Detail */}
            <div>
              <div className="font-semibold text-gray-700 mb-2">Customer Detail</div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Customer:</label>
                <input name="customer" value={form.customer} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Contact Name:</label>
                <input name="contactName" value={form.contactName} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Contact Phone:</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Origin:</label>
                <input name="origin" value={form.origin} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Destination:</label>
                <input name="destination" value={form.destination} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Movement Trend:</label>
                <select name="movementTrend" value={form.movementTrend} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm">
                  <option value="Up Country">Up Country</option>
                  <option value="Down Country">Down Country</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Comments:</label>
                <textarea name="comments" value={form.comments} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" rows={2} />
              </div>
            </div>
            {/* Work Order Detail */}
            <div>
              <div className="font-semibold text-gray-700 mb-2">Work Order Detail</div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Work Order ID:</label>
                <input name="workOrderId" value={form.workOrderId} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Reg Capacity:</label>
                  <input name="regCapacity" value={form.regCapacity} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Load:</label>
                  <input name="load" value={form.load} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Quantity:</label>
                <input name="quantity" value={form.quantity} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Commodity:</label>
                <input name="commodity" value={form.commodity} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Departure Time:</label>
                <input name="departureTime" type="datetime-local" value={form.departureTime} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">ETA:</label>
                <input name="eta" type="datetime-local" value={form.eta} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Priority:</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm">
                  <option value="Standard">Standard</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">Submit</button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default VehicleDispatchModal;
