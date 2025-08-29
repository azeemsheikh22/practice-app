import React from 'react';
import { BarChart3, Download, Share2, Printer, FileText } from 'lucide-react';

// This is a placeholder component for the report sidebar
const ReportSidebar = ({ onAction }) => {
  const sidebarLinks = [
    { id: 'gallery', label: 'Reports Gallery', icon: <BarChart3 size={20} /> },
    { id: 'scheduled', label: 'Scheduled Reports', icon: <FileText size={20} /> },
    { id: 'recent', label: 'Recently Run', icon: <Clock size={20} /> },
    { id: 'customize', label: 'Customize New Report', icon: <Edit size={20} />, external: true },
  ];

  const exportOptions = [
    { id: 'download', label: 'Download', icon: <Download size={18} /> },
    { id: 'print', label: 'Print', icon: <Printer size={18} /> },
    { id: 'share', label: 'Share', icon: <Share2 size={18} /> },
  ];
  
  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl shadow border border-gray-200 flex-shrink-0 mb-4 lg:mb-0 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Report Tools</h2>
      </div>
      
      <nav className="py-4 px-3 flex-1">
        <div className="space-y-1">
          {sidebarLinks.map((link) => (
            <a
              key={link.id}
              href={link.external ? '#' : undefined}
              onClick={() => onAction(link.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-[#25689f]/10 transition-colors font-medium cursor-pointer ${link.id === 'gallery' ? 'bg-[#25689f]/10 text-[#25689f]' : ''}`}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              <span className="text-[#25689f]">{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Export Options
          </h3>
          <div className="space-y-1">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onAction(option.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-[#25689f]/10 transition-colors font-medium text-left cursor-pointer"
              >
                <span className="text-gray-500">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Need help with reports?</span>
          <a href="#" className="text-[#25689f] hover:underline text-sm font-medium cursor-pointer">
            View Documentation
          </a>
        </div>
      </div>
    </aside>
  );
};

export default ReportSidebar;

// Missing Lucide React icons - add these to avoid errors
const Edit = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const Clock = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
