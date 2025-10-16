import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";

const EditProduct = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    brandID: "",
    categoryID: "",
    unit: "",
    alert: 0,
    mrp: 0,
    barcode: "",
    decimal: 0,
    manageStock: 1,
    unitCost: 0,
    dp: 0,
  });

  const [unitCostError, setUnitCostError] = useState(false);

  // Fetch Product & Dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setGlobalLoader(true);

        const [brandRes, categoryRes, productRes] = await Promise.all([
          axios.get(`${BaseURL}/GetBrands`, { headers: { token: getToken() } }),
          axios.get(`${BaseURL}/GetCategory`, {
            headers: { token: getToken() },
          }),
          axios.get(`${BaseURL}/getProductById/${id}`, {
            headers: { token: getToken() },
          }),
        ]);

        // Dropdown data
        setBrands(
          (brandRes.data?.data || []).map((b) => ({
            value: b._id,
            label: b.name,
          }))
        );
        setCategories(
          (categoryRes.data?.data || []).map((c) => ({
            value: c._id,
            label: c.name,
          }))
        );
        setUnits([
          { value: "pcs", label: "pcs" },
          { value: "kg", label: "kg" },
        ]); // example units

        if (productRes.data?.data) {
          const p = productRes.data.data;

          setFormData({
            name: p.name || "",
            brandID: p.brandID || "",
            categoryID: p.categoryID || "",
            unit: p.unit || "pcs",
            alert: p.alert || 0,
            mrp: p.mrp || 0,
            barcode: p.barcode || "",
            decimal: p.decimal || 0,
            manageStock: p.manageStock || 1,
            unitCost: p.unitCost || 0,
            dp: p.dp || 0,
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
              : { value: "pcs", label: "pcs" }
          );
        }
      } catch (error) {
        console.error(error);
        ErrorToast("Failed to load data");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchData();
  }, [id, setGlobalLoader]);

  const handleChange = (field, value, isNumber = false) => {
    let val = value;
    if (isNumber) val = value === "" ? "" : Number(value);

    setFormData((prev) => ({ ...prev, [field]: val }));

    if (
      (field === "qty" && (!formData.unitCost || formData.unitCost <= 0)) ||
      (field === "unitCost" && formData.qty && (!val || val <= 0))
    ) {
      setUnitCostError(true);
    } else {
      setUnitCostError(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return ErrorToast("Product Name Required!");
    if (!selectedBrand) return ErrorToast("Please select Brand!");
    if (!selectedCategory) return ErrorToast("Please select Category!");
    if (!selectedUnit) return ErrorToast("Please select Unit!");
    if (formData.qty && (!formData.unitCost || formData.unitCost <= 0)) {
      setUnitCostError(true);
      return ErrorToast("Unit Cost Required!");
    }
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
      <form onSubmit={handleUpdate}>
        <h1 className="text-xl font-semibold mb-3">Edit Product</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="global_input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Brand *</label>
            <Select
              options={brands}
              value={selectedBrand}
              onChange={(val) => {
                setSelectedBrand(val);
                handleChange("brandID", val?.value);
              }}
              placeholder="Select Brand"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <Select
              options={categories}
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                handleChange("categoryID", val?.value);
              }}
              placeholder="Select Category"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit *</label>
            <Select
              options={units}
              value={selectedUnit}
              onChange={(val) => {
                setSelectedUnit(val);
                handleChange("unit", val?.value);
              }}
              placeholder="Select Unit"
              isClearable
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Alert Qty</label>
            <input
              type="number"
              value={formData.alert}
              onChange={(e) => handleChange("alert", e.target.value, true)}
              className="global_input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Unit Cost {unitCostError && "*"}
            </label>
            <input
              type="number"
              value={formData.unitCost}
              onChange={(e) => handleChange("unitCost", e.target.value, true)}
              className="global_input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sell Price</label>
            <input
              type="number"
              value={formData.mrp}
              onChange={(e) => handleChange("mrp", e.target.value, true)}
              className="global_input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Dealer Price
            </label>
            <input
              type="number"
              value={formData.dp}
              onChange={(e) => handleChange("dp", e.target.value, true)}
              className="global_input"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Decimal</label>
            <ToggleSwitch
              value={formData.decimal}
              onChange={(val) => handleChange("decimal", val, true)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Manage Stock
            </label>
            <ToggleSwitch
              value={formData.manageStock}
              onChange={(val) => handleChange("manageStock", val, true)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button type="submit" className="global_button w-full md:w-fit">
            Update Product
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditProduct;
