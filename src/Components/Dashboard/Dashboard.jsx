import React, { useEffect, useState } from "react";

import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken, removeSessions } from "../../Helper/SessionHelper";
import { FaCalendarAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { setGlobalLoader } = loadingStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [lastSaleData, setLastSaleData] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 0))
  );
  const [endDate, setEndDate] = useState(new Date());

  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    const bdOffset = 6 * 60; // minutes
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);

    return bdTime.toISOString();
  };

  const fetchDashboardData = async () => {
    const start = formatDate(startDate, false); // 00:00:00
    const end = formatDate(endDate, true); // 23:59:59

    try {
      setGlobalLoader(true);
      const res = await axios.get(
        `${BaseURL}/GetDashboardData/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        const formattedData = Object.entries(res.data)
          .filter(([key]) => key !== "status") // status বাদ দিতে চাইলে
          .map(([key, value]) => ({
            [key]: value,
          }));

        setDashboardData(formattedData);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
      // removeSessions();
    } finally {
      setGlobalLoader(false);
    }
  };
  // Fetch products with pagination and search
  const fetchLowStockProducts = async () => {
    setGlobalLoader(true);

    try {
      const res = await axios.get(
        `${BaseURL}/ProductLowstockList/${page}/${limit}/${search || 0}`,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        console.log("porduct list", res.data.data || []);
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

  const fetchLastSaleData = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetLastData`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        setLastSaleData(res.data.data);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
      // removeSessions();
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const getAllData = async () => {
      await Promise.all([fetchLastSaleData()]);
    };
    getAllData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    setPage(1);
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [page, search, limit]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardData();
    }
  }, [startDate, endDate]);

  // ---------- DATE RANGE HELPERS ----------
  const startOfDay = (d) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (d) => {
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // helper: Saturday = 6
  const getDiffFromSaturday = (day) => {
    // JS: Sunday = 0 ... Saturday = 6
    return (day + 1) % 7; // Saturday → 0, Sunday → 1, Monday → 2 ... Friday → 6
  };

  const getDateRange = (option) => {
    const now = new Date();
    let start, end;

    switch (option) {
      case "Last 30 Days":
        start = startOfDay(new Date(now));
        start.setDate(now.getDate() - 30);
        end = endOfDay(new Date(now));
        break;

      case "This Year":
        start = startOfDay(new Date(now.getFullYear(), 0, 1));
        end = endOfDay(new Date(now));
        break;

      case "This Month":
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        end = endOfDay(new Date(now));
        break;

      case "This Week":
        const diff = getDiffFromSaturday(now.getDay());
        start = startOfDay(new Date(now));
        start.setDate(now.getDate() - diff);
        end = endOfDay(new Date(now));
        break;

      case "Last Week":
        const diff2 = getDiffFromSaturday(now.getDay());
        end = endOfDay(new Date(now));
        end.setDate(now.getDate() - diff2 - 1); // last week's Friday
        start = startOfDay(new Date(end));
        start.setDate(end.getDate() - 6); // start from Saturday
        break;

      case "Last Month":
        start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;

      case "Last Year":
        start = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
        end = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
        break;

      default:
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        end = endOfDay(new Date(now));
    }

    return { start, end };
  };

  const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // ---------- RENDER ----------
  return (
    <div className="p-1">
      {/* Date Filter */}
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex items-end mb-4">
          <select
            onChange={(e) => {
              const { start, end } = getDateRange(e.target.value);
              setStartDate(start);
              setEndDate(end);
            }}
            className="global_dropdown"
          >
            {[
              "Custom",
              "Last 30 Days",
              "This Week",
              "Last Week",
              "This Month",
              "Last Month",
              "This Year",
              "Last Year",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm">Start Date</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">End Date</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
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
      {/* Total Grid section all Total */}
      <div className="grid grid-cols-4 gap-3">
        {dashboardData?.map((d, i) => {
          const key = Object.keys(d)[0];
          const value = d[key];
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          return (
            <div
              key={i}
              className="p-4 shadow border border-gray-200 rounded-2xl text-center"
            >
              <h2 className="text-sm font-semibold text-gray-500">
                {formattedKey}
              </h2>
              <p className="text-xl font-bold">{value}</p>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
        {/* 🧾 Last Sale */}
        <div className="p-4 rounded-xl shadow text-sm">
          <h2 className="text-lg font-semibold text-blue-600 mb-3">
            🧾 Last Sale
          </h2>
          {lastSaleData?.lastSale ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Reference:</span>{" "}
                {lastSaleData.lastSale.referenceNo}
              </p>
              <p>
                <span className="font-medium">Total:</span>{" "}
                {lastSaleData.lastSale.total}
              </p>
              <p>
                <span className="font-medium">Discount:</span>{" "}
                {lastSaleData.lastSale.discount}
              </p>
              <p>
                <span className="font-medium">Grand Total:</span>{" "}
                {lastSaleData.lastSale.grandTotal}
              </p>
              <p>
                <span className="font-medium">Due Amount:</span>{" "}
                {lastSaleData.lastSale.dueAmount}
              </p>
              <p>
                <span className="font-medium">Profit:</span>{" "}
                {lastSaleData.lastSale.profit}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(lastSaleData.lastSale.CreatedDate).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No Sale Data</p>
          )}
        </div>

        {/* 🛒 Last Purchase */}
        <div className="p-4 rounded-xl shadow text-sm">
          <h2 className="text-lg  font-semibold text-green-600 mb-3">
            🛒 Last Purchase
          </h2>
          {lastSaleData?.lastPurchase ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Reference:</span>{" "}
                {lastSaleData.lastPurchase.referenceNo}
              </p>
              <p>
                <span className="font-medium">Total:</span>{" "}
                {lastSaleData.lastPurchase.total}
              </p>
              <p>
                <span className="font-medium">Grand Total:</span>{" "}
                {lastSaleData.lastPurchase.grandTotal}
              </p>
              <p>
                <span className="font-medium">Due Amount:</span>{" "}
                {lastSaleData.lastPurchase.dueAmount}
              </p>
              <p>
                <span className="font-medium">Note:</span>{" "}
                {lastSaleData.lastPurchase.note || "N/A"}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(
                  lastSaleData.lastPurchase.CreatedDate
                ).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No Purchase Data</p>
          )}
        </div>

        {/* 💰 Last Transaction */}
        <div className=" p-4 rounded-xl shadow text-sm">
          <h2 className="text-lg font-semibold text-purple-600 mb-3">
            💰 Last Transaction
          </h2>
          {lastSaleData?.lastTransaction ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Credit:</span>{" "}
                {lastSaleData.lastTransaction.Credit}
              </p>
              <p>
                <span className="font-medium">Debit:</span>{" "}
                {lastSaleData.lastTransaction.Debit}
              </p>
              <p>
                <span className="font-medium">Discount:</span>{" "}
                {lastSaleData.lastTransaction.Discount}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(
                  lastSaleData.lastTransaction.CreatedDate
                ).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No Transaction Data</p>
          )}
        </div>
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
                    <th className="global_th">Brand Name</th>
                    <th className="global_th">Category Name</th>
                    <th className="global_th">Total Purchase</th>
                    <th className="global_th">Total Sold</th>
                    <th className="global_th">Total Return</th>
                    <th className="global_th">Stock</th>
                    <th className="global_th">Alert Quantity</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {products.map((product, index) => (
                    <tr className="global_tr" key={product._id}>
                      {console.log(product)}
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">
                        {product.productName}{" "}
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
                        {product?.brandName || "N/A"}
                      </td>
                      <td className="global_td">{product?.categoryName}</td>

                      <td className="global_td">
                        {parseFloat(product?.totalQtySold || 0).toFixed(2)}
                      </td>
                      <td className="global_td">
                        {parseFloat(product.totalQtySold || 0).toFixed(2)}
                      </td>

                      <td className="global_td">
                        {product?.totalQtyReturn || "N/A"}
                      </td>
                      <td className="global_td">{product?.stock || "N/A"}</td>
                      <td className="global_td">
                        {product?.alertQuantity || "N/A"}
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

      {/* ---------- SIMPLE SUMMARY CARDS And pie ---------- */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Summary Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 flex-1">
          {summary.map((s, i) => (
            <div
              key={i}
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="px-5 py-1 text-center text-lg font-semibold text-white bg-green-500">
                {s.categoryName}
              </div>
              <div className="p-2 space-y-3">
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-xs ">Total Sales:</span>
                  <span className="text-lg font-bold text-green-600">
                    {s?.totalSales || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Discount</span>
                  <span className="text-sm font-medium text-red-500">
                    {s.totalDiscount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Grand Total</span>
                  <span className="text-sm font-medium text-green-700">
                    {s.totalGrand}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-xs ">Total Collection</span>
                  <span className="text-lg font-bold text-green-500">
                    {s.totalDebit}
                  </span>
                </div>
              </div>
              <div className="px-5 py-2 text-center bg-amber-100 dark:bg-amber-800 text-xs font-medium">
                {s.totalSales > 0
                  ? ((s.totalDebit / s.totalSales) * 100).toFixed(1)
                  : 0}
                % Collection Rate
              </div>
            </div>
          ))}
        </div> */}

        {/* rsm Distribution Pie Chart */}
        {/* <div className=" rounded-xl shadow-md border border-gray-200 w-full lg:w-80 flex-shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={summary}
                cx="45%"
                cy="50%"
                outerRadius={60}
                dataKey="totalSales"
                nameKey="categoryName"
                label={({ name, percent, midAngle, cx, cy, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 10;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fontSize={12}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="fill-gray-800 dark:fill-gray-200" // ✅ light/dark mode
                    >
                      {`${name} ${(percent * 100).toFixed(1)}%`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {summary.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>

              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Example Summary Data Rendering */}

      <div className="flex flex-col gap-2 mt-5">
        {/* MSO */}
        {/* <div className="global_sub_container">
          <h1 className="text-center font-[600] ">MSO</h1>{" "}
          {
            <table className="global_table">
              <thead className="global_thead">
                <th className="global_th">Name</th>
                <th className="global_th">Category</th>
                <th className="global_th">Sale</th>
                <th className="global_th">Discount</th>
                <th className="global_th">Grand</th>
                <th className="global_th">Collection</th>
                <th className="global_th">Details</th>
              </thead>
              <tbody className="global_tbody">
                {[].length > 0 ? (
                  MSOdetails.map((rsm, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{rsm.msoName}</td>
                      <td className="global_td">{rsm.categoryName}</td>
                      <td className="global_td">{rsm.totalSales}</td>
                      <td className="global_td">{rsm.totalDiscount}</td>
                      <td className="global_td">{rsm.totalGrand}</td>

                      <td className="global_td">{rsm.totalDebit}</td>
                      <td className="global_td">
                        <button className="global_button">details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="global_td text-center " colSpan={4}>
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          }
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
