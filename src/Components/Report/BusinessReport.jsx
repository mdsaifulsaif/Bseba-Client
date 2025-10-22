import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaFileInvoiceDollar,
  FaChartLine,
  FaTruck,
  FaExclamationTriangle,
  FaWallet,
  FaUndo,
  FaCreditCard,
  FaCoins,
  FaPercentage,
} from "react-icons/fa";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const BusinessReport = () => {
  const { setGlobalLoader } = loadingStore();
  const [filter, setFilter] = useState("thisWeek");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState({});

  // Apply selected filter to set start/end dates
  const applyFilter = (selectedFilter) => {
    const now = new Date();
    let start, end;

    switch (selectedFilter) {
      case "thisWeek":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        end = new Date(now);
        break;
      case "lastWeek":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now);
        break;
      case "lastYear":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        start = startDate;
        end = endDate;
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Fetch data from API
  const fetchBusinessReportData = async (start, end) => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(
        `${BaseURL}/GetDashboardData/${formatDate(start)}/${formatDate(end)}`,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Re-fetch when filter changes
  useEffect(() => {
    applyFilter(filter);
  }, [filter]);

  // Re-fetch when dates change
  useEffect(() => {
    fetchBusinessReportData(startDate, endDate);
  }, [startDate, endDate]);

  const cards = [
    { title: "Total Sales", value: data.totalSales, icon: <FaShoppingCart /> },
    {
      title: "Total Paid Sales",
      value: data.totalPaidSales,
      icon: <FaFileInvoiceDollar />,
    },
    {
      title: "Total Due Sales",
      value: data.totalDueSales,
      icon: <FaMoneyBillWave />,
    },
    { title: "Total Profit", value: data.totalProfit, icon: <FaChartLine /> },
    {
      title: "Sales Count",
      value: data.salesCount,
      icon: <FaFileInvoiceDollar />,
    },
    {
      title: "Total Purchases",
      value: data.totalPurchases,
      icon: <FaShoppingCart />,
    },
    {
      title: "Total Damage",
      value: data.totalDamage,
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Total Paid Purchases",
      value: data.totalPaidPurchases,
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Total Due Purchases",
      value: data.totalDuePurchases,
      icon: <FaWallet />,
    },
    {
      title: "Purchases Count",
      value: data.purchasesCount,
      icon: <FaFileInvoiceDollar />,
    },
    { title: "Total Expenses", value: data.totalExpenses, icon: <FaWallet /> },
    { title: "Total Credit", value: data.totalCredit, icon: <FaCreditCard /> },
    { title: "Total Debit", value: data.totalDebit, icon: <FaCoins /> },
    { title: "Total Customers", value: data.totalCustomers, icon: <FaUsers /> },
    { title: "Total Suppliers", value: data.totalSuppliers, icon: <FaTruck /> },
    {
      title: "Total Sale Return",
      value: data.totalSaleReturn,
      icon: <FaUndo />,
    },
    {
      title: "Sale Return Profit/Loss",
      value: data.totalSaleReturnProfitLoss,
      icon: <FaChartLine />,
    },
    {
      title: "Quick Sale Amount",
      value: data.totalQuickSaleAmount,
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Discount Debit",
      value: data.totalDiscountDebit,
      icon: <FaPercentage />,
    },
    {
      title: "Discount Credit",
      value: data.totalDiscountCredit,
      icon: <FaPercentage />,
    },
  ];

  return (
    <div className="global_container">
      {/* Filter Section */}
      <div className="p-5 rounded-2xl border-2 border-blue-500 mb-6">
        <h1 className="text-xl font-semibold mb-4">Business Report Filter</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium mb-1">
              Select Period
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="global_input w-full"
            >
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-4">Business Summary</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cards.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-2xl shadow-md border border-gray-200 text-center bg-white hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-3xl text-green-600 mb-2 flex justify-center">
                {item.icon}
              </div>
              <h6 className="text-gray-600 font-medium">{item.title}</h6>
              <h3 className="text-2xl font-bold text-green-700 mt-1">
                {item.value ?? 0}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessReport;
