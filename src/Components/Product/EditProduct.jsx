import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units] = useState([
    { value: "Pcs", label: "Pcs" },
    { value: "Kg", label: "Kg" },
  ]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    brandID: "",
    categoryID: "",
    unit: "Pcs",
    details: "",
    barcode: "",
    mrp: "",
    alert: "",
  });

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${BaseURL}/GetBrands`, {
        headers: { token: getToken() },
      });
      setBrands(
        (res.data?.data || []).map((b) => ({ value: b._id, label: b.name }))
      );
    } catch (error) {
      ErrorToast("Failed to load brands");
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      setCategories(
        (res.data?.data || []).map((c) => ({ value: c._id, label: c.name }))
      );
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load categories");
    }
  };

  // Fetch Product
  const fetchProduct = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/getProductById/${id}`, {
        headers: { token: getToken() },
      });
      const p = res.data?.data;
      if (p) {
        setFormData({
          name: p.name || "",
          brandID: p.brandID || "",
          categoryID: p.categoryID || "",
          unit: p.unit || "Pcs",
          details: p.details || "",
          barcode: p.barcode || "",
          mrp: p.mrp || "",
          alert: p.alert || "",
        });

        setSelectedBrand(
          p.brandID ? { value: p.brandID, label: p.brandName } : null
        );
        setSelectedCategory(
          p.categoryID ? { value: p.categoryID, label: p.categoryName } : null
        );
        setSelectedUnit(
          p.unit
            ? { value: p.unit, label: p.unit }
            : { value: "Pcs", label: "Pcs" }
        );
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load product data");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProduct();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return ErrorToast("Product Name Required!");
    if (!selectedBrand) return ErrorToast("Please select Brand!");
    if (!selectedCategory) return ErrorToast("Please select Category!");
    if (!selectedUnit) return ErrorToast("Please select Unit!");
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      brandID: selectedBrand.value,
      categoryID: selectedCategory.value,
      unit: selectedUnit.value,
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/EditProductById/${id}`,
        payload,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        SuccessToast("Product updated successfully!");
        navigate("/ProductList");
      } else {
        ErrorToast(res.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.message || "Failed to update product");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <form onSubmit={handleUpdate}>
          <h1 className="text-xl font-semibold mb-3">Edit Product</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="global_input"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleChange("barcode", e.target.value)}
                className="global_input"
              />
            </div>

            {/* Brand + Category + Unit */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <Select
                  options={brands}
                  value={selectedBrand}
                  onChange={(val) => {
                    setSelectedBrand(val);
                    handleChange("brandID", val?.value);
                  }}
                  placeholder="Select Brand"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    handleChange("categoryID", val?.value);
                  }}
                  placeholder="Select Category"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <Select
                  options={units}
                  value={selectedUnit}
                  onChange={(val) => {
                    setSelectedUnit(val);
                    handleChange("unit", val?.value);
                  }}
                  placeholder="Select Unit"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>
            </div>

            {/* Sell Price (MRP) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Sell Price (MRP)
              </label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => handleChange("mrp", e.target.value)}
                className="global_input"
              />
            </div>

            {/* Alert Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Alert Quantity
              </label>
              <input
                type="number"
                value={formData.alert}
                onChange={(e) => handleChange("alert", e.target.value)}
                className="global_input"
              />
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Details</label>
              <input
                type="text"
                value={formData.details}
                onChange={(e) => handleChange("details", e.target.value)}
                className="global_input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button type="submit" className="global_button w-full md:w-fit">
              Edit Product
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditProduct;
