import React, { useState } from 'react';

const ReportSelector = ({ reportCategories, customReports, onSelectReport }) => {
  const [sortBy, setSortBy] = useState('Category');




  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">Choose a report to run</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Show reports by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer"
          >
            <option value="Category">Category</option>
            <option value="Alphabetical">Alphabetical Order</option>
          </select>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-6">
        Select a report below. Click on a star to mark report as favorite, it will stay open in a tab so you can come back to it later. After creating/customizing a report you can schedule it for automatic delivery to keep up to date with your fleet.
      </p>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {sortBy === 'Category' ? (
          <>
            {reportCategories.map(category => (
              <div 
                key={category.name} 
                className="bg-gradient-to-r from-[#25689f]/5 to-[#1F557F]/5 border border-[#25689f]/10 rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-semibold text-[#25689f]">{category.name}</span>
                </div>
                {category.reports.length === 0 ? (
                  <div className="text-gray-400 text-sm italic">No Reports under this category</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {category.reports.map(report => (
                      <li key={report} className="flex items-center gap-2 group">
                        <button className="text-gray-400 hover:text-[#25689f] transition-colors cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662c.48.07.67.66.324.998l-3.28 3.2a.563.563 0 00-.162.5l.774 4.516a.563.563 0 01-.818.593l-4.053-2.13a.563.563 0 00-.524 0l-4.053 2.13a.563.563 0 01-.818-.593l.774-4.516a.563.563 0 00-.162-.5l-3.28-3.2a.563.563 0 01.324-.998l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
                          </svg>
                        </button>
                        <span 
                          className="text-gray-700 text-sm font-medium cursor-pointer hover:text-[#25689f] transition-colors hover:underline"
                          onClick={() => onSelectReport(report, category.name)}
                        >
                          {report}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            
            {/* My Custom Reports */}
            {customReports.length > 0 && (
              <div className="bg-gradient-to-r from-[#25689f]/5 to-[#1F557F]/5 border border-[#25689f]/10 rounded-lg p-4 flex flex-col col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-semibold text-[#25689f]">My Custom Reports</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {customReports.map(report => (
                    <li key={report} className="flex items-center gap-2 group">
                      <button className="text-gray-400 hover:text-[#25689f] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662c.48.07.67.66.324.998l-3.28 3.2a.563.563 0 00-.162.5l.774 4.516a.563.563 0 01-.818.593l-4.053-2.13a.563.563 0 00-.524 0l-4.053 2.13a.563.563 0 01-.818-.593l.774-4.516a.563.563 0 00-.162-.5l-3.28-3.2a.563.563 0 01.324-.998l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
                        </svg>
                      </button>
                      <span 
                        className="text-gray-700 text-sm font-medium cursor-pointer hover:text-[#25689f] transition-colors hover:underline"
                        onClick={() => onSelectReport(report, 'Custom')}
                      >
                        {report}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          // Alphabetical Order
          <div className="col-span-full">
            <div className="bg-gradient-to-r from-[#25689f]/5 to-[#1F557F]/5 border border-[#25689f]/10 rounded-lg p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-semibold text-[#25689f]">All Reports (A-Z)</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                {[
                  ...reportCategories.flatMap(c => c.reports.map(r => ({ name: r, category: c.name }))),
                  ...customReports.map(r => ({ name: r, category: 'Custom' }))
                ].sort((a, b) => a.name.localeCompare(b.name)).map(report => (
                  <li key={report.name} className="flex items-center gap-2 group">
                    <button className="text-gray-400 hover:text-[#25689f] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662c.48.07.67.66.324.998l-3.28 3.2a.563.563 0 00-.162.5l.774 4.516a.563.563 0 01-.818.593l-4.053-2.13a.563.563 0 00-.524 0l-4.053 2.13a.563.563 0 01-.818-.593l.774-4.516a.563.563 0 00-.162-.5l-3.28-3.2a.563.563 0 01.324-.998l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
                      </svg>
                    </button>
                    <span 
                      className="text-gray-700 text-sm font-medium cursor-pointer hover:text-[#25689f] transition-colors hover:underline"
                      onClick={() => onSelectReport(report.name, report.category)}
                    >
                      {report.name} 
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSelector;
