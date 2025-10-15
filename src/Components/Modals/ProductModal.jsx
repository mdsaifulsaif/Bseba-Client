import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

const apiMap = {
  category: {
    url: "CreateCategory",
    title: "Create Category",
    fieldName: "name",
  },
  brand: { url: "CreateBrand", title: "Create Brand", fieldName: "name" },
  unit: { url: "CreateUnit", title: "Create Unit", fieldName: "name" },
};

const ProductModal = () => {
  const { modalOpen, modalType, modalCallback, closeModal } = openCloseStore();
  const { setGlobalLoader } = loadingStore();
  const config = apiMap[modalType];

  const [form, setForm] = useState({});

  // Initialize form when modalType changes
  useEffect(() => {
    if (config) {
      setForm({ [config.fieldName]: "" });
    }
  }, [config]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [modalOpen]);

  if (!modalOpen || !config) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/${config.url}`, form, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast(`${config.title} created successfully`);
        if (modalCallback) modalCallback();
        closeModal();
      } else {
        ErrorToast(res.data.message || `Failed to create ${config.title}`);
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  return createPortal(
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{config.title}</h2>
          <button className="global_button_red" onClick={closeModal}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            name={config.fieldName}
            value={form[config.fieldName] || ""}
            onChange={handleChange}
            placeholder={config.title}
            className="global_input flex-1"
          />
          <button className="global_button" type="submit">
            Create
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ProductModal;
