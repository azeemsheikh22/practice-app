import React, { useState } from "react";
import { X, Mail, User, Send, AlertCircle } from "lucide-react";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing again
    if (error) setError("");
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.username) {
      setError("Please enter both email address and username");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make an actual API call to reset the password
      // const response = await api.post("/api/auth/forgot-password", formData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form data
      setFormData({
        email: "",
        username: "",
      });
    } catch (error) {
      setError("Failed to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[300]">
      {/* Black overlay with slight transparency */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden z-10">
        {/* Decorative elements similar to Login.jsx */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full"></div>
        
        {/* Modal Header */}
        <div className="relative px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-dark">Forgot Your Password?</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 relative">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Send size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-dark mb-2">Password Reset Email Sent</h3>
              <p className="text-sm text-gray-500 mb-6">
                We've sent password reset instructions to your email address. Please check your inbox.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                To reset your password, please enter the email address and username you have registered with Telogix (Pvt) Limited. A new password will be emailed to your email address.
              </p>
              
              {/* Error message */}
              {error && (
                <div className="mb-6 flex items-start p-4 rounded-md bg-red-50 text-red-700">
                  <AlertCircle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Form - Using same input style as Login.jsx */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                  <button 
                    type="button" 
                    className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
