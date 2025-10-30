import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { FaChartLine } from "react-icons/fa";
import Select from "react-select";

const StockReport = () => {
  const [summaryData, setSummaryData] = useState({
    totalStockValue: 0,
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
  });
  const [brandData, setBrandData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "productName",
    direction: "ascending",
  });

  // Fetch summary info
  const fetchSummaryData = async () => {
    try {
      const response = await axios.get(`${BaseURL}/Summary`, {
        headers: { token: getToken() },
      });
      setSummaryData({
        totalStockValue: response.data.totalStockValue,
        totalProducts: response.data.totalProducts,
        totalBrands: response.data.totalBrands,
        totalCategories: response.data.totalCategories,
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axios.get(`${BaseURL}/GetBrands`, {
          headers: { token: getToken() },
        });
        setBrandData(brandRes.data.data);

        const categoryRes = await axios.get(`${BaseURL}/GetCategory`, {
          headers: { token: getToken() },
        });
        setCategoryData(categoryRes.data.data);
      } catch (err) {
        console.error("Failed to fetch brands/categories:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch summary initially
  useEffect(() => {
    fetchSummaryData();
  }, []);

  // Handle filter
  const handleBrandChange = async (selectedOption) => {
    if (!selectedOption) {
      setProductsData([]);
      return;
    }
    try {
      const res = await axios.get(
        `${BaseURL}/ProductListByBrand/${selectedOption.value}`,
        { headers: { token: getToken() } }
      );
      setProductsData(res.data.data);
    } catch (err) {
      console.error("Error fetching brand products:", err);
    }
  };

  const handleCategoryChange = async (selectedOption) => {
    if (!selectedOption) {
      setProductsData([]);
      return;
    }
    try {
      const res = await axios.get(
        `${BaseURL}/ProductListByCategory/${selectedOption.value}`,
        { headers: { token: getToken() } }
      );
      setProductsData(res.data.data);
    } catch (err) {
      console.error("Error fetching category products:", err);
    }
  };

  // Sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...productsData].sort((a, b) => {
    const key = sortConfig.key;
    let aValue = a[key];
    let bValue = b[key];

    if (key === "stockValue" || key === "calculatedStock") {
      aValue = parseFloat(aValue || 0);
      bValue = parseFloat(bValue || 0);
    } else if (key === "CreatedDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return "";
  };

  return (
    <div className="global_container">
      {/* Summary Cards */}
      <div className=" global_sub_container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Stock Value */}
          <div className="p-4 border border-gray-300 rounded-lg shadow-sm flex flex-col items-start">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaChartLine className="text-green-600 text-lg" />
              <span>Total Stock Value</span>
            </div>
            <p className="mt-1 text-xl font-semibold">
              {summaryData.totalStockValue.toFixed(2)}
            </p>
          </div>

          {/* Total Products */}
          <div className="p-4 border border-gray-300 rounded-lg shadow-sm flex flex-col items-start">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaChartLine className="text-blue-600 text-lg" />
              <span>Total Products</span>
            </div>
            <p className="mt-1 text-xl font-semibold">
              {summaryData.totalProducts}
            </p>
          </div>

          {/* Total Brands */}
          <div className="p-4 border border-gray-300 rounded-lg shadow-sm flex flex-col items-start">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaChartLine className="text-purple-600 text-lg" />
              <span>Total Brands</span>
            </div>
            <p className="mt-1 text-xl font-semibold">
              {summaryData.totalBrands}
            </p>
          </div>

          {/* Total Categories */}
          <div className="p-4 border border-gray-300 rounded-lg shadow-sm flex flex-col items-start">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaChartLine className="text-orange-600 text-lg" />
              <span>Total Categories</span>
            </div>
            <p className="mt-1 text-xl font-semibold">
              {summaryData.totalCategories}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Product Brand */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">
              By Product Brand
            </label>
            <Select
              options={brandData.map((b) => ({
                value: b._id,
                label: b.name,
              }))}
              onChange={handleBrandChange}
              placeholder="Select Brand"
              isClearable
              classNamePrefix="react-select"
              // className="w-full"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Product Category */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">
              By Product Category
            </label>
            <Select
              options={categoryData.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              onChange={handleCategoryChange}
              placeholder="Select Category"
              isClearable
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container ">
        <h1 className="global_heading">Product List</h1>
        <div className=" overflow-x-auto ">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th
                  className="global_th"
                  onClick={() => requestSort("productName")}
                >
                  Product {renderSortIcon("productName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => requestSort("brandName")}
                >
                  Brand {renderSortIcon("brandName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => requestSort("categoryName")}
                >
                  Category {renderSortIcon("categoryName")}
                </th>
                <th className="global_th">Purchase</th>
                <th className="global_th">Purchase Return</th>
                <th className="global_th">Total Sold</th>
                <th className="global_th">Return</th>
                <th className="global_th">Damage</th>
                <th className="global_th">Alert Qty</th>
                <th className="global_th">Rate</th>
                <th className="global_th">Stock</th>
                <th className="global_th">Stock Value</th>
                <th className="global_th">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {sortedProducts.map((p, i) => {
                const calculatedStock =
                  (p.qty - p.qtySold || 0) +
                  (p.qtyReturn || 0) -
                  ((p.qtyDamage || 0) + (p.purchaseReturn || 0));
                const stockValue = (p.unitCost * calculatedStock).toFixed(2);

                if (!calculatedStock) return null;

                return (
                  <tr key={i}>
                    <td className="global_td">{p.productName}</td>
                    <td className="global_td">{p.brandName}</td>
                    <td className="global_td">{p.categoryName}</td>
                    <td className="global_td">{p.qty}</td>
                    <td className="global_td">{p.purchaseReturn}</td>
                    <td className="global_td">{p.qtySold}</td>
                    <td className="global_td">{p.qtyReturn}</td>
                    <td className="global_td">{p.qtyDamage}</td>
                    <td className="global_td">{p.alertQuantity}</td>
                    <td className="global_td">{p.unitCost}</td>
                    <td className="global_td">{calculatedStock}</td>
                    <td className="global_td">{stockValue}</td>
                    <td className="global_td">
                      {new Date(p.CreatedDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="10" style={{ textAlign: "right" }}>
                  Total Stock & Value:
                </td>
                <td>
                  {sortedProducts.reduce((total, p) => {
                    const qty = p.qty || 0;
                    const qtySold = p.qtySold || 0;
                    const qtyReturn = p.qtyReturn || 0;
                    const qtyDamage = p.qtyDamage || 0;
                    const purchaseReturn = p.purchaseReturn || 0;
                    return (
                      total +
                      (qty - qtySold + qtyReturn - qtyDamage - purchaseReturn)
                    );
                  }, 0)}
                </td>
                <td>
                  {sortedProducts
                    .reduce((total, p) => {
                      const qty = p.qty || 0;
                      const qtySold = p.qtySold || 0;
                      const qtyReturn = p.qtyReturn || 0;
                      const qtyDamage = p.qtyDamage || 0;
                      const purchaseReturn = p.purchaseReturn || 0;
                      const calculatedStock =
                        qty - qtySold + qtyReturn - qtyDamage - purchaseReturn;
                      return total + (p.unitCost || 0) * calculatedStock;
                    }, 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockReport;
