import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Users,
  UserPlus,
  Shield,
  Calendar,
  MapPin,
  Fuel,
  FileText,
  ChevronRight,
  Settings,
  Edit,
  Upload,
  UserCheck,
  Group,
} from "lucide-react";

const NavigationMenu = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -2, scale: 1.02 },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // Admin sections data
  const adminSections = [
    {
      id: "vehicles",
      title: "Vehicles",
      icon: <Car size={20} className="text-[#25689f]" />,
      description: "Manage your fleet and vehicle information",
      items: [
        {
          title: "Vehicles List",
          description: "View a list of your vehicles and access their information from here.",
          icon: <FileText size={16} />,
          path: "/admin/vehicles/list"
        },
        {
          title: "Edit VIN/MPG Vehicle Details",
          description: "Bulk edit vehicle information",
          icon: <Edit size={16} />,
          path: "/admin/vehicles/edit-details"
        }
      ]
    },
    {
      id: "drivers",
      title: "Drivers",
      icon: <UserCheck size={20} className="text-[#25689f]" />,
      description: "Manage drivers and their details",
      items: [
        {
          title: "Create a New Driver",
          description: "Create a new Driver and fill in their details",
          icon: <UserPlus size={16} />,
          path: "/admin/drivers/create"
        },
        {
          title: "Driver List",
          description: "View a list of drivers within your account",
          icon: <Users size={16} />,
          path: "/admin/drivers/list"
        }
      ]
    },
    {
      id: "users",
      title: "Users and Roles",
      icon: <Shield size={20} className="text-[#25689f]" />,
      description: "Manage users, roles and permissions",
      items: [
        {
          title: "Create User",
          description: "Create new user within your account.",
          icon: <UserPlus size={16} />,
          path: "/admin/users/create"
        },
        {
          title: "Invite Multiple Users",
          description: "Send an email invite to multiple employees",
          icon: <Users size={16} />,
          path: "/admin/users/invite"
        },
        {
          title: "User List",
          description: "View a list of users within your account",
          icon: <FileText size={16} />,
          path: "/admin/users/list"
        },
        {
          title: "Manage Roles and Permissions",
          description: "Manage roles and permissions for each user",
          icon: <Shield size={16} />,
          path: "/admin/users/roles"
        }
      ]
    },
    {
      id: "groups",
      title: "Groups",
      icon: <Group size={20} className="text-[#25689f]" />,
      description: "Organize and manage user groups",
      items: [
        {
          title: "Manage Groups",
          description: "View and change your groups",
          icon: <Settings size={16} />,
          path: "/admin/groups/manage"
        }
      ]
    },
    {
      id: "shift",
      title: "Shift",
      icon: <Calendar size={20} className="text-[#25689f]" />,
      description: "Define and manage work shifts",
      items: [
        {
          title: "Manage Shifts",
          description: "View and change your Shift definition",
          icon: <Calendar size={16} />,
          path: "/admin/shifts/manage"
        }
      ]
    },
    {
      id: "geofence",
      title: "Geofence",
      icon: <MapPin size={20} className="text-[#25689f]" />,
      description: "Manage geographical boundaries",
      items: [
        {
          title: "Upload Geofences",
          description: "Manage batch uploading of Geofences",
          icon: <Upload size={16} />,
          path: "/admin/geofences/upload"
        }
      ]
    },
    {
      id: "fuel",
      title: "Fuel Card",
      icon: <Fuel size={20} className="text-[#25689f]" />,
      description: "Manage fuel cards and purchases",
      items: [
        {
          title: "Upload Fuel Purchases",
          description: "Upload a CSV/XLS file of fuel purchase.",
          icon: <Upload size={16} />,
          path: "/admin/fuel/upload"
        },
        {
          title: "Fuel Card Setup",
          description: "Edit your vehicles' fuel card assignments",
          icon: <Settings size={16} />,
          path: "/admin/fuel/setup"
        }
      ]
    }
  ];

  const handleItemClick = (path, title) => {
    console.log(`Navigating to: ${path} - ${title}`);
    // Add navigation logic here
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
   
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#25689f] rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600 mt-2">Manage all administrative functions from here</p>
          </div>
        </motion.div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {adminSections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{
                duration: 0.3,
                delay: sectionIndex * 0.05,
                type: "spring",
                stiffness: 200,
              }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md shadow-gray-300/20 hover:shadow-gray-400/30 transition-all duration-300 overflow-hidden border border-gray-200 relative"
            >
              {/* Section Header */}
              <div className="p-4 border-b border-gray-100 bg-[#25689f]/5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#25689f]/10 rounded-lg border border-[#25689f]/20">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
              </div>

              {/* Section Items */}
              <div className="p-4 space-y-3">
                {section.items.map((item, itemIndex) => (
                  <motion.button
                    key={itemIndex}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleItemClick(item.path, item.title)}
                    className="w-full text-left p-3 rounded-lg bg-white hover:bg-[#25689f]/5 border border-gray-200 hover:border-[#25689f]/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-[#25689f]/10 rounded-md group-hover:bg-[#25689f]/20 transition-colors">
                          <div className="text-[#25689f]">
                            {item.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#25689f] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className="text-gray-400 group-hover:text-[#25689f] transition-colors flex-shrink-0" 
                      />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Background decorative elements - Fixed positioning */}
              <div className="absolute top-2 right-2 w-12 h-12 bg-[#25689f]/5 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 bg-[#1F557F]/5 rounded-full"></div>
            </motion.div>
          ))}
        </div>
      
    </div>
  );
};

export default NavigationMenu;
