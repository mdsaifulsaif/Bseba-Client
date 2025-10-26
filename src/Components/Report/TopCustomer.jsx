import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../Helper/SessionHelper";
import DatePicker from "react-datepicker";

import {
  formatISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { BaseURL } from "../../Helper/Config";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const TopCustomer = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState("");
  const [dataList, setDataList] = useState([]);

  //  Fetch Data from API
  const fetchData = async (start, end) => {
    try {
      const res = await axios.get(
        `${BaseURL}/TopListByDate/${formatISO(start)}/${formatISO(end)}`,
        {
          headers: { token: getToken() },
        }
      );

      setDataList(res.data.data || []);
      toast.success("Top List fetched successfully!");
    } catch (error) {
      toast.error("Failed to fetch Top List!");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  //  Handle Period Change
  const handlePeriodChange = (selectedValue) => {
    setPeriod(selectedValue);

    let newStartDate;
    let newEndDate = new Date();

    switch (selectedValue) {
      case "last30days":
        newStartDate = subDays(new Date(), 30);
        break;
      case "thisWeek":
        newStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        newEndDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "lastWeek":
        newStartDate = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        newEndDate = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        break;
      case "thisMonth":
        newStartDate = startOfMonth(new Date());
        newEndDate = endOfMonth(new Date());
        break;
      case "lastMonth":
        newStartDate = startOfMonth(subMonths(new Date(), 1));
        newEndDate = endOfMonth(subMonths(new Date(), 1));
        break;
      case "thisYear":
        newStartDate = startOfYear(new Date());
        newEndDate = endOfYear(new Date());
        break;
      case "lastYear":
        newStartDate = startOfYear(subYears(new Date(), 1));
        newEndDate = endOfYear(subYears(new Date(), 1));
        break;
      default:
        newStartDate = new Date();
        newEndDate = new Date();
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchData(newStartDate, newEndDate);
  };

  return (
    <div className="global_container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="global_sub_container">
        {/* Filter Section */}
        <div className="grid md:grid-cols-3 grid-cols-2 justify-between items-center gap-5">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Period
            </label>
            <Select
              classNamePrefix="react-select"
              options={periodOptions}
              value={periodOptions.find((opt) => opt.value === period) || null}
              onChange={(opt) => handlePeriodChange(opt?.value || "")}
              placeholder="Select Period"
              isClearable
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full"
              calendarClassName="react-datepicker-custom"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full"
              calendarClassName="react-datepicker-custom"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="global_sub_container mt-5">
        <h1 className="text-lg font-semibold mb-3">Top Customer List</h1>
        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Customer Name</th>
                <th className="global_th">Contact</th>
                <th className="global_th">Total Orders</th>
                <th className="global_th">Amount</th>
              </tr>
            </thead>
            <tbody>
              {dataList.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                dataList.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border-r">{index + 1}</td>
                    <td className="px-4 py-2 border-r">{item.name}</td>
                    <td className="px-4 py-2 border-r">{item.contact}</td>
                    <td className="px-4 py-2 border-r">{item.totalOrders}</td>
                    <td className="px-4 py-2">{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopCustomer;
