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

  const [suggetionKey, setSuggetionKey] = useState("");
  const [suggetionProducts, setSuggetionProducts] = useState([]);
  const [disibleSuggetion, setDisibleSuggetion] = useState(false);
  const [hiddenSuggetion, setHiddenSuggetion] = useState(false);

  const [initialLoadDone, setInitialLoadDone] = useState({
    brands: false,
    categories: false,
    units: false,
  });

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
      barcode: "",
      AltQty: "",
    },
  });

  const handleProductChange = (field, value, isNumber = false) => {
    let val = value;
    if (isNumber) val = value === "" ? "" : Number(value);

    setFormData((prev) => ({
      ...prev,
      Product: {
        ...prev.Product,
        [field]: val,
      },
    }));

    if (field === "name") {
      setSuggetionKey(val);
      setHiddenSuggetion(true);
      if (!val) setSuggetionProducts([]);
    }

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

  const fetchBrands = async (autoSelect = false) => {
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

      if ((autoSelect || initialLoadDone.brands) && mapped.length > 0) {
        setSelectedBrand(mapped[0]);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, brandID: mapped[0].brand._id },
        }));
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load brands");
    } finally {
      setGlobalLoader(false);
      if (!initialLoadDone.brands)
        setInitialLoadDone((prev) => ({ ...prev, brands: true }));
    }
  };

  const fetchCategories = async (autoSelect = false) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      const mapped = (res.data.data || [])
        .reverse()
        .map((c) => ({ value: c._id, label: c.name, category: c }));
      setCategories(mapped);

      if ((autoSelect || initialLoadDone.categories) && mapped.length > 0) {
        setSelectedCategory(mapped[0]);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, categoryID: mapped[0].category._id },
        }));
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load categories");
    } finally {
      setGlobalLoader(false);
      if (!initialLoadDone.categories)
        setInitialLoadDone((prev) => ({ ...prev, categories: true }));
    }
  };

  const fetchUnits = async (autoSelect = false) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetUnit`, {
        headers: { token: getToken() },
      });
      const mapped = (res.data.data || [])
        .reverse()
        .map((u) => ({ value: u._id, label: u.name }));
      setUnits(mapped);

      if ((autoSelect || initialLoadDone.units) && mapped.length > 0) {
        setSelectedUnit(mapped[0]);
        setFormData((prev) => ({
          ...prev,
          Product: { ...prev.Product, unit: mapped[0].value },
        }));
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load units");
    } finally {
      setGlobalLoader(false);
      if (!initialLoadDone.units)
        setInitialLoadDone((prev) => ({ ...prev, units: true }));
    }
  };

  const fetchSuggetion = async () => {
    if (!suggetionKey) return;
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/AllProductList/${suggetionKey}`, {
        headers: { token: getToken() },
      });
      setSuggetionProducts(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (disibleSuggetion) return;
    fetchSuggetion();
  }, [suggetionKey]);

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
        decimal: 0,
        manageStock: 1,
        unitCost: "",
        mrp: "",
        dp: "",
        name: "",
        ecom: 0,
        barcode: 0,
        AltQty: 0,
      },
    });
    setSelectedCategory(null);
    setSelectedUnit(null);
    setSelectedBrand(null);
    setUnitCostError(false);
    setSuggetionProducts([]);
    setSuggetionKey("");
  };

  const fetchNewProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/NewProductList`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") setNewProducts(res.data.data || []);
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
      AltQty: Number(formData.Product.AltQty) || 0,
      barcode: Number(formData.Product.barcode) || 0,
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreateProduct2`, payload, {
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
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-lg shadow-xl backdrop-blur-lg",
        confirmButton: "px-4 py-2 bg-red-600 text-white rounded-md ml-3",
        cancelButton: "px-4 py-2 bg-gray-300 text-gray-800 rounded-md ml-2",
      },
      buttonsStyling: false,
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
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">Add New Product</h1>
        <form onSubmit={handleCreateProduct}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="relative">
              <div className="flex items-center justify-between ">
                <label className="block text-sm font-medium mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="disableSuggestion"
                    className="text-sm font-medium"
                  >
                    Suggetion {disibleSuggetion ? "Disabled" : "Enabled"}
                  </label>
                  <input
                    id="disableSuggestion"
                    type="checkbox"
                    checked={!disibleSuggetion}
                    onChange={(e) => setDisibleSuggetion(!e.target.checked)}
                    className="toggle toggle-success"
                  />
                </div>
              </div>
              <input
                type="text"
                value={formData.Product.name}
                onChange={(e) => handleProductChange("name", e.target.value)}
                className="global_input"
                placeholder="Enter product name"
                autoComplete="off"
              />
              {suggetionProducts.length > 0 && (
                <ul
                  className={`${
                    hiddenSuggetion ? "" : "hidden"
                  } absolute z-50 w-full border border-gray-300 rounded mt-1 max-h-40 overflow-auto shadow-lg`}
                >
                  {suggetionProducts.map((prod) => (
                    <li
                      key={prod._id}
                      className="px-2 py-1 bg-white dark:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        handleProductChange("name", prod.name);
                        setSuggetionProducts([]);
                        setHiddenSuggetion(false);
                      }}
                    >
                      {prod.name}
                    </li>
                  ))}
                </ul>
              )}
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
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <button
                type="button"
                onClick={() => openModal("brand", fetchBrands)}
                className="global_button"
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
                type="button"
                onClick={() => openModal("category", fetchCategories)}
                className="global_button"
              >
                + Category
              </button>
            </div>

            {/* Unit, Decimal, Manage Stock */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
              <div className="md:col-span-4 w-full flex items-end gap-2">
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
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openModal("unit", fetchUnits)}
                    className="global_button"
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

          {/* Numeric Fields including Barcode and AltQty */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
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
                placeholder="Enter stock quantity"
                className="global_input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Cost{" "}
                {unitCostError && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                value={formData.Product.unitCost}
                onChange={(e) =>
                  handleProductChange("unitCost", e.target.value, true)
                }
                placeholder="Enter unit cost"
                className="global_input"
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
                placeholder="Enter sell price"
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
                placeholder="Enter dealer price"
                className="global_input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input
                type="number"
                value={formData.Product.barcode}
                onChange={(e) =>
                  handleProductChange("barcode", e.target.value, true)
                }
                placeholder="Enter barcode (default 0)"
                className="global_input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Alert Quantity
              </label>
              <input
                type="number"
                value={formData.Product.AltQty}
                onChange={(e) =>
                  handleProductChange("AltQty", e.target.value, true)
                }
                placeholder="Enter alert quantity (default 0)"
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

      {/* Products List */}
      <div className="global_sub_container">
        <h2 className="text-xl mb-3 font-semibold">Products List</h2>
        {newProducts.length > 0 ? (
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
                    <td className="global_td">{product.brandName || "N/A"}</td>
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
                    <td className="global_td">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </td>
                    <td className="global_td flex gap-2">
                      <button
                        className="global_edit"
                        onClick={() =>
                          navigate(`/EditProduct/${product._id}`, {
                            state: { product },
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => HandleProductDelet(product._id)}
                        className="global_button_red"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  );
};

export default NewProduct;
