import { useEffect, useState, useRef } from "react";
import axios from "axios";
import backgroundImg from "../../assets/background-img.jpg";
import backgroundImg2 from "../../assets/background-imgsss.jpg";
import backgroundImg3 from "../../assets/sdsd.jpg";
import logo from "../../assets/LogoColor.png";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import * as signalR from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./ForgotPasswordModal";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const bgImages = [backgroundImg, backgroundImg2, backgroundImg3];
  const sliderInterval = useRef(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
    // Load saved credentials if remember me was checked
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const wasRemembered = localStorage.getItem("rememberMe") === "true";
    if (wasRemembered && savedUsername) {
      setFormData({
        username: savedUsername,
        password: savedPassword || "",
      });
      setRememberMe(true);
    }
    // Start background slider
    sliderInterval.current = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 4000);
    return () => {
      clearInterval(sliderInterval.current);
    };
  }, [token, navigate]);

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Custom toast configuration
  const notify = (message, type) => {
    const options = {
      duration: 4000,
      position: "top-center",
      style: {
        padding: "16px",
        borderRadius: "8px",
        background: type === "error" ? "#FEE2E2" : "#ECFDF5",
        color: type === "error" ? "#B91C1C" : "#065F46",
        fontWeight: "bold",
      },
    };

    if (type === "error") {
      toast.error(message, options);
    } else {
      toast.success(message, options);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      notify("Please enter both username and password", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post("api/auth/login", {
        email: formData.username,
        password: formData.password,
      });
      const {
        token,
        userId,
        userTypeId,
        userName,
        firstName,
        lastName,
        groupLogo,
      } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("clientId", userId);
      localStorage.setItem("userTypeId", userTypeId);
      localStorage.setItem("userName", userName);
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("lastName", lastName);
      localStorage.setItem("groupLogo", groupLogo);
      const loginTime = new Date().getTime();
      localStorage.setItem("loginTime", loginTime.toString());
      localStorage.setItem("lastActivityTime", loginTime.toString());
      if (rememberMe) {
        localStorage.setItem("savedUsername", formData.username);
        localStorage.setItem("savedPassword", formData.password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("rememberMe");
      }
      if (token) {
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${import.meta.env.VITE_API_BASE_URL}gpstracking`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .build();
        try {
          await newConnection.start();
          console.log("SignalR Connected");
          notify("WebSocket connection established", "success");
        } catch (err) {
          console.error("SignalR connection failed: ", err);
          notify("WebSocket connection failed, but login successful", "error");
        }
      }
      notify("Login successful!", "success");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      notify(
        error.response?.data?.message || "Login failed. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsForgotPasswordModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-50 overflow-hidden">
      {/* Toast notifications - top center */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: "500px",
            padding: "16px",
            borderRadius: "8px",
          },
        }}
      />

      {/* Animated Background Slider */}
      <div className="absolute inset-0 z-0 w-full h-full">
        {bgImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${bgIndex === i ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(2px) brightness(0.8)",
              zIndex: 0,
            }}
          />
        ))}
        {/* Overlay for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#25689f]/30 to-[#1F557F]/30 backdrop-blur-sm"></div>
      </div>

      {/* Login Form Container - Glassmorphism */}
      <div className="z-10 w-full max-w-md p-8 space-y-8 rounded-2xl shadow-2xl mx-4 relative overflow-hidden bg-white/60 backdrop-blur-lg border border-white/30">
        {/* Decorative element */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full"></div>

        {/* Logo */}
        <div className="flex justify-center relative">
          <img src={logo} alt="Company Logo" className="h-16 w-auto drop-shadow-lg" />
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-800 tracking-tight">
          Sign in to your account
        </h2>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          <div className="rounded-md space-y-6">
            {/* Username/Email Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username or Email
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="email"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username email"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white/80 backdrop-blur-md"
                  placeholder="Enter your username or email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="appearance-none relative block w-full px-3 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white/80 backdrop-blur-md"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary hover:text-primary-dark"
                onClick={handleForgotPasswordClick}
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn
                  size={18}
                  className={`${isLoading ? "animate-pulse" : ""}`}
                />
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p className="mb-1">
            <a href="#" className="hover:text-primary">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-primary">
              Terms of Use
            </a>
          </p>
          <p>2016-2023 @Telogix (Pvt) Limited. All Rights Reserved.</p>
        </div>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Login;
