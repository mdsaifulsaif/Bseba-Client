import { useEffect, useState } from "react";
import { FaPlus, FaTag } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { formatDate } from "date-fns";

const ProductList = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const { setCategoryModal } = openCloseStore();
  // Dropdown data

  const [categories, setCategories] = useState([]);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [packSize, setPackSize] = useState(["KG", "Gram"]);
  const [selectedPackSize, setSelectedPackSize] = useState("");
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    categoryID: "",
    stock: "",
    dp: "",
    sp: "",
    barcode: "",
    weight: "",
  });

  // Fetch products with pagination and search
  const fetchProducts = async () => {
    setGlobalLoader(true);

    try {
      const res = await axios.get(
        `${BaseURL}/ProductList/${page}/${limit}/${search || 0}`,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [categoriesRes] = await Promise.all([
        axios.get(`${BaseURL}/GetCategory`, { headers: { token: getToken() } }),
      ]);

      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      ErrorToast("Failed to load dropdown data");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all data simultaneously on component mount
        await Promise.all([fetchProducts(), fetchDropdownData()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchAllData();
  }, [page, search, limit]);

  // Handle search
  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    setPage(1);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      ErrorToast("Product name is required");
      return false;
    }
    if (!formData.weight) {
      ErrorToast("Please Enter Pack Size");
      return false;
    }
    if (!selectedPackSize) {
      ErrorToast("No Pack Size Selected");
      return false;
    }

    if (!formData.categoryID) {
      ErrorToast("Please select a category");
      return false;
    }

    return true;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      categoryID: "",
      stock: "",
      dp: "",
      sp: "",
      barcode: "",
      weight: "",
    });
    setIsCreateMode(false);
    setEditingProduct(null);
    setSelectedPackSize("");
  };

  // Handle create product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      categoryID: formData.categoryID,

      stock: formData.stock ? parseInt(formData.stock) : 0,
      weight: formData.weight
        ? selectedPackSize === "KG"
          ? parseFloat(formData.weight) * 1000
          : parseFloat(formData.weight)
        : 0,
      price: formData.dp ? parseFloat(formData.dp) : 0,
      sp: formData.sp ? parseFloat(formData.sp) : 0,
      barcode: formData.barcode.trim(),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreateProduct`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        SuccessToast("Product created successfully!");
        resetForm();
        fetchProducts();
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to create product");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingProduct) return;

    const payload = {
      name: formData.name.trim(),
      categoryID: formData.categoryID,
      unitID: formData.unitID,
      weight: formData.weight
        ? selectedPackSize === "KG"
          ? parseFloat(formData.weight) * 1000
          : parseFloat(formData.weight)
        : 0,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      price: formData.dp ? parseFloat(formData.dp) : 0,
      sp: formData.sp ? parseFloat(formData.sp) : 0,
      barcode: formData.barcode.trim(),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/UpdateProduct/${editingProduct._id}`,
        payload,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        SuccessToast("Product updated successfully!");
        resetForm();
        fetchProducts(currentPage, searchKeyword);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to update product");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Start editing a product
  const startEditProduct = (product) => {
    setFormData({
      name: product.name || "",
      categoryID: product.Categorys?._id || product.categoryID || "",
      unitID: product.Units?._id || product.unitID || "",
      stock: product.stock?.toString() || "",
      unitCost: product.unitCost?.toString() || "",
      dp: product.price?.toString() || "",
      sp: product.sp?.toString() || "",
      barcode: product.barcode || "",
      weight: product.weight,
    });
    setEditingProduct(product);
    setIsCreateMode(true);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Number input validation
  const handleNumberInput = (field, value, isInteger = false) => {
    const pattern = isInteger ? /^\d*$/ : /^\d*\.?\d*$/;
    if (value === "" || pattern.test(value)) {
      handleInputChange(field, value);
    }
  };

  return (
    <div className="global_container">
      <div className="">
        <div className="global_sub_container">
          <form
            onSubmit={
              editingProduct ? handleUpdateProduct : handleCreateProduct
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="global_input"
                  placeholder="Enter product name"
                />
              </div>
              <div className="flex gap-2 items-center col-span-2">
                <div className="w-2/6">
                  <label className="block text-sm font-medium mb-1">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) =>
                      handleNumberInput("weight", e.target.value)
                    }
                    className="global_input"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-end w-2/6 h-full">
                  <select
                    value={selectedPackSize}
                    onChange={(e) =>
                      // handleInputChange("categoryID", e.target.value)
                      setSelectedPackSize(e.target.value)
                    }
                    className="global_dropdown  h-fit"
                  >
                    <option value="">Select</option>
                    {packSize.map((packSize) => (
                      <option key={packSize} value={packSize}>
                        {packSize}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Category */}
                <div className="w-2/6">
                  <label className="block text-sm font-medium mb-1">
                    <FaTag className="inline mr-1" />
                    Category *
                  </label>
                  <div className="flex gap-2">
                    {" "}
                    <select
                      value={formData.categoryID}
                      onChange={(e) =>
                        handleInputChange("categoryID", e.target.value)
                      }
                      className="global_dropdown w-full"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* -Sell Price */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sell Price
                </label>
                <input
                  type="text"
                  value={formData.dp}
                  onChange={(e) => handleNumberInput("dp", e.target.value)}
                  className="global_input"
                  placeholder="0.00"
                />
              </div>

              {/* Sell Price */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Special Price
                </label>
                <input
                  type="text"
                  value={formData.sp}
                  onChange={(e) => handleNumberInput("sp", e.target.value)}
                  className="global_input"
                  placeholder="0.00"
                />
              </div>

              {/* Stock */}

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="text"
                  value={formData.stock}
                  onChange={(e) =>
                    handleNumberInput("stock", e.target.value, true)
                  }
                  className="global_input"
                  placeholder="0"
                />
              </div>
              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  className="global_input"
                  placeholder="Enter barcode"
                />
              </div>
            </div>
            <div className="flex justify-end  gap-4 items-end w-full mt-5">
              <button type="submit" className={`global_button`}>
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>

            {/* Form Actions */}
          </form>
        </div>

        {/* Products Table */}
        <div className="global_sub_container">
          <div className="py-2">
            <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
              <h2 className="text-xl font-semibold flex flex-col">
                Products List{" "}
                <span className="text-sm">Showing of {total} products</span>
              </h2>

              <div className="relative w-full lg:w-lg">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearch}
                  className="global_input"
                />
              </div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
                className="global_dropdown lg:w-fit"
              >
                {[20, 50, 100, 200].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {products.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="global_table">
                  <thead className="global_thead">
                    <tr className="">
                      <th className="global_th">No</th>
                      <th className="global_th">Name</th>
                      <th className="global_th">Category</th>
                      <th className="global_th">Stock</th>

                      <th className="global_th">Sell Price</th>
                      <th className="global_th">Special Price</th>

                      <th className="global_th">Barcode</th>
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {products.map((product, index) => (
                      <tr className="global_tr" key={product._id}>
                        <td className="global_td">{index + 1}</td>
                        <td className="global_td">
                          {product.name}{" "}
                          {product.weight && (
                            <span className="text-xs text-green-400">
                              (
                              {product.weight >= 1000
                                ? product.weight / 1000 + " KG"
                                : product.weight + " Gram"}
                              )
                            </span>
                          )}
                        </td>
                        <td className="global_td">
                          {product.Categorys?.name || "N/A"}
                        </td>
                        <td className="global_td">
                          {parseInt(product.stock || 0)}
                        </td>

                        <td className="global_td">
                          {parseFloat(product.price || 0).toFixed(2)}
                        </td>
                        <td className="global_td">
                          {parseFloat(product.sp || 0).toFixed(2)}
                        </td>

                        <td className="global_td">
                          {product.barcode || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-r-md rounded-l-full ${
                      page === 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    className={`px-4 py-2 rounded-l-md rounded-r-full ${
                      page >= Math.ceil(total / limit)
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
