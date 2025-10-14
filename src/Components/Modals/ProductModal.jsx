import React, { useEffect, useState } from "react";
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
  const [form, setForm] = useState({ [config?.fieldName]: "" });

  useEffect(() => {
    if (modalOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
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

        // ✅ trigger callback after success
        if (modalCallback) modalCallback();

        setForm({ [config.fieldName]: "" });
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

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg max-w-md w-full"
      >
        <div className="flex justify-between">
          <h2 className="font-bold">{config.title}</h2>
          <button className="global_button_red" onClick={closeModal}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <input
            name={config.fieldName}
            value={form[config.fieldName]}
            onChange={handleChange}
            placeholder={config.title}
            className="global_input"
          />
          <button className="global_button" type="submit">
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
