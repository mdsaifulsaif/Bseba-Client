import React, { useEffect, useState } from "react";
import openCloseStore from "../../Zustand/OpenCloseStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";

const CreateSupplierModal = () => {
  const { supplierModal, setSupplierModal } = openCloseStore(); // zustand store এ dealerModal এর মত supplierModal বানাতে হবে
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    supplier: "",
    company: "",
    email: "",
    mobile: "",
    address: "",
  });

  // prevent background scroll
  useEffect(() => {
    if (supplierModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [supplierModal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      supplier: "",
      company: "",
      email: "",
      mobile: "",
      address: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        supplier: form.supplier,
        company: form.company,
        email: form.email,
        mobile: form.mobile,
        address: form.address,
      };

      const res = await axios.post(`${BaseURL}/CreateSupplier`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        SuccessToast("Supplier created successfully");
        resetForm();
        setSupplierModal(false);
        // ✅ reload after success (like dealer modal)
      } else {
        ErrorToast(res.data.message || "Failed to create Supplier");
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!supplierModal) return null;

  return (
    <div
      onClick={() => setSupplierModal(false)}
      className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
    >
      <div
        className="flex relative flex-col text-black dark:text-white bg-white dark:bg-[#1E2939] rounded-lg p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // prevent close on inner click
      >
        <div className="flex justify-between">
          <h2 className="text-lg font-bold mb-4">Create Supplier</h2>
          <button
            className="global_button_red"
            onClick={() => {
              setSupplierModal(false);
            }}
          >
            close
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Supplier Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium ">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium ">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium ">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium ">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="global_input"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium ">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end md:col-span-2">
            <button type="submit" className="global_button" disabled={loading}>
              {loading ? "Creating..." : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplierModal;
