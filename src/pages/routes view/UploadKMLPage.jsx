import React, { useState } from "react";

const steps = [
  "Choose File",
  "Review Errors",
  "Sucessfull Rows",
  "Result"
];

export default function UploadKMLPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedList, setSelectedList] = useState("");

  return (
    <div className="w-full">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#25689f] mb-6">Upload Google Maps KML File</h1>
      {/* Steps */}
      <div className="flex items-center mb-8">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex items-center">
              <button
                className={`px-6 py-2 rounded-t-md font-semibold text-sm focus:outline-none transition-all duration-200 ${
                  idx === activeStep
                    ? "bg-[#1565ff] text-white shadow"
                    : "bg-gray-100 text-gray-500"
                }`}
                disabled
              >
                {step}
              </button>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-6 h-1 bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f8fafc] p-6 rounded-lg border border-gray-100">
        {/* Left: New KML upload */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <h2 className="text-xl font-semibold text-[#25689f] mb-2">Select a new KML file to upload</h2>
            <p className="text-sm text-gray-600 mb-4">Upload a file to import routes into the system.</p>
            <input
              type="file"
              accept=".kml"
              onChange={e => setSelectedFile(e.target.files[0])}
              className="mb-4"
            />
          </div>
          <button
            className="mt-4 px-6 py-2 bg-[#fbbf24] hover:bg-[#f59e1b] text-white font-semibold rounded shadow transition-all duration-200 w-fit self-end"
            onClick={() => alert('Continue with new file')}
          >
            Continue
          </button>
        </div>
        {/* Right: Previously uploaded */}
        <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <h2 className="text-xl font-semibold text-[#25689f] mb-2">Select a previously uploaded file</h2>
            <p className="text-sm text-gray-600 mb-4">Upload new item by selecting form a list of previously imported file</p>
            <select
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full mb-4"
              value={selectedList}
              onChange={e => setSelectedList(e.target.value)}
            >
              <option value="">--Select List--</option>
              {/* Example options, replace with real data */}
              <option value="file1">KML File 1</option>
              <option value="file2">KML File 2</option>
            </select>
          </div>
          <button
            className="mt-4 px-6 py-2 bg-[#fbbf24] hover:bg-[#f59e1b] text-white font-semibold rounded shadow transition-all duration-200 w-fit self-end"
            onClick={() => alert('Continue with previous file')}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
