import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Edit2, Truck, Users, Search } from "lucide-react";
import SelectVehiclesModal from "./SelectVehiclesModal";
import { 
  fetchPolicyUserList, 
  selectPolicyUserList, 
  selectPolicyUsersLoading, 
  selectPolicyUsersError 
} from "../../../features/alertpolicySlice";  
import CreatePolicyModal from "../CreatePolicyModal";
import { useNavigate } from "react-router-dom";


export default function PolicySetupForm() {
  const navigate = useNavigate();
  const policyTypeList = useSelector(state => state.alertpolicy?.policyTypeList || []);
  const dispatch = useDispatch();
  const policyUserList = useSelector(selectPolicyUserList);
  const policyUsersLoading = useSelector(selectPolicyUsersLoading);
  const policyUsersError = useSelector(selectPolicyUsersError);

  const [activeTab, setActiveTab] = useState("vehicle");
  const [entireFleetEnabled, setEntireFleetEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSelections, setUserSelections] = useState({}); // Track individual user selections
  const [additionalEmails, setAdditionalEmails] = useState("");
  const [smsDeliveryOption, setSmsDeliveryOption] = useState("none");
  const [customizeEmailIntro, setCustomizeEmailIntro] = useState(false);
  const [onlyIncludeDrivers, setOnlyIncludeDrivers] = useState(false);
  const [alertFrequency, setAlertFrequency] = useState(10);
  const [limitAlertsPerDriver, setLimitAlertsPerDriver] = useState(10);
  const [timeRange, setTimeRange] = useState("everyDay");
  // Custom time range day checkboxes and time values
  const [customDaysChecked, setCustomDaysChecked] = useState(Array(7).fill(false));
  const [customDaysStart, setCustomDaysStart] = useState(Array(7).fill(""));
  const [customDaysEnd, setCustomDaysEnd] = useState(Array(7).fill(""));

  // Modal states for vehicle and group selection
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Fetch policy users on component mount
  useEffect(() => {
    dispatch(fetchPolicyUserList());
  }, [dispatch]);

  const tabs = [
    { id: "vehicle", label: "Vehicle & Alert Options" },
    { id: "time", label: "Time & Frequency" },
    { id: "recipients", label: "Alert Recipients" }
  ];

  // Use API data, no fallback to dummy data
  const users = policyUserList || [];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleNext = () => {
    if (activeTab === "vehicle") {
      setActiveTab("time");
    } else if (activeTab === "time") {
      setActiveTab("recipients");
    } else if (activeTab === "recipients") {
      // Optionally, submit or finalize here
      // For now, do nothing
    }
  };

  const handleCancel = () => {
    navigate('/alerts?query=policies');
  };

  // Handle individual user selection
  const handleUserSelection = (userId, type) => {
    setUserSelections(prev => {
      const newSelections = { ...prev };
      // Deep copy the user selection object
      const userSelection = newSelections[userId]
        ? { ...newSelections[userId] }
        : { all: false, display: false, email: false };

      if (type === 'all') {
        // Toggle all, display, and email together
        const newAllState = !userSelection.all;
        newSelections[userId] = {
          all: newAllState,
          display: newAllState,
          email: newAllState
        };
      } else {
        // Toggle only the selected checkbox
        userSelection[type] = !userSelection[type];
        // After toggling, update 'all' to true only if both are checked
        userSelection.all = userSelection.display && userSelection.email;
        newSelections[userId] = userSelection;
      }

      return { ...newSelections };
    });
  };

  // Handle select all for a column
  const handleSelectAll = (type) => {
    setUserSelections(prev => {
      const newSelections = { ...prev };
      
      // Get filtered users (those that match search query)
      const filteredUsers = users.filter(user => 
        searchQuery.trim() === '' || 
        (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      // Check if all filtered users are selected for the specified type
      const allUsersSelected = filteredUsers.length > 0 && filteredUsers.every(user => {
        if (!newSelections[user.USER_ID]) return false;
        return newSelections[user.USER_ID][type] === true;
      });

      // New state is the opposite of current state
      const newState = !allUsersSelected;
      
      // Only update selections for filtered users
      filteredUsers.forEach(user => {
        if (!newSelections[user.USER_ID]) {
          newSelections[user.USER_ID] = { all: false, display: false, email: false };
        }

        if (type === 'all') {
          // Select/deselect all columns
          newSelections[user.USER_ID] = {
            all: newState,
            display: newState,
            email: newState
          };
        } else {
          // Select/deselect specific column
          newSelections[user.USER_ID][type] = newState;
          
          // Update "All" state based on display and email
          newSelections[user.USER_ID].all = 
            newSelections[user.USER_ID].display && newSelections[user.USER_ID].email;
        }
      });

      return newSelections;
    });
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    // Create a new object with all checkboxes unchecked instead of empty object
    const clearedSelections = {...userSelections};
    
    // Only deselect filtered users that match the search query
    const filteredUsers = users.filter(user => 
      searchQuery.trim() === '' || 
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredUsers.forEach(user => {
      clearedSelections[user.USER_ID] = { all: false, display: false, email: false };
    });
    
    setUserSelections(clearedSelections);
  };

  // Vehicle modal functions
  const handleOpenVehicleModal = () => {
    setIsVehicleModalOpen(true);
  };

  const handleVehicleModalSave = (selectedItems) => {
  // When vehicles are selected, clear groups
  setSelectedVehicles(selectedItems);
  setSelectedGroups([]);
  setIsVehicleModalOpen(false);
  };

  // Group modal functions
  const handleOpenGroupModal = () => {
    setIsGroupModalOpen(true);
  };

  const handleGroupModalSave = (selectedItems) => {
  // When groups are selected, clear vehicles
  setSelectedGroups(selectedItems);
  setSelectedVehicles([]);
  setIsGroupModalOpen(false);
  };

  const renderVehicleAndAlertOptions = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        <div>
          <h3
            className="text-sm font-medium mb-4"
            style={{ color: 'var(--primary-color)' }}
          >
            Select what you would like to monitor:
          </h3>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: entireFleetEnabled ? 'var(--primary-color)' : '#e5e7eb',
                '--tw-ring-color': 'var(--primary-color)'
              }}
              onClick={() => setEntireFleetEnabled(!entireFleetEnabled)}
              role="switch"
              aria-checked={entireFleetEnabled}
              aria-label="Toggle entire fleet monitoring"
            >
              <motion.span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                animate={{
                  x: entireFleetEnabled ? 24 : 4
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-color)' }}
            >
              My Entire Fleet
            </span>
          </div>

          {/* Action Links */}
          <div className="space-y-4">
            <motion.button
              whileHover={entireFleetEnabled ? {} : { scale: 1.02 }}
              whileTap={entireFleetEnabled ? {} : { scale: 0.98 }}
              className={`flex items-center gap-3 text-sm font-medium transition-colors ${entireFleetEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              style={{ color: 'var(--primary-color)' }}
              onClick={() => !entireFleetEnabled && handleOpenVehicleModal()}
              disabled={entireFleetEnabled}
            >
              <Truck size={20} />
              Add Vehicles
              {selectedVehicles.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {selectedVehicles.length}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={entireFleetEnabled ? {} : { scale: 1.02 }}
              whileTap={entireFleetEnabled ? {} : { scale: 0.98 }}
              className={`flex items-center gap-3 text-sm font-medium transition-colors ${entireFleetEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              style={{ color: 'var(--primary-color)' }}
              onClick={() => !entireFleetEnabled && handleOpenGroupModal()}
              disabled={entireFleetEnabled}
            >
              <Users size={20} />
              Add Groups
              {selectedGroups.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {selectedGroups.length}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div>
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: 'var(--primary-color)' }}
        >
          Alert Triggers:
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-color)' }}
        >
          This alert is triggered when vehicle face high Impact values :
        </p>
      </div>
    </div>
  );

  const renderTimeAndFrequency = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Section - Time Range Selection */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--primary-color)' }}>
          Select the time range this alert can trigger within:
        </h3>
        <div className="space-y-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="timeRange"
              value="everyDay"
              checked={timeRange === "everyDay"}
              onChange={() => setTimeRange("everyDay")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: 'var(--primary-color)',
                boxShadow: 'none',
                outline: 'none',
                border: '2px solid #3b82f6'
              }}
            />
            <span className="ml-2 text-sm" style={{ color: 'var(--text-color)' }}>
              Every day (24 Hours)
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="timeRange"
              value="weekdays"
              checked={timeRange === "weekdays"}
              onChange={() => setTimeRange("weekdays")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: 'var(--primary-color)',
                boxShadow: 'none',
                outline: 'none',
                border: '2px solid #3b82f6'
              }}
            />
            <span className="ml-2 text-sm" style={{ color: 'var(--text-color)' }}>
              Weekdays only (Monday - Friday, 24 Hours)
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="timeRange"
              value="weekends"
              checked={timeRange === "weekends"}
              onChange={() => setTimeRange("weekends")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: 'var(--primary-color)',
                boxShadow: 'none',
                outline: 'none',
                border: '2px solid #3b82f6'
              }}
            />
            <span className="ml-2 text-sm" style={{ color: 'var(--text-color)' }}>
              Weekends only (Saturday - Sunday, 24 Hours)
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="timeRange"
              value="custom"
              checked={timeRange === "custom"}
              onChange={() => setTimeRange("custom")}
              className="h-4 w-4 rounded-full transition-colors cursor-pointer"
              style={{
                accentColor: 'var(--primary-color)',
                boxShadow: 'none',
                outline: 'none',
                border: '2px solid #3b82f6'
              }}
            />
            <span className="ml-2 text-sm" style={{ color: 'var(--text-color)' }}>
              Custom
            </span>
          </label>
          {/* Custom time range UI - only show if 'Custom' is selected */}
          {timeRange === "custom" && (
            <div  >
              <button
                type="button"
                className="text-blue-600 text-sm font-medium mb-2 inline-block hover:underline cursor-pointer"
                onClick={() => {
                  // Copy Monday's checked, start, end to all other days
                  const checked = [...customDaysChecked];
                  const start = [...customDaysStart];
                  const end = [...customDaysEnd];
                  for (let i = 1; i < 7; i++) {
                    checked[i] = checked[0];
                    start[i] = start[0];
                    end[i] = end[0];
                  }
                  setCustomDaysChecked(checked);
                  setCustomDaysStart(start);
                  setCustomDaysEnd(end);
                }}
              >
                Apply Monday's time to all
              </button>
              <div className="space-y-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, idx) => (
                  <div key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 focus:ring-0 transition-colors cursor-pointer"
                      style={{ accentColor: 'var(--primary-color)', boxShadow: 'none' }}
                      checked={customDaysChecked[idx]}
                      onChange={() => {
                        const updated = [...customDaysChecked];
                        updated[idx] = !updated[idx];
                        setCustomDaysChecked(updated);
                      }}
                    />
                    <span className="w-20 text-sm" style={{ color: 'var(--text-color)' }}>{day}</span>
                    <select
                      disabled={!customDaysChecked[idx]}
                      value={customDaysStart[idx]}
                      onChange={e => {
                        const updated = [...customDaysStart];
                        updated[idx] = e.target.value;
                        setCustomDaysStart(updated);
                      }}
                      className={`px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200 ${!customDaysChecked[idx] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      style={{ color: 'var(--text-color)' }}
                    >
                      <option value=""></option>
                      <option value="00:00">12:00 AM</option>
                      <option value="00:30">12:30 AM</option>
                      <option value="01:00">1:00 AM</option>
                      <option value="01:30">1:30 AM</option>
                      <option value="02:00">2:00 AM</option>
                      <option value="02:30">2:30 AM</option>
                      <option value="03:00">3:00 AM</option>
                      <option value="03:30">3:30 AM</option>
                      <option value="04:00">4:00 AM</option>
                      <option value="04:30">4:30 AM</option>
                      <option value="05:00">5:00 AM</option>
                      <option value="05:30">5:30 AM</option>
                      <option value="06:00">6:00 AM</option>
                      <option value="06:30">6:30 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="07:30">7:30 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="08:30">8:30 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="09:30">9:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="16:30">4:30 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="17:30">5:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="21:30">9:30 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="22:30">10:30 PM</option>
                      <option value="23:00">11:00 PM</option>
                      <option value="23:30">11:30 PM</option>
                      <option value="23:59">11:59 PM</option>
                    </select>
                    <select
                      disabled={!customDaysChecked[idx]}
                      value={customDaysEnd[idx]}
                      onChange={e => {
                        const updated = [...customDaysEnd];
                        updated[idx] = e.target.value;
                        setCustomDaysEnd(updated);
                      }}
                      className={`px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200 ${!customDaysChecked[idx] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      style={{ color: 'var(--text-color)' }}
                    >
                      <option value=""></option>
                      <option value="00:00">12:00 AM</option>
                      <option value="00:30">12:30 AM</option>
                      <option value="01:00">1:00 AM</option>
                      <option value="01:30">1:30 AM</option>
                      <option value="02:00">2:00 AM</option>
                      <option value="02:30">2:30 AM</option>
                      <option value="03:00">3:00 AM</option>
                      <option value="03:30">3:30 AM</option>
                      <option value="04:00">4:00 AM</option>
                      <option value="04:30">4:30 AM</option>
                      <option value="05:00">5:00 AM</option>
                      <option value="05:30">5:30 AM</option>
                      <option value="06:00">6:00 AM</option>
                      <option value="06:30">6:30 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="07:30">7:30 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="08:30">8:30 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="09:30">9:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="16:30">4:30 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="17:30">5:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="21:30">9:30 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="22:30">10:30 PM</option>
                      <option value="23:00">11:00 PM</option>
                      <option value="23:30">11:30 PM</option>
                      <option value="23:59">11:59 PM</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Alert Frequency */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--primary-color)' }}>
          Specify the frequency you would like to receive alerts:
        </h3>
        <div className="space-y-4">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
            Limit Alerts per Driver
          </label>
          <select
            value={limitAlertsPerDriver}
            onChange={(e) => setLimitAlertsPerDriver(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none transition-all duration-200 text-sm"
            style={{ color: 'var(--text-color)' }}
          >
            {[1, 5, 10, 25, 50, 100, 200, 500].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            The number of alerts that will be sent daily for each driver will be limited to:
          </p>

          <label className="block text-sm font-medium mt-4" style={{ color: 'var(--text-color)' }}>
            Total Daily Limit
          </label>
          <select
            value={alertFrequency}
            onChange={(e) => setAlertFrequency(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none transition-all duration-200 text-sm"
            style={{ color: 'var(--text-color)' }}
          >
            {[1, 5, 10, 25, 50, 100, 200, 500].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            The total number of alerts that will be sent daily for all drivers will be limited to:
          </p>
        </div>
      </div>
    </div>
  );

  const renderAlertRecipients = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Section - User Selection */}
      <div className="space-y-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: 'var(--primary-color)' }}
        >
          Select the users who will receive this alert:
        </h3>

        {/* Select By Group Button and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Users size={16} />
            Select By Group
            <ChevronDown size={14} />
          </motion.button> */}

          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none transition-all duration-200 text-sm"
              style={{
                '--tw-ring-color': 'var(--primary-color)',
                color: 'var(--text-color)'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 2px var(--primary-color)`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSelectAll('all')}
                      className="hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      All
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSelectAll('display')}
                      className="hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      Display
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSelectAll('email')}
                      className="hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      Email
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policyUsersLoading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : policyUsersError ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-red-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Error loading users: {policyUsersError}
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        No users found
                      </div>
                    </td>
                  </tr>
                ) : (
                  users
                    .filter(user => 
                      searchQuery.trim() === '' || 
                      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((user) => (
                    <tr key={user.USER_ID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-color)' }}>
                        {user.fullName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={userSelections[user.USER_ID]?.all || false}
                          className="h-4 w-4 rounded transition-colors cursor-pointer"
                          style={{
                            accentColor: 'var(--primary-color)',
                            boxShadow: 'none',
                            outline: 'none',
                            border: '2px solid #3b82f6' // blue border for visibility
                          }}
                          onChange={() => handleUserSelection(user.USER_ID, 'all')}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={userSelections[user.USER_ID]?.display || false}
                          className="h-4 w-4 rounded transition-colors cursor-pointer"
                          style={{
                            accentColor: 'var(--primary-color)',
                            boxShadow: 'none',
                            outline: 'none',
                            border: '2px solid #3b82f6'
                          }}
                          onChange={() => handleUserSelection(user.USER_ID, 'display')}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={userSelections[user.USER_ID]?.email || false}
                          className="h-4 w-4 rounded transition-colors cursor-pointer"
                          style={{
                            accentColor: 'var(--primary-color)',
                            boxShadow: 'none',
                            outline: 'none',
                            border: '2px solid #3b82f6'
                          }}
                          onChange={() => handleUserSelection(user.USER_ID, 'email')}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selection Count and Deselect All */}
        <div className="flex items-center justify-between text-sm mt-3">
          <span style={{ color: 'var(--text-color)' }}>
            {Object.keys(userSelections).filter(userId => userSelections[userId].all).length} Selected
          </span>
          <button
            onClick={handleDeselectAll}
            className="font-medium transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--primary-color)' }}
          >
            Deselect All
          </button>
        </div>

        {/* Additional Emails */}
        <div className="mt-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--primary-color)' }}
          >
            Additional Emails:
          </label>
          <textarea
            value={additionalEmails}
            onChange={(e) => setAdditionalEmails(e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none transition-all duration-200 text-sm resize-none"
            style={{
              '--tw-ring-color': 'var(--primary-color)',
              color: 'var(--text-color)'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px var(--primary-color)`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            *Separate emails with commas
          </p>
        </div>

        {/* Only include drivers checkbox */}
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={onlyIncludeDrivers}
              onChange={(e) => setOnlyIncludeDrivers(e.target.checked)}
              className="h-4 w-4 rounded transition-colors cursor-pointer"
              style={{
                accentColor: 'var(--primary-color)',
                boxShadow: 'none',
                outline: 'none',
                border: '2px solid #3b82f6'
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-color)' }}>
              Only include drivers that the recipients have access to, using:
            </span>
            {onlyIncludeDrivers && (
              <select
                className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent outline-none transition-all duration-200"
                style={{ color: 'var(--text-color)' }}
                defaultValue="all"
              >
                <option value="all">All Groups for that user</option>
                <option value="admin">Only the admin control group</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Delivery Options */}
      <div className="space-y-6">
        <div>
          <h3
            className="text-sm font-medium mb-4"
            style={{ color: 'var(--text-color)' }}
          >
            Delivery Options:
          </h3>

          <div className="space-y-4">
            <div>
              <p
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--text-color)' }}
              >
                Send Alert via SMS to:
              </p>

              <div className="space-y-3">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'primary', label: 'Primary Contact Person' },
                  { value: 'secondary', label: 'Secondary Contact Person' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="smsDelivery"
                      value={option.value}
                      checked={smsDeliveryOption === option.value}
                      onChange={(e) => setSmsDeliveryOption(e.target.value)}
                      className="h-4 w-4 rounded-full transition-colors cursor-pointer"
                      style={{
                        accentColor: 'var(--primary-color)',
                        boxShadow: 'none',
                        outline: 'none',
                        border: '2px solid #3b82f6'
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-color)' }}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customizeEmailIntro}
                  onChange={(e) => setCustomizeEmailIntro(e.target.checked)}
                  className="h-4 w-4 rounded transition-colors cursor-pointer"
                  style={{
                    accentColor: 'var(--primary-color)',
                    boxShadow: 'none',
                    outline: 'none',
                    border: '2px solid #3b82f6'
                  }}
                />
                <span className="text-sm" style={{ color: 'var(--text-color)' }}>
                  Customize email introduction
                </span>
              </label>
              {customizeEmailIntro && (
                <textarea
                  placeholder="Enter a message..."
                  rows={4}
                  className="block w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none transition-all duration-200 text-sm resize-none"
                  style={{
                    '--tw-ring-color': 'var(--primary-color)',
                    color: 'var(--text-color)'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Get route data from props
  const { routePolicyData = {} } = arguments[0] || {};
  // State for modal visibility and editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [policyInfo, setPolicyInfo] = useState({
    policyName: routePolicyData.policyName || '',
    alertType: routePolicyData.alertType || '',
    highPriority: routePolicyData.highPriority || false
  });

  // Update header values from state
  const policyName = policyInfo.policyName;
  const alertType = policyInfo.alertType;

  // Edit modal handlers
  const handleEditModalOpen = () => {
    setIsEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };
  const handleEditModalChange = (field, value) => {
    setPolicyInfo(prev => ({ ...prev, [field]: value }));
  };
  const handleEditModalSave = () => {
    setIsEditModalOpen(false);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: 'var(--primary-color)' }}
          >
            {policyName}
          </h1>
          <span
            className="text-lg sm:text-xl text-gray-600"
          >
            {alertType}
          </span>
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            aria-label="Edit policy name"
            onClick={handleEditModalOpen}
          >
            <Edit2 size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="hidden sm:block flex-col sm:flex-row bg-gray-100 rounded-lg p-1 gap-1 sm:gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 rounded-md  cursor-pointer text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                  }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--primary-color)' : 'transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 justify-end">
            <button
              onClick={handleCancel}
              className="text-sm  font-medium cursor-pointer transition-colors hover:opacity-80"
              style={{ color: 'var(--primary-color)' }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="px-4 py-2 text-sm cursor-pointer font-medium text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: 'var(--accent-red)' }}
            >
              {activeTab === 'vehicle' && 'Next : Time & Frequency'}
              {activeTab === 'time' && 'Next : Alert Recipients'}
              {activeTab === 'recipients' && 'Next : Review'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Edit Policy Modal */}
      <CreatePolicyModal
        show={isEditModalOpen}
        onClose={handleEditModalClose}
        formData={policyInfo}
        handleFormChange={handleEditModalChange}
        handleNext={handleEditModalSave}
        isNextDisabled={!policyInfo.policyName.trim()}
        policyTypeList={policyTypeList}
      />


      {/* Content Area */}
      <div className="mt-8">
        {activeTab === 'vehicle' && renderVehicleAndAlertOptions()}
        {activeTab === 'time' && renderTimeAndFrequency()}
        {activeTab === 'recipients' && renderAlertRecipients()}
      </div>

      {/* Vehicle Selection Modal */}
      <SelectVehiclesModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleVehicleModalSave}
        type="vehicle"
        initialSelectedItems={selectedVehicles}
        shouldReset={false}
      />

      {/* Group Selection Modal */}
      <SelectVehiclesModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleGroupModalSave}
        type="group"
        initialSelectedItems={selectedGroups}
        shouldReset={false}
      />
    </div>
  );
}