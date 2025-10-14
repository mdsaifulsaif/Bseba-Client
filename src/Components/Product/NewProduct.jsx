import React, { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import Select from "react-select";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";

import ProductModal from "../Modals/ProductModal";
import openCloseStore from "../../Zustand/OpenCloseStore";

const NewProduct = () => {
  const { setGlobalLoader } = loadingStore();
  const { setCategoryModal, openModal } = openCloseStore();

  // Dropdown data
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [brandKeyWord, setBrandKeyWord] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    Product: {
      categoryID: "",
      brandID: "",
      unit: "",
      details: "",
      qty: "",
      decimal: "",
      manageStock: 1,
      unitCost: "",
      mrp: "",
      dp: "",
      name: "",
      ecom: 0,
    },
  });

  const handleProductChange = (field, value, isNumber = false) => {
    setFormData((prev) => ({
      ...prev,
      Product: {
        ...prev.Product,
        [field]: isNumber ? value : value,
      },
    }));
  };

  // Fetch functions
  const fetchBrands = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetBrands`, {
        headers: { token: getToken() },
      });
      const brandData = res.data?.data || [];
      setBrands(
        brandData.map((u) => ({
          value: u._id,
          label: u.name,
          brand: u,
        }))
      );
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load brands");
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      setCategories(
        (res.data.data || []).map((c) => ({
          value: c._id,
          label: c.name,
          category: c,
        }))
      );
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load categories");
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
        (res.data.data || []).map((u) => ({
          value: u._id,
          label: u.name,
        }))
      );
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load units");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([fetchCategories(), fetchUnits(), fetchBrands()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchAll();
  }, []);

  // Validation
  const validateForm = () => {
    const p = formData.Product;
    if (!p.name.trim()) return ErrorToast("Product name is required");
    if (!p.categoryID) return ErrorToast("Please select a category");
    if (!p.unit) return ErrorToast("Please select a unit");
    if (!p.brandID) return ErrorToast("Please select a brand");
    return true;
  };

  const resetForm = () => {
    setFormData({
      Product: {
        categoryID: "",
        brandID: "",
        unit: "",
        details: "",
        qty: "",
        decimal: "",
        manageStock: "",
        unitCost: "",
        mrp: "",
        dp: "",
        name: "",
        ecom: 0,
      },
    });
    setSelectedCategory(null);
    setSelectedUnit(null);
    setSelectedBrand(null);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert numeric fields to numbers before submitting
    const payload = {
      ...formData.Product,
      qty: Number(formData.Product.qty) || 0,
      decimal: Number(formData.Product.decimal) || 0,
      manageStock: Number(formData.Product.manageStock) || 1,
      unitCost: Number(formData.Product.unitCost) || 0,
      mrp: Number(formData.Product.mrp) || 0,
      dp: Number(formData.Product.dp) || 0,
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreateProduct`, payload, {
        headers: { token: getToken() },
      });
      console.log("my created product", res.data.data);
      if (res.data.status === "Success") {
        SuccessToast("Product created successfully!");
        resetForm();
      } else {
        ErrorToast(res.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.message || "Failed to create product");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <>
      <div className="global_sub_container">
        <form onSubmit={handleCreateProduct}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.Product.name}
                onChange={(e) => handleProductChange("name", e.target.value)}
                className="global_input"
                placeholder="Enter product name"
              />
            </div>

            {/* Product Brand with Button */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Product Brand <span className="text-red-500">*</span>
                </label>
                <Select
                  options={brands}
                  value={selectedBrand}
                  onChange={(brand) => {
                    setSelectedBrand(brand);
                    handleProductChange("brandID", brand?.brand._id || "");
                  }}
                  placeholder="Select Brand"
                  classNamePrefix="react-select"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  openModal("brand", () => {
                    fetchBrands();
                  })
                }
                className="border border-green-600 text-green-600 px-3 py-1 rounded"
              >
                + Brand
              </button>
            </div>

            {/* Product Category with Button */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(cat) => {
                    setSelectedCategory(cat);
                    handleProductChange("categoryID", cat?.category._id || "");
                  }}
                  placeholder="Select Category"
                  classNamePrefix="react-select"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <button
                onClick={() =>
                  openModal("category", () => {
                    fetchCategories();
                  })
                }
                type="button"
                className="border border-green-600 text-green-600 px-3 py-1 rounded"
              >
                + Category
              </button>
            </div>

            {/* Product Unit with Button */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Product Unit <span className="text-red-500">*</span>
                </label>
                <Select
                  options={units}
                  value={selectedUnit}
                  onChange={(unit) => {
                    setSelectedUnit(unit);
                    handleProductChange("unit", unit?.value || "");
                  }}
                  placeholder="Select Unit"
                  classNamePrefix="react-select"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  openModal("unit", () => {
                    fetchUnits();
                  })
                }
                className="border border-green-600 text-green-600 px-3 py-1 rounded"
              >
                + Unit
              </button>
            </div>

            {/* Ecom Toggle */}
            <div className="flex items-center mt-6">
              <ToggleSwitch
                label="Ecom"
                value={formData.Product.ecom}
                onChange={(val) => handleProductChange("ecom", val, true)}
              />
            </div>

            {/* Product Details */}
            {/* <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Product Details
              </label>
              <input
                type="text"
                value={formData.Product.details}
                onChange={(e) => handleProductChange("details", e.target.value)}
                className="global_input"
                placeholder="Enter product details"
              />
            </div> */}
          </div>

          {/* Numeric Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Stock QTY */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock QTY
              </label>
              <input
                type="number"
                value={formData.Product.qty}
                onChange={(e) =>
                  handleProductChange("qty", e.target.value, true)
                }
                placeholder="Stock QTY"
                className="global_input"
              />
            </div>

            {/* Decimal */}
            {/* <div>
              <label className="block text-sm font-medium mb-1">Decimal</label>
              <input
                type="number"
                value={formData.Product.decimal}
                onChange={(e) =>
                  handleProductChange("decimal", e.target.value, true)
                }
                placeholder="Decimal"
                className="global_input"
              />
            </div> */}

            {/* Decimal */}
            <div className="flex items-center mt-6">
              <ToggleSwitch
                label="Decimal"
                value={formData.Product.decimal}
                onChange={(val) => handleProductChange("decimal", val, true)}
              />
            </div>

            {/* Manage Stock */}

            <div className="flex items-center mt-6">
              <ToggleSwitch
                label="Manage Stock"
                value={formData.Product.manageStock}
                onChange={(val) =>
                  handleProductChange("manageStock", val, true)
                }
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Manage Stock
              </label>
              <input
                type="number"
                value={formData.Product.manageStock}
                onChange={(e) =>
                  handleProductChange("manageStock", e.target.value, true)
                }
                placeholder="Manage Stock"
                className="global_input"
              />
            </div> */}

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Cost
              </label>
              <input
                type="number"
                value={formData.Product.unitCost}
                onChange={(e) =>
                  handleProductChange("unitCost", e.target.value, true)
                }
                placeholder="Unit Cost"
                className="global_input"
              />
            </div>

            {/* MRP */}
            <div>
              <label className="block text-sm font-medium mb-1">MRP</label>
              <input
                type="number"
                value={formData.Product.mrp}
                onChange={(e) =>
                  handleProductChange("mrp", e.target.value, true)
                }
                placeholder="MRP"
                className="global_input"
              />
            </div>

            {/* Dealer Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Dealer Price
              </label>
              <input
                type="number"
                value={formData.Product.dp}
                onChange={(e) =>
                  handleProductChange("dp", e.target.value, true)
                }
                placeholder="Dealer Price"
                className="global_input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button type="submit" className="global_button w-full md:w-fit">
              Create Product
            </button>
          </div>
        </form>
      </div>
      <ProductModal />
    </>
  );
};

export default NewProduct;
