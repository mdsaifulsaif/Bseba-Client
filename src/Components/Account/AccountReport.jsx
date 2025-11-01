import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { createPortal } from "react-dom";
import loadingStore from "../../Zustand/LoadingStore";

const AccountReport = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [fromAccounts, setFromAccounts] = useState([]);
  const [toAccounts, setToAccounts] = useState([]);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const { setGlobalLoader } = loadingStore();

  // Fetch all accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setGlobalLoader(true);
      try {
        const response = await axios.get(`${BaseURL}/FindAllAccount`, {
          headers: { token: getToken() },
        });
        setAccounts(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch balance transfers
  const fetchBalanceTransfers = async (start, end, accountID) => {
    if (!accountID) return;
    setGlobalLoader(true);
    try {
      const response = await axios.get(
        `${BaseURL}/FindBalanceTransfersByID/${format(
          start,
          "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
        )}/${format(end, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}/${accountID}`,
        {
          headers: { token: getToken() },
        }
      );

      const accountData = response.data?.data[0] || {};
      setFromAccounts(accountData.fromAccounts || []);
      setToAccounts(accountData.toAccounts || []);
    } catch (error) {
      console.error("Failed to fetch balance transfers:", error);
      setFromAccounts([]);
      setToAccounts([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Period change handler
  const handlePeriodChange = (periodValue) => {
    setSelectedPeriod(periodValue);
    let start, end;

    switch (periodValue) {
      case "thisWeek":
        start = startOfWeek(new Date());
        end = endOfWeek(new Date());
        break;
      case "lastWeek":
        start = startOfWeek(subWeeks(new Date(), 1));
        end = endOfWeek(subWeeks(new Date(), 1));
        break;
      case "thisMonth":
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(new Date(), 1));
        end = endOfMonth(subMonths(new Date(), 1));
        break;
      case "thisYear":
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        break;
      case "lastYear":
        start = startOfYear(subYears(new Date(), 1));
        end = endOfYear(subYears(new Date(), 1));
        break;
      default:
        start = startDate;
        end = endDate;
    }

    setStartDate(start);
    setEndDate(end);
    if (selectedAccount)
      fetchBalanceTransfers(start, end, selectedAccount.value);
  };

  // Fetch on account/date change
  useEffect(() => {
    if (selectedAccount) {
      fetchBalanceTransfers(startDate, endDate, selectedAccount.value);
    }
  }, [selectedAccount, startDate, endDate]);

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: acc.name,
  }));

  const periodOptions = [
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

  // Group data by account name
  const groupByAccount = (arr) => {
    const grouped = {};
    arr.forEach((item) => {
      const name = item.name;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(item);
    });
    return grouped;
  };

  const groupedFrom = groupByAccount(fromAccounts);
  const groupedTo = groupByAccount(toAccounts);

  return (
    <div className="global_container">
      {/* Filter Section */}
      <div className="global_sub_container">
        <h1 className="global_heading">Account Report</h1>
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full">
          {/* Account (wider field) */}
          <div className="w-full lg:flex-[1.5]">
            <label className="block text-sm font-medium mb-1">Account</label>
            <Select
              options={accountOptions}
              value={selectedAccount}
              onChange={(option) => setSelectedAccount(option)}
              placeholder="Select an account"
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Period */}
          <div className="w-full lg:flex-1">
            <label className="block text-sm font-medium mb-1">Period</label>
            <Select
              options={periodOptions}
              value={
                periodOptions.find((p) => p.value === selectedPeriod) || null
              }
              onChange={(option) => handlePeriodChange(option.value)}
              placeholder="Select a period"
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Start Date */}
          <div className="w-full lg:flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full pl-10"
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          {/* End Date */}
          <div className="w-full lg:flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full pl-10"
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

      {/* Result Section */}
      <div className="global_sub_container mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Accounts Table */}
          <div className="overflow-x-auto">
            <h4 className="global_heading">From Accounts</h4>
            {Object.keys(groupedFrom).length === 0 ? (
              <p className="text-gray-500">No data found</p>
            ) : (
              Object.keys(groupedFrom).map((name) => (
                <div key={name} className="mb-6">
                  <h5 className="font-semibold mb-2">{name}</h5>
                  <table className="global_table">
                    <thead className="global_thead">
                      <tr>
                        <th className="global_th">#</th>
                        <th className="global_th">Amount</th>
                        <th className="global_th">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedFrom[name].map((acc, index) => (
                        <tr key={index} className="">
                          <td className="global_td">{index + 1}</td>
                          <td className="global_td">{acc.Amount}</td>
                          <td className="global_td">
                            {format(new Date(acc.CreatedDate), "dd-MM-yyyy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          {/* To Accounts Table */}
          <div className="overflow-x-auto">
            <h4 className="global_heading">To Accounts</h4>
            {Object.keys(groupedTo).length === 0 ? (
              <p className="text-gray-500">No data found</p>
            ) : (
              Object.keys(groupedTo).map((name) => (
                <div key={name} className="mb-6">
                  <h5 className="font-semibold  mb-2">{name}</h5>
                  <table className="global_table">
                    <thead className="global_thead">
                      <tr>
                        <th className="global_th">#</th>
                        <th className="global_th">Amount</th>
                        <th className="global_th">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedTo[name].map((acc, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="global_td">{index + 1}</td>
                          <td className="global_td">{acc.Amount}</td>
                          <td className="global_td">
                            {format(new Date(acc.CreatedDate), "dd-MM-yyyy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountReport;
