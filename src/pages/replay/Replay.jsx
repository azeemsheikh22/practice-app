import { useState } from "react";
import Navbar from "../../components/navber/Navbar";
import ReplaySidebar from "./ReplaySidebar";

const Replay = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* Navigation Bar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      <div className="flex h-full w-full">
        {/* Left Sidebar - Dynamic Width */}
        <div className={`transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-90' : 'w-16'
        }`}>
          <ReplaySidebar 
            isExpanded={isSidebarExpanded}
            onToggleExpand={setIsSidebarExpanded}
          />
        </div>
        
        {/* Right Map Area - Takes Remaining Space */}
        <div className="flex-1 bg-gray-200 relative">
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-500 text-lg">
              Map Area - Replay will be shown here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Replay;
