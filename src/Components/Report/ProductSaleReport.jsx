import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { AiOutlineEye } from "react-icons/ai";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import Select from "react-select";
import { createPortal } from "react-dom";

const ProductSalesReport = () => {
  const [salesList, setSalesList] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [period, setPeriod] = useState("");
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  const periodOptions = [
    { value: "", label: "Select Period" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

  // Fetch products
  const fetchProducts = async (search = "") => {
    try {
      const res = await axios.get(`${BaseURL}/ProductList/1/10/${search}`, {
        headers: { token: getToken() },
      });
      console.log(res.data);
      setProducts(res.data.data || []);
    } catch (err) {
      console.log("Failed to fetch products");
    }
  };

  // Fetch sales
  const fetchSales = async () => {
    if (!selectedProductId) return;
    try {
      const res = await axios.get(
        `${BaseURL}/ProductSalesReport/${formatISO(startDate)}/${formatISO(
          endDate
        )}/${selectedProductId}`,
        { headers: { token: getToken() } }
      );
      console.log("product sele report data", res.data);
      setSalesList(res.data.data || []);
    } catch (err) {
      console.log("Failed to fetch sales data");
    }
  };

  useEffect(() => {
    fetchSales();
  }, [selectedProductId, startDate, endDate]);

  // Search debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProducts(value), 300);
  };

  const handleProductSelect = (id, name) => {
    setSelectedProductId(id);
    setSearchTerm(name);
    setProducts([]);
  };

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });

    const sorted = [...salesList].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSalesList(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Date range shortcuts
  const handlePeriodChange = (e) => {
    const selected = e.target.value;
    setPeriod(selected);
    let start = new Date();
    let end = new Date();

    switch (selected) {
      case "last30days":
        start.setDate(end.getDate() - 30);
        break;
      case "thisWeek":
        start.setDate(end.getDate() - end.getDay());
        break;
      case "lastWeek":
        const lastWeekStart = new Date();
        lastWeekStart.setDate(end.getDate() - (end.getDay() + 7));
        start = lastWeekStart;
        end.setDate(lastWeekStart.getDate() + 6);
        break;
      case "thisMonth":
        start.setDate(1);
        break;
      case "lastMonth":
        start.setMonth(end.getMonth() - 1);
        start.setDate(1);
        end.setMonth(end.getMonth() - 1);
        end.setDate(
          new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()
        );
        break;
      case "thisYear":
        start.setMonth(0);
        start.setDate(1);
        break;
      case "lastYear":
        start.setFullYear(end.getFullYear() - 1);
        start.setMonth(0);
        start.setDate(1);
        end.setFullYear(end.getFullYear() - 1);
        end.setMonth(11);
        end.setDate(31);
        break;
      default:
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="global_heading">Product Sales Report</h1>

        {/* ===== Filters Section ===== */}
        <div className=" ">
          {/* Row 1: Product Search & Period Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Product Search */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Search Product
              </label>
              <input
                type="text"
                placeholder="Type product name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="global_input"
              />

              {/* Autocomplete dropdown */}
              {products.length > 0 && searchTerm && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                  {products.map((p) => (
                    <li
                      key={p._id}
                      onClick={() => handleProductSelect(p._id, p.name)}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-700"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Period Select */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Period
              </label>
              <Select
                value={periodOptions.find((opt) => opt.value === period)}
                onChange={(selectedOption) => {
                  setPeriod(selectedOption?.value || "");
                  handlePeriodChange({
                    target: { value: selectedOption?.value || "" },
                  });
                }}
                options={periodOptions}
                className="react-select-container"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                classNamePrefix="react-select"
                placeholder="Select Period"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Select Period
              </label>
              <select
                value={period}
                onChange={handlePeriodChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Period</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div> */}
          </div>

          {/* Row 2: Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={(d) => setStartDate(d)}
                className="global_input w-full"
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(d) => setEndDate(d)}
                className="global_input w-full"
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="global_sub_container overflow-x-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Product</th>
              <th className="global_th">Brand</th>
              <th className="global_th">Category</th>
              <th className="global_th" onClick={() => handleSort("price")}>
                Price {getSortIcon("price")}
              </th>
              <th className="global_th" onClick={() => handleSort("qtySold")}>
                Qty {getSortIcon("qtySold")}
              </th>
              <th className="global_th" onClick={() => handleSort("total")}>
                Total {getSortIcon("total")}
              </th>
              <th className="global_th" onClick={() => handleSort("profit")}>
                Profit {getSortIcon("profit")}
              </th>
              <th className="global_th">Sale Date</th>
              <th className="global_th">Invoice</th>
            </tr>
          </thead>

          <tbody className="global_tbody">
            {salesList.map((s, i) => (
              <tr key={s._id}>
                <td className="global_td">{i + 1}</td>
                <td className="global_td">{s.productDetails?.name || "N/A"}</td>
                <td className="global_td">{s.brand?.name || "N/A"}</td>
                <td className="global_td">{s.category?.name || "N/A"}</td>
                <td className="global_td">{s.price}</td>
                <td className="global_td">{s.qtySold}</td>
                <td className="global_td">{s.total}</td>
                <td className="global_td">{s.profit}</td>
                <td className="global_td">
                  {new Date(s.CreatedDate).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="global_td">
                  <button onClick={() => navigate(`/SaleDetails/${s.saleID}`)}>
                    <AiOutlineEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td className="global_td" colSpan="5">
                Total:
              </td>
              <td className="global_td">
                {salesList.reduce((sum, s) => sum + (s.qtySold || 0), 0)}
              </td>
              <td className="global_td">
                {salesList.reduce((sum, s) => sum + (s.total || 0), 0)}
              </td>
              <td className="global_td">
                {salesList.reduce((sum, s) => sum + (s.profit || 0), 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProductSalesReport;
