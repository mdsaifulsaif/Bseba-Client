import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { getToken, removeSessions } from "../../Helper/SessionHelper";
import { BaseURL } from "../../Helper/Config";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  FaCalendarAlt,
  FaSearch,
  FaSpinner,
  FaChartBar,
  FaChartPie,
  FaDollarSign,
  FaPercentage,
} from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  // State management
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [rsmData, setRsmData] = useState([]);
  const [asmData, setAsmData] = useState([]);
  const [msoData, setMsoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date state with proper initial values
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(() => new Date());
  const [selectedRange, setSelectedRange] = useState("This Month");

  // Memoized date range options
  const dateRangeOptions = useMemo(
    () => [
      "Last 30 Days",
      "This Year",
      "This Month",
      "This Week",
      "Last Week",
      "Last Month",
      "Last Year",
    ],
    []
  );

  // Enhanced date range calculation function
  const getDateRange = useCallback((option) => {
    const now = new Date();
    let start, end;

    const startOfDay = (d) => {
      const newDate = new Date(d);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };

    const endOfDay = (d) => {
      const newDate = new Date(d);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    };

    const getDiffFromSaturday = (day) => (day + 1) % 7;

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
        end.setDate(now.getDate() - diff2 - 1);
        start = startOfDay(new Date(end));
        start.setDate(end.getDate() - 6);
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
  }, []);

  // Process and aggregate data for better visualization
  const processedData = useMemo(() => {
    // Calculate summary metrics
    const totalSales = categoryData.reduce(
      (sum, item) => sum + (item.totalSales || 0),
      0
    );
    const totalDiscount = categoryData.reduce(
      (sum, item) => sum + (item.totalDiscount || 0),
      0
    );
    const totalGrand = categoryData.reduce(
      (sum, item) => sum + (item.totalGrand || 0),
      0
    );
    const totalDebit = categoryData.reduce(
      (sum, item) => sum + (item.totalDebit || 0),
      0
    );

    // Aggregate RSM data by name
    const rsmAggregated = rsmData.reduce((acc, item) => {
      const existing = acc.find((r) => r.rsmName === item.rsmName);
      if (existing) {
        existing.totalSales += item.totalSales || 0;
        existing.totalDiscount += item.totalDiscount || 0;
        existing.totalGrand += item.totalGrand || 0;
        existing.totalDebit += item.totalDebit || 0;
      } else {
        acc.push({
          rsmName: item.rsmName,
          totalSales: item.totalSales || 0,
          totalDiscount: item.totalDiscount || 0,
          totalGrand: item.totalGrand || 0,
          totalDebit: item.totalDebit || 0,
        });
      }
      return acc;
    }, []);

    // Aggregate ASM data by name
    const asmAggregated = asmData.reduce((acc, item) => {
      const existing = acc.find((a) => a.asmName === item.asmName);
      if (existing) {
        existing.totalSales += item.totalSales || 0;
        existing.totalDiscount += item.totalDiscount || 0;
        existing.totalGrand += item.totalGrand || 0;
        existing.totalDebit += item.totalDebit || 0;
      } else {
        acc.push({
          asmName: item.asmName,
          totalSales: item.totalSales || 0,
          totalDiscount: item.totalDiscount || 0,
          totalGrand: item.totalGrand || 0,
          totalDebit: item.totalDebit || 0,
        });
      }
      return acc;
    }, []);

    // Top performing categories
    const topCategories = [...categoryData]
      .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
      .slice(0, 5);

    return {
      summary: { totalSales, totalDiscount, totalGrand, totalDebit },
      rsmAggregated,
      asmAggregated,
      topCategories,
    };
  }, [categoryData, rsmData, asmData]);

  // Enhanced API error handling
  const handleApiError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);

    if (error.response?.status === 401) {
      removeSessions();
      window.location.href = "/login";
    } else {
      setError(`Failed to load ${context}. Please try again.`);
    }
  }, []);

  // Fetch sales data with better error handling
  const fetchSalesData = useCallback(async () => {
    setSalesLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        removeSessions();
        return;
      }

      const res = await axios.get(`${BaseURL}/Last30DaysSale`, {
        headers: { token },
        timeout: 10000,
      });

      if (res.data?.status === "success") {
        const formattedData = Object.entries(res.data.data || {}).map(
          ([date, value]) => ({
            date: new Date(date).toLocaleDateString(),
            sales: Number(value) || 0,
          })
        );
        setSalesData(formattedData);
      } else {
        throw new Error(res.data?.message || "Failed to fetch sales data");
      }
    } catch (error) {
      handleApiError(error, "sales data");
    } finally {
      setSalesLoading(false);
    }
  }, [handleApiError]);

  // Enhanced date range data fetching
  const fetchDataByDateRange = useCallback(
    async (customStart = null, customEnd = null) => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) {
          removeSessions();
          return;
        }

        const start = customStart || startDate;
        const end = customEnd || endDate;

        const formatDate = (date) => {
          return date.toISOString().split("T")[0];
        };

        const res = await axios.get(
          `${BaseURL}/GetByDate/${formatDate(start)}/${formatDate(end)}`,
          {
            headers: { token },
            timeout: 15000,
          }
        );

        if (res.data?.status === "Success") {
          setCategoryData(res.data.summary || []);
          setRsmData(res.data.detailsByRSM || []);
          setAsmData(res.data.detailsByASM || []);
          setMsoData(res.data.detailsByMSO || []);
        } else {
          throw new Error(res.data?.message || "Failed to fetch data");
        }
      } catch (error) {
        handleApiError(error, "date range data");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, handleApiError]
  );

  // Handle date range selection
  const handleDateRangeChange = useCallback(
    (range) => {
      setSelectedRange(range);
      const { start, end } = getDateRange(range);
      setStartDate(start);
      setEndDate(end);
      fetchDataByDateRange(start, end);
    },
    [getDateRange, fetchDataByDateRange]
  );

  // Handle custom date search
  const handleCustomDateSearch = useCallback(() => {
    setSelectedRange("Custom");
    fetchDataByDateRange();
  }, [fetchDataByDateRange]);

  // Initial data loading
  useEffect(() => {
    fetchSalesData();
    fetchDataByDateRange();
  }, []);

  // Chart configuration
  const chartConfig = useMemo(
    () => ({
      colors: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
      ],
      barColors: {
        totalSales: "#3B82F6",
        totalDiscount: "#10B981",
        totalGrand: "#F59E0B",
        totalDebit: "#EF4444",
      },
    }),
    []
  );

  // Enhanced custom tooltip
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                {entry.name}:
              </span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Summary cards component
  const SummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Sales</p>
            <p className="text-2xl font-bold">
              {formatCurrency(processedData.summary.totalSales)}
            </p>
          </div>
          <FaDollarSign className="text-3xl text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Total Collection</p>

            <p className="text-2xl font-bold">
              {formatCurrency(processedData.summary.totalDebit)}
            </p>
          </div>
          <FaChartBar className="text-3xl text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Total Discount</p>
            <p className="text-2xl font-bold">
              {formatCurrency(processedData.summary.totalDiscount)}
            </p>
          </div>
          <FaPercentage className="text-3xl text-yellow-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">Total Debit</p>
            <p className="text-2xl font-bold">
              {formatCurrency(processedData.summary.totalGrand)}
            </p>
          </div>
          <FaChartPie className="text-3xl text-red-200" />
        </div>
      </div>
    </div>
  );

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
      <span className="text-lg text-gray-600 dark:text-gray-400">
        Loading dashboard...
      </span>
    </div>
  );

  // Error display component
  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="text-red-600 dark:text-red-400 text-lg mb-4">
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );

  if (loading && categoryData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Sales Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive view of your sales performance and analytics
          </p>
        </div>

        {/* Enhanced Date Filter Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Custom Date Range */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="min-w-[160px]">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    dateFormat="dd-MM-yyyy"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    popperPlacement="bottom-start"
                    popperClassName="z-[9999]"
                    calendarClassName="react-datepicker-custom"
                    popperContainer={(props) =>
                      createPortal(<div {...props} />, document.body)
                    }
                    maxDate={endDate}
                  />
                </div>
              </div>

              <div className="min-w-[160px]">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    dateFormat="dd-MM-yyyy"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    popperPlacement="bottom-start"
                    popperClassName="z-[9999]"
                    calendarClassName="react-datepicker-custom"
                    popperContainer={(props) =>
                      createPortal(<div {...props} />, document.body)
                    }
                    minDate={startDate}
                    maxDate={new Date()}
                  />
                </div>
              </div>

              <button
                onClick={handleCustomDateSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <FaSearch />
                Search
              </button>
            </div>

            {/* Preset Range Selector */}
            <div className="flex items-end">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Quick Select
                </label>
                <select
                  value={selectedRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="min-w-[160px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Display current date range */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Selected Period: </span>
              {startDate.toLocaleDateString("en-GB")} -{" "}
              {endDate.toLocaleDateString("en-GB")}
              {selectedRange !== "Custom" && (
                <span className="ml-3 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                  {selectedRange}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            message={error}
            onRetry={() => {
              setError(null);
              fetchSalesData();
              fetchDataByDateRange();
            }}
          />
        )}

        {/* Summary Cards */}
        {!loading && categoryData.length > 0 && <SummaryCards />}

        {/* Category Analysis */}
        {!loading && categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              <FaChartBar className="text-blue-500" />
              Category Performance Analysis
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Enhanced Bar Chart */}
              <div className="h-96">
                <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Sales vs Collection vs Discount
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis
                      dataKey="categoryName"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="totalSales"
                      fill={chartConfig.barColors.totalSales}
                      name="Total Sales"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="totalGrand"
                      fill={chartConfig.barColors.totalGrand}
                      name="Collection"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="totalDiscount"
                      fill={chartConfig.barColors.totalDiscount}
                      name="Discount"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Pie Chart */}
              <div className="h-96">
                <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Sales Distribution by Category
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.filter(
                        (item) => item.categoryName && item.totalSales > 0
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="totalSales"
                      nameKey="categoryName"
                      label={({ name, percent }) =>
                        `${name}\n${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            chartConfig.colors[
                              index % chartConfig.colors.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* RSM Performance */}
        {!loading && processedData.rsmAggregated.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              Regional Sales Manager Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.rsmAggregated}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="rsmName"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="totalSales"
                    fill={chartConfig.barColors.totalSales}
                    name="Total Sales"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalGrand"
                    fill={chartConfig.barColors.totalGrand}
                    name="Collection"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ASM Performance */}
        {!loading && processedData.asmAggregated.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              Area Sales Manager Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.asmAggregated}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="asmName"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="totalSales"
                    fill={chartConfig.barColors.totalSales}
                    name="Total Sales"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalGrand"
                    fill={chartConfig.barColors.totalGrand}
                    name="Collection"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* MSO Performance */}
        {!loading && msoData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              Market Sales Officer Performance
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={msoData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="msoName"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="totalSales"
                    fill={chartConfig.barColors.totalSales}
                    name="Total Sales"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalGrand"
                    fill={chartConfig.barColors.totalGrand}
                    name="Collection"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {msoData.length > 10 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Showing top 10 MSOs. Total: {msoData.length} MSOs
              </p>
            )}
          </div>
        )}

        {/* Performance Summary Table */}
        {!loading && categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Detailed Performance Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Collection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Collection %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categoryData.map((category, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(category.totalSales)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(category.totalGrand)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(category.totalDiscount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(category.totalDebit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (category.totalGrand / category.totalSales) * 100 >=
                            90
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : (category.totalGrand / category.totalSales) *
                                  100 >=
                                75
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {(
                            (category.totalGrand / category.totalSales) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!loading && categoryData.length === 0 && !error && (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No sales data found for the selected date range. Try selecting a
              different period or check if there are any sales records.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>Dashboard last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
