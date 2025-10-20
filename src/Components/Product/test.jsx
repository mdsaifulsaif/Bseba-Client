
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
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const NewProduct = () => {
  const navigate = useNavigate();
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

  // fetchBrands - after fetching, always auto-select the newest item (assumed at index 0 after reverse)
  const fetchBrands = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetBrands`, {
        headers: { token: getToken() },
      });
      const brandData = (res.data?.data || []).reverse();
      const mapped = brandData.map((u) => ({
        value: u._id,
        label: u.name,
        brand: u,
      }));
      setBrands(mapped);

      // Auto-select newest item if exists (always replace previous selection)
      if (mapped.length > 0) {
        setSelectedBrand(mapped[0]);
        // also set formData.Product.brandID accordingly
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, brandID: mapped[0].brand._id },
        }));
      } else {
        setSelectedBrand(null);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, brandID: "" },
        }));
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load brands");
    } finally {
      setGlobalLoader(false);
    }
  };

  // fetchCategories - after fetching, always auto-select newest item
  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      const mapped = (res.data.data || []).reverse().map((c) => ({
        value: c._id,
        label: c.name,
        category: c,
      }));
      setCategories(mapped);

      // Auto-select newest item if exists
      if (mapped.length > 0) {
        setSelectedCategory(mapped[0]);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, categoryID: mapped[0].category._id },
        }));
      } else {
        setSelectedCategory(null);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, categoryID: "" },
        }));
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load categories");
    } finally {
      setGlobalLoader(false);
    }
  };

  // fetchUnits - after fetching, always auto-select newest item
  const fetchUnits = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetUnit`, {
        headers: { token: getToken() },
      });
      const mapped = (res.data.data || []).reverse().map((u) => ({
        value: u._id,
        label: u.name,
      }));
      setUnits(mapped);

      // Auto-select newest item if exists
      if (mapped.length > 0) {
        setSelectedUnit(mapped[0]);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, unit: mapped[0].value },
        }));
      } else {
        setSelectedUnit(null);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, unit: "" },
        }));
      }
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
        // On initial load, fetch all; each fetch will also set a selection (per requirement)
        await Promise.all([fetchCategories(), fetchUnits(), fetchBrands()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const HandleProductDelet = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
          rgba(0,0,0,0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await axios.get(`${BaseURL}/DeleteProduct/${id}`, {
            headers: { token: getToken() },
          });

          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchNewProducts();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(
            error.response?.data?.message || "Failed to delete Product"
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
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
                      // modal will create new brand and then call this fetch
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
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                <div className="md:col-span-4 w-full flex items-end gap-2">
                  {/* Unit Select */}
                  <div className="flex-1">
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

                  {/* Add Unit Button */}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        openModal("unit", () => {
                          fetchUnits();
                        })
                      }
                      className="border border-green-600 text-green-600 py-1 px-3 rounded w-full"
                    >
                      + Unit
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
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
                      <th className="global_th">Created At</th>
                      <th className="global_th">Action</th>
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
                        <td className="global_td  ">
                          {/* update button  */}
                          <button
                            className="mr-1 px-2 py-1 outline-0 bg-blue-500 text-white rounded"
                            onClick={() =>
                              navigate(`/EditProduct/${product._id}`, {
                                state: { product },
                              })
                            }
                          >
                            Edit
                          </button>

                          {/* delet button  */}
                          <button
                            onClick={() => HandleProductDelet(product._id)}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                          >
                            Delete
                          </button>
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
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
};

export default NewProduct;
