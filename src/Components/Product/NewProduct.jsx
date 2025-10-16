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

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FetchProducts from "./fetchProducts";

const NewProduct = () => {
  const { setGlobalLoader } = loadingStore();
  const { openModal } = openCloseStore();

  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [unitCostError, setUnitCostError] = useState(false);

  const [newProducts, setNewProducts] = useState([]);

  const [formData, setFormData] = useState({
    Product: {
      categoryID: "",
      brandID: "",
      unit: "",
      details: "",
      qty: "",
      decimal: 0,
      manageStock: 1,
      unitCost: "",
      mrp: "",
      dp: "",
      name: "",
      ecom: 0,
    },
  });

  const handleProductChange = (field, value, isNumber = false) => {
    let val = value;

    // Number field handle
    if (isNumber) {
      val = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      Product: {
        ...prev.Product,
        [field]: val,
      },
    }));

    // Real-time Unit Cost validation if QTY is entered
    if (field === "qty") {
      if (
        val &&
        (!formData.Product.unitCost || formData.Product.unitCost <= 0)
      ) {
        setUnitCostError(true);
      } else {
        setUnitCostError(false);
      }
    }

    if (field === "unitCost") {
      if (formData.Product.qty && (!val || val <= 0)) {
        setUnitCostError(true);
      } else {
        setUnitCostError(false);
      }
    }
  };

  const fetchBrands = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetBrands`, {
        headers: { token: getToken() },
      });
      const brandData = (res.data?.data || []).reverse();
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
        (res.data.data || []).reverse().map((c) => ({
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
        (res.data.data || []).reverse().map((u) => ({
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

  const validateForm = () => {
    const p = formData.Product;

    if (!p.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!p.categoryID) {
      toast.error("Please select a category");
      return false;
    }
    if (!p.unit) {
      toast.error("Please select a unit");
      return false;
    }
    if (!p.brandID) {
      toast.error("Please select a brand");
      return false;
    }

    if (p.qty && (!p.unitCost || p.unitCost <= 0)) {
      setUnitCostError(true);
      toast.error("Unit Cost is required when Stock QTY is entered");
      return false;
    }

    return true; //  সব ভ্যালিড হলে true রিটার্ন করবে
  };

  const resetForm = () => {
    setFormData({
      Product: {
        categoryID: "",
        brandID: "",
        unit: "",
        details: "",
        qty: "",
        decimal: 0,
        manageStock: 1,
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
    setUnitCostError(false);
  };

  // get new product data
  const fetchNewProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/NewProductList`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setNewProducts(res.data.data || []);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchNewProducts();
  }, []);

  //  create new product
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      if (res.data.status === "Success") {
        SuccessToast("Product created successfully!");
        fetchNewProducts();
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
      <div className="global_container">
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

              {/* Brand */}
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
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
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

              {/* Category */}
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
                      handleProductChange(
                        "categoryID",
                        cat?.category._id || ""
                      );
                    }}
                    placeholder="Select Category"
                    classNamePrefix="react-select"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openModal("category", () => {
                      fetchCategories();
                    })
                  }
                  className="border border-green-600 text-green-600 px-3 py-1 rounded"
                >
                  + Category
                </button>
              </div>

              {/* Unit, Decimal, Manage Stock */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div className="md:col-span-2 w-full">
                  <label className="block text-sm font-medium mb-1 whitespace-nowrap">
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
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      openModal("unit", () => {
                        fetchUnits();
                      })
                    }
                    className="border border-green-600 text-green-600 py-1 rounded w-full"
                  >
                    + Unit
                  </button>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1 whitespace-nowrap">
                      Decimal
                    </label>
                    <ToggleSwitch
                      value={formData.Product.decimal}
                      onChange={(val) =>
                        handleProductChange("decimal", val, true)
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1 whitespace-nowrap">
                      Manage Stock
                    </label>
                    <ToggleSwitch
                      value={formData.Product.manageStock}
                      onChange={(val) =>
                        handleProductChange("manageStock", val, true)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Numeric Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit Cost
                  {unitCostError ? (
                    <span className="text-red-500"> *</span>
                  ) : (
                    ""
                  )}
                </label>
                <input
                  type="number"
                  value={formData.Product.unitCost}
                  onChange={(e) =>
                    handleProductChange("unitCost", e.target.value, true)
                  }
                  placeholder="Unit Cost"
                  className={`global_input `}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sell Price
                </label>
                <input
                  type="number"
                  value={formData.Product.mrp}
                  onChange={(e) =>
                    handleProductChange("mrp", e.target.value, true)
                  }
                  placeholder="Sell Price"
                  className="global_input"
                />
              </div>
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

            {/* Submit */}
            <div className="flex justify-end mt-4">
              <button type="submit" className="global_button w-full md:w-fit">
                Create Product
              </button>
            </div>
          </form>
        </div>
        {/* <FetchProducts /> */}
        {/* New Products List */}

        <div className="global_sub_container">
          <div>
            <h2 className="text-xl mb-3 font-semibold flex flex-col">
              Products List
            </h2>
          </div>

          {newProducts.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="global_table">
                  <thead className="global_thead">
                    <tr>
                      <th className="global_th">No</th>
                      <th className="global_th">Name</th>
                      <th className="global_th">Brand</th>
                      <th className="global_th">Category</th>
                      <th className="global_th">Stock</th>
                      <th className="global_th">Purchase (unitCost)</th>
                      <th className="global_th">Sell Price (mrp)</th>
                      <th className="global_th">Created At</th>{" "}
                      {/*  New Column */}
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {newProducts.map((product, index) => (
                      <tr className="global_tr" key={product._id}>
                        <td className="global_td">{index + 1}</td>
                        <td className="global_td">{product.name}</td>
                        <td className="global_td">
                          {product.brandName || "N/A"}
                        </td>
                        <td className="global_td">
                          {product.categoryName || "N/A"}
                        </td>
                        <td className="global_td">
                          {parseInt(product.stock || product.qty || 0)}
                        </td>
                        <td className="global_td">
                          {parseFloat(product.unitCost || 0).toFixed(2)}
                        </td>
                        <td className="global_td">
                          {parseFloat(product.mrp || 0).toFixed(2)}
                        </td>

                        {/*  Created At Display */}
                        <td className="global_td">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString(
                                "en-GB"
                              ) // DD/MM/YYYY
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          )}
        </div>

        <ProductModal />
      </div>
    </>
  );
};

export default NewProduct;
