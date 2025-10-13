import React, { useRef, useState } from "react";
import { ErrorToast, SuccessToast, IsEmpty } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { Link, useNavigate } from "react-router-dom";
import {
  setBusinessDetails,
  setMobile,
  setName,
  setToken,
  setAdmin,
  setRole,
  setPermissionDetails,
} from "../../Helper/SessionHelper";
import axios from "axios";

const UserLogin = () => {
  const mobileRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const mobile = mobileRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    if (IsEmpty(mobile)) {
      ErrorToast("Mobile number is required");
      return;
    }
    if (IsEmpty(password)) {
      ErrorToast("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BaseURL}/login`, { mobile, password });

      const { data } = res;
      if (data.status === "Success") {
        setToken(data.token);
        setMobile(mobile);
        setName(data.data.name);
        SuccessToast(data.message || "Login Successful.");
        window.location.href = "/";
      } else {
        ErrorToast(data.message || "Login Failed.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      ErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-cyan-500/10">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 border-b border-white/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-white/70 mt-2 text-sm">
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Mobile Input */}
              <div className="group">
                <label className="block text-sm font-medium text-cyan-300 mb-2 transition-colors group-focus-within:text-cyan-400">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    ref={mobileRef}
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 text-white placeholder-white/40 transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                    type="text"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-medium text-cyan-300 mb-2 transition-colors group-focus-within:text-cyan-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 text-white placeholder-white/40 transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                    type="password"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="relative">Sign In</span>
                )}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-8 space-y-4">
              <Link
                to="/VerifyMobile"
                className="block w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl font-medium text-red-300 hover:text-red-200 transition-all duration-300 text-center group"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Forgot Password?</span>
                </div>
              </Link>

              <Link
                to="/SignUp"
                className="block w-full py-3 px-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl font-medium text-green-300 hover:text-green-200 transition-all duration-300 text-center group"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span>Create New Account</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
