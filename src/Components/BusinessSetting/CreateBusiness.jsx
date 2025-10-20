import React, { useState } from "react";
import { getToken, removeSessions } from "../../Helper/SessionHelper";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateBusiness = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactNumber: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 🧩 Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BaseURL}/createBusiness`, formData, {
        headers: {
          token: getToken(),
        },
      });
      if (response.data.status === "Success") {
        SuccessToast(response.data.message || "Business created successfully!");
        removeSessions(); 
        navigate("/login"); 
      } else {
        ErrorToast(response.data.message || "Failed to create business!");
      }
    } catch (error) {
      console.error("Business creation error:", error);
      ErrorToast(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-teal-900 p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Business Settings
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Business Name */}
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-semibold text-white mb-2"
            >
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter Business Name"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 
                         text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 
                         transition-all"
              required
            />
          </div>

          {/* Contact Number */}
          <div>
            <label
              htmlFor="contactNumber"
              className="block text-sm font-semibold text-white mb-2"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter Contact Number"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 
                         text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 
                         transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-white mb-2"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Business Address"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 
                         text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 
                         transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 mt-4 rounded-lg font-bold text-white shadow-lg 
                        transition-all ${isLoading
                ? "bg-gray-500/50 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-400/70 to-blue-400/70 hover:from-teal-400 hover:to-blue-400"
              }`}
          >
            {isLoading ? "Creating..." : "Create Business"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBusiness;
