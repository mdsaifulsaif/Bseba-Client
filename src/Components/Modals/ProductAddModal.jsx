import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import Select from "react-select";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";

const ProductAddModal = ({ onSuccess }) => {
  const { modalOpen, modalType, closeModal } = openCloseStore();
  const { setGlobalLoader } = loadingStore();

  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [mrp, setMrp] = useState("");
  const [dp, setDp] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [error, setError] = useState(false);

  // Scroll lock
  useEffect(() => {
    if (modalOpen && modalType === "product")
      document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [modalOpen, modalType]);

  useEffect(() => {
    if (!modalOpen || modalType !== "product") return;

    const fetchCategories = async () => {
      setGlobalLoader(true);
      try {
        const res = await axios.get(`${BaseURL}/GetCategory`, {
          headers: { token: getToken() },
        });
        setCategories(
          (res.data.data || [])
            .reverse()
            .map((c) => ({ value: c._id, label: c.name }))
        );
      } catch (err) {
        ErrorToast("Failed to load categories");
      } finally {
        setGlobalLoader(false);
      }
    };

    const fetchBrands = async () => {
      setGlobalLoader(true);
      try {
        const res = await axios.get(`${BaseURL}/GetBrands`, {
          headers: { token: getToken() },
        });
        setBrands(
          (res.data.data || [])
            .reverse()
            .map((b) => ({ value: b._id, label: b.name }))
        );
      } catch (err) {
        ErrorToast("Failed to load brands");
      } finally {
        setGlobalLoader(false);
      }
    };

    const fetchUnits = async () => {
      setGlobalLoader(true);
      try {
        const res = await axios.get(`${BaseURL}/GetUnit`, {
          headers: { token: getToken() },
        });
        setUnits(
          (res.data.data || [])
            .reverse()
            .map((u) => ({ value: u._id, label: u.name }))
        );
      } catch (err) {
        ErrorToast("Failed to load units");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchCategories();
    fetchBrands();
    fetchUnits();
  }, [modalOpen]);

  if (!modalOpen || modalType !== "product") return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Required fields check
    if (
      !productName.trim() ||
      !selectedCategory ||
      !selectedBrand ||
      !selectedUnit
    ) {
      setError("Please fill all required fields");
      return;
    }

    // Conditional validation: যদি qty থাকে, unitCost must be >0
    if (qty && (!unitCost || Number(unitCost) <= 0)) {
      setError("Unit Cost is required when Stock QTY is entered");
      return;
    }

    const payload = {
      name: productName,
      categoryID: selectedCategory.value,
      brandID: selectedBrand.value,
      unit: selectedUnit.value,
      qty: Number(qty) || 0,
      unitCost: Number(unitCost) || 0,
      mrp: Number(mrp) || 0,
      dp: Number(dp) || 0,
      decimal: 0,
      manageStock: 1,
      ecom: 0,
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreateProduct`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast("Product created successfully!");
        if (onSuccess) onSuccess();
        closeModal();

        setProductName("");
        setQty("");
        setUnitCost("");
        setMrp("");
        setDp("");
        setSelectedCategory(null);
        setSelectedBrand(null);
        setSelectedUnit(null);
        setError(false);
      } else {
        ErrorToast(res.data.message || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Failed to create product");
    } finally {
      setGlobalLoader(false);
    }
  };

  return createPortal(
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold dark:text-white text-lg">Add Product</h2>
          <button className="global_button_red" onClick={closeModal}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Product Name */}
          <div>
            <label className="block mb-1 font-medium">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                if (e.target.value.trim()) setError(false);
              }}
              className="global_input w-full"
              placeholder="Enter product name"
            />
          </div>

          {/* Row 1: Category, Brand, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-medium">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Select Category"
                classNamePrefix="react-select"
                isClearable
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Brand <span className="text-red-500">*</span>
              </label>
              <Select
                options={brands}
                value={selectedBrand}
                onChange={setSelectedBrand}
                placeholder="Select Brand"
                classNamePrefix="react-select"
                isClearable
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Unit <span className="text-red-500">*</span>
              </label>
              <Select
                options={units}
                value={selectedUnit}
                onChange={setSelectedUnit}
                placeholder="Select Unit"
                classNamePrefix="react-select"
                isClearable
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
          </div>

          {/* Row 2: Stock QTY, Unit Cost, MRP, DP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
            <div>
              <label className="block mb-1 font-medium">Stock QTY</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="global_input w-full"
                placeholder="Stock QTY"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Unit Cost</label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="global_input w-full"
                placeholder="Unit Cost"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Sell Price (MRP)</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="global_input w-full"
                placeholder="Sell Price"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Dealer Price (DP)
              </label>
              <input
                type="number"
                value={dp}
                onChange={(e) => setDp(e.target.value)}
                className="global_input w-full"
                placeholder="Dealer Price"
              />
            </div>
          </div>

          {error && (
            <span className="text-red-500 text-sm">
              Please fill all required fields
            </span>
          )}

          <button type="submit" className="global_button mt-3 w-full">
            Create Product
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ProductAddModal;
