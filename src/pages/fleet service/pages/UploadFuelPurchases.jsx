import React, { useState, useRef } from 'react';
import Select from 'react-select';

const UploadFuelPurchases = () => {
  const [selectedRegion, setSelectedRegion] = useState({ value: 'all', label: 'All Regions' });
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreviousFile, setSelectedPreviousFile] = useState({ value: 'select', label: 'Select a File' });
  const [activeTab, setActiveTab] = useState('choose-file');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Region options
  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'north', label: 'North Region' },
    { value: 'south', label: 'South Region' },
    { value: 'east', label: 'East Region' },
    { value: 'west', label: 'West Region' }
  ];

  // Previous files options
  const previousFileOptions = [
    { value: 'select', label: 'Select a File' },
    { value: 'file1', label: 'fuel_purchases_2025_08.csv' },
    { value: 'file2', label: 'fuel_purchases_2025_07.csv' },
    { value: 'file3', label: 'fuel_purchases_2025_06.csv' }
  ];

  // Progress tabs
  const progressTabs = [
    { id: 'choose-file', label: 'Choose File', active: true },
    { id: 'review-errors', label: 'Review Errors', active: false },
    { id: 'successful-rows', label: 'Successful Rows', active: false },
    { id: 'result', label: 'Result', active: false }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = (type) => {
    if (type === 'new') {
      if (!selectedFile) {
        alert('Please select a file to upload');
        return;
      }
      console.log('Uploading new file:', selectedFile);
    } else {
      if (selectedPreviousFile.value === 'select') {
        alert('Please select a previously uploaded file');
        return;
      }
      console.log('Using previous file:', selectedPreviousFile);
    }
    
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setActiveTab('review-errors');
    }, 2000);
  };

  const downloadTemplate = () => {
    console.log('Downloading template...');
    // In real app, this would download a CSV template
  };

  // Custom select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      cursor: "pointer",
      minHeight: "40px",
      fontSize: "14px",
      borderColor: state.isFocused ? "#25689f" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #25689f" : "none",
      "&:hover": {
        borderColor: "#25689f"
      }
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#25689f" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#374151"
    })
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Upload Fuel Purchases
        </h1>

        {/* Region and Provider Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region:
            </label>
            <Select
              options={regionOptions}
              value={selectedRegion}
              onChange={setSelectedRegion}
              styles={selectStyles}
              isSearchable={false}
            />
            <p className="text-sm text-gray-600 mt-2">
              Please choose the region of the fuel purchases file.
            </p>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider:
            </label>
            <div className="min-h-[40px] bg-gray-50 border border-gray-300 rounded-md px-3 py-2 flex items-center">
              <span className="text-gray-500 text-sm">
                {selectedProvider ? selectedProvider : 'No provider selected'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Please select a provider to upload the fuel purchases for. If you have purchases from multiple providers to upload, please separate these into different files.
            </p>
          </div>
        </div>

        {/* Progress Tabs */}
        <div className="flex items-center space-x-0 mb-8">
          {progressTabs.map((tab, index) => (
            <div key={tab.id} className="flex items-center">
              <div className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ${
                tab.id === activeTab
                  ? 'bg-[#25689f] text-white border-[#25689f]'
                  : tab.id === 'choose-file'
                  ? 'bg-[#17a2b8] text-white border-[#17a2b8]'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {tab.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Select a new file to upload */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#25689f] mb-4">
              Select a new file to upload
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a file to import a new list into the system
            </p>
            <button
              onClick={downloadTemplate}
              className="text-[#17a2b8] hover:text-[#138496] text-sm font-medium mb-6 underline"
            >
              Download the template
            </button>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleBrowseClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300 text-sm font-medium transition-colors"
                >
                  Browse
                </button>
                <span className="text-gray-500 text-sm">
                  {selectedFile ? selectedFile.name : 'No file Selected'}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => handleContinue('new')}
                disabled={!selectedFile || isUploading}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedFile && !isUploading
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Select a previously uploaded file */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#25689f] mb-4">
              Select a previously uploaded file
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Upload new item by selecting form a list of previously imported file.
            </p>

            {/* Previous File Selection */}
            <div className="mb-6">
              <Select
                options={previousFileOptions}
                value={selectedPreviousFile}
                onChange={setSelectedPreviousFile}
                styles={selectStyles}
                isSearchable={false}
                placeholder="Select a File"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => handleContinue('previous')}
                disabled={selectedPreviousFile.value === 'select' || isUploading}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedPreviousFile.value !== 'select' && !isUploading
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 0 00-4 4H4z" />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFuelPurchases;
