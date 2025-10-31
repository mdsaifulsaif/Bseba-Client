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
import { createPortal } from "react-dom";

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

const SalesReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState("");
  const [dataList, setDataList] = useState([]);

  //  API Call
  const fetchData = async (start, end) => {
    try {
      const url = `${BaseURL}/SalesListByDate/${formatISO(start)}/${formatISO(
        end
      )}`;
      console.log(" API Called:", url);

      const res = await axios.get(url, {
        headers: { token: getToken() },
      });

      console.log(" API Response:", res.data);
      setDataList(res.data.data || []);
      toast.success("Sales data fetched successfully!");
    } catch (error) {
      console.error(" API Error:", error);
      toast.error("Failed to fetch sales report data!");
    }
  };

  //  Initial fetch
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

    //  Select পরিবর্তন হলে সঙ্গে সঙ্গে API কল হবে
    fetchData(newStartDate, newEndDate);
  };

  return (
    <div className="global_container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="global_sub_container">
        {/* Filter Section */}
        <div className="grid md:grid-cols-4 grid-cols-2 justify-between items-center gap-5">
          {/* Period Select */}
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>

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
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full "
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
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full "
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name or invoice"
              className="global_input w-full"
            />
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="global_sub_container mt-5">
        <h1 className="text-lg font-semibold mb-2">Sales Report Data</h1>
        <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
          {JSON.stringify(dataList, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SalesReport;
