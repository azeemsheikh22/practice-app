import { useState } from 'react';
import { BarChart3, FileText, Menu, X } from 'lucide-react';

// This is a placeholder component for the report sidebar
const ReportSidebar = ({ onAction }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonLabel, setComingSoonLabel] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarLinks = [
    { id: 'gallery', label: 'Reports Gallery', icon: <BarChart3 size={20} /> },
    { id: 'scheduled', label: 'Scheduled Reports', icon: <FileText size={20} /> },
    { id: 'recent', label: 'Recently Run', icon: <Clock size={20} /> },
    { id: 'customize', label: 'Customize New Report', icon: <Edit size={20} />, external: true },
  ];

  const handleSidebarClick = (id, label) => {
    if (id === 'gallery') {
      onAction(id);
    } else {
      setComingSoonLabel(label);
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 1500);
    }
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow border border-gray-200 text-[#25689f] hover:bg-gray-50 transition-colors"
        >
          <Menu size={20} />
          <span className="font-medium">Report Tools</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-full bg-white rounded-xl shadow border border-gray-200 flex-shrink-0 mb-4 lg:mb-0 flex-col min-h-[200px] lg:min-h-[80vh]">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Report Tools</h2>
        </div>
        
        <nav className="py-2 sm:py-4 px-2 sm:px-3 flex-1">
          <div className="flex flex-col gap-1">
            {sidebarLinks.map((link) => (
              <a
                key={link.id}
                href={link.external ? '#' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarClick(link.id, link.label);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-[#25689f]/10 transition-colors font-medium cursor-pointer text-base ${link.id === 'gallery' ? 'bg-[#25689f]/10 text-[#25689f]' : ''}`}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                <span className="text-[#25689f]">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </nav>
        
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Need help with reports?</span>
            <a href="#" className="text-[#25689f] hover:underline text-sm font-medium cursor-pointer">
              View Documentation
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          {/* Overlay Background */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar Panel */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Report Tools</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Navigation */}
            <nav className="py-4 px-3 flex-1">
              <div className="space-y-1">
                {sidebarLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.external ? '#' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSidebarClick(link.id, link.label);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-[#25689f]/10 transition-colors font-medium cursor-pointer ${link.id === 'gallery' ? 'bg-[#25689f]/10 text-[#25689f]' : ''}`}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    <span className="text-[#25689f]">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Need help with reports?</span>
                <a href="#" className="text-[#25689f] hover:underline text-sm font-medium cursor-pointer">
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Coming soon message */}
      {showComingSoon && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 px-4 sm:px-8 py-4 sm:py-6 text-center animate-fadeIn max-w-sm w-full">
            <span className="text-base sm:text-lg font-semibold text-[#25689f] break-words">{comingSoonLabel} - Coming soon...</span>
          </div>
        </div>
      )}
    </>
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
