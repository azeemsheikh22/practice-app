import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const SelectionModal = ({ 
  items = [], 
  isOpen, 
  onClose, 
  onSave,
  type = 'vehicle'  // vehicle, driver, or group
}) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reset selections when modal type changes
  useEffect(() => {
    setSelectedItems({});
    setSearchQuery('');
  }, [type]);
  
  // Filter items based on search query
  const filteredItems = items.filter(item => {
    const searchText = item.name.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });
  
  // Toggle selection of an item
  const toggleSelect = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Select all visible items
  const selectAll = () => {
    const newSelected = { ...selectedItems };
    filteredItems.forEach(item => {
      newSelected[item.id] = true;
    });
    setSelectedItems(newSelected);
  };
  
  // Deselect all items
  const deselectAll = () => {
    const newSelected = { ...selectedItems };
    filteredItems.forEach(item => {
      newSelected[item.id] = false;
    });
    setSelectedItems(newSelected);
  };
  
  // Get title based on type
  const getTitle = () => {
    switch(type) {
      case 'vehicle':
        return 'Select Vehicle(s) from your fleet';
      case 'driver':
        return 'Select Driver(s) from your fleet';
      case 'group':
        return 'Select Group(s) from your fleet';
      default:
        return 'Select Items';
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    const selected = items.filter(item => selectedItems[item.id]);
    onSave(selected);
    onClose();
  };
  
  if (!isOpen) return null;

  // Use modal-root for overlay, fallback to document.body
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  }

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        className="relative w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl z-10 mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxHeight: '80vh' }}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Search box */}
          <div className="mb-4 flex items-center">
            <label htmlFor="search" className="mr-2 font-medium text-gray-700">Search:</label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25689f] text-sm cursor-pointer"
              placeholder="Search..."
            />
          </div>
          {/* Item list */}
          <div className="space-y-1 mb-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => toggleSelect(item.id)}
              >
                <label className="flex items-center w-full cursor-pointer">
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={!!selectedItems[item.id]}
                    onChange={() => toggleSelect(item.id)}
                    className="h-4 w-4 text-[#25689f] rounded border-gray-300 focus:ring-[#25689f] cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">{item.name}</span>
                </label>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="py-4 text-center text-gray-500 italic">No items found</div>
            )}
          </div>
          {/* Footer actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex space-x-3">
              <button 
                onClick={selectAll}
                className="text-[#25689f] hover:underline text-sm font-medium cursor-pointer"
              >
                Select All
              </button>
              <button 
                onClick={deselectAll}
                className="text-[#25689f] hover:underline text-sm font-medium cursor-pointer"
              >
                Deselect All
              </button>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-[#25689f] text-white rounded hover:bg-[#1F557F] transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    modalRoot
  );
};

export default SelectionModal;
