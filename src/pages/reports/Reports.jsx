import React, { useState } from 'react';
import Navbar from '../../components/navber/Navbar';

const reportCategories = [
  {
    name: 'Activity',
    reports: [
      'Alert Log Report',
      'Alert Log Report (PGL)',
      'Detail Movement Report',
      'Geofence Report (New)',
      'Idling Report',
      'Last Update Report',
      'Movement Report',
      'Parking Report',
      'Seatbelt Unfasten Report',
      'Travel and Stops Report',
    ],
  },
  {
    name: 'Summary',
    reports: ['Distance Travelled Report'],
  },
  {
    name: 'Driving Style',
    reports: [],
  },
  {
    name: 'Fuel',
    reports: [],
  },
  {
    name: 'Fuel Level Sensor',
    reports: [],
  },
  {
    name: 'Timecard',
    reports: [],
  },
  {
    name: 'Management Summary',
    reports: [],
  },
];

const customReports = [
  'Area Speeding Report',
  'Area Speeding Report - PGL',
];

const sidebarLinks = [
  { label: 'Reports Gallery', icon: '📊' },
  { label: 'Scheduled Reports', icon: '⏰' },
  { label: 'Recently Run', icon: '🕑' },
  { label: 'Customize New Report', icon: '✏️', external: true },
];

const Reports = () => {
  const [sortBy, setSortBy] = useState('Category');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-white rounded-xl shadow border border-gray-200 flex-shrink-0 mb-4 lg:mb-0">
          <nav className="py-6 px-4 flex flex-col gap-2">
            {sidebarLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.external ? '#' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-amber-50 transition-colors font-medium ${idx === 0 ? 'bg-amber-50 text-amber-700' : ''}`}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Choose a new report to run</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Show reports by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="Category">Category</option>
                  <option value="Alphabetical">Alphabetical Order</option>
                </select>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Select a new report below. Click on a star to mark report as favorite, it will stay open in a tab so you can come back to it later. After creating/customizing a report you can schedule it for automatic delivery to keep up to date with your fleet.
            </p>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortBy === 'Category' ? (
                <>
                  {reportCategories.map(category => (
                    <div key={category.name} className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-amber-700">{category.name}</span>
                      </div>
                      {category.reports.length === 0 ? (
                        <div className="text-gray-400 text-sm italic">No Reports under this category</div>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {category.reports.map(report => (
                            <li key={report} className="flex items-center gap-2 group">
                              <button className="text-amber-400 group-hover:text-amber-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662c.48.07.67.66.324.998l-3.28 3.2a.563.563 0 00-.162.5l.774 4.516a.563.563 0 01-.818.593l-4.053-2.13a.563.563 0 00-.524 0l-4.053 2.13a.563.563 0 01-.818-.593l.774-4.516a.563.563 0 00-.162-.5l-3.28-3.2a.563.563 0 01.324-.998l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
                                </svg>
                              </button>
                              <span className="text-gray-800 text-sm font-medium cursor-pointer hover:underline">{report}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {/* My Customize Reports */}
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col col-span-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-semibold text-amber-700">My Customize Reports</span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {customReports.map(report => (
                        <li key={report} className="flex items-center gap-2 group">
                          <button className="text-amber-400 group-hover:text-amber-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662c.48.07.67.66.324.998l-3.28 3.2a.563.563 0 00-.162.5l.774 4.516a.563.563 0 01-.818.593l-4.053-2.13a.563.563 0 00-.524 0l-4.053 2.13a.563.563 0 01-.818-.593l.774-4.516a.563.563 0 00-.162-.5l-3.28-3.2a.563.563 0 01.324-.998l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
                            </svg>
                          </button>
                          <span className="text-gray-800 text-sm font-medium cursor-pointer hover:underline">{report}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                // Alphabetical Order
                <div className="col-span-full">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-semibold text-amber-700">All Reports (A-Z)</span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {[
                        ...reportCategories.flatMap(c => c.reports),
                        ...customReports
                      ].sort().map(report => (
                        <li key={report} className="flex items-center gap-2 group">
                          <button className="text-amber-400 group-hover:text-amber-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662c.48.07.67.66.324.998l-3.28 3.2a.563.563 0 00-.162.5l.774 4.516a.563.563 0 01-.818.593l-4.053-2.13a.563.563 0 00-.524 0l-4.053 2.13a.563.563 0 01-.818-.593l.774-4.516a.563.563 0 00-.162-.5l-3.28-3.2a.563.563 0 01.324-.998l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
                            </svg>
                          </button>
                          <span className="text-gray-800 text-sm font-medium cursor-pointer hover:underline">{report}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;