import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import {
  format,
  formatISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  subDays,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";

function Transaction() {
  const { id } = useParams();
  console.log(id);
  const { setGlobalLoader } = loadingStore();
  const [transactions, setTransactions] = useState([]);
  const [contactDetails, setContactDetails] = useState({});
  const [filter, setFilter] = useState("last30days");
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  const contactID = id;

  const filters = [
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

  const getDateRange = (selectedFilter) => {
    const today = new Date();
    switch (selectedFilter) {
      case "last30days":
        return { start: subDays(today, 30), end: today };
      case "thisWeek":
        return { start: startOfWeek(today), end: endOfWeek(today) };
      case "lastWeek": {
        const lastWeek = subWeeks(today, 1);
        return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) };
      }
      case "thisMonth":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "lastMonth": {
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case "thisYear":
        return { start: startOfYear(today), end: endOfYear(today) };
      case "lastYear": {
        const lastYear = subYears(today, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
      default:
        return { start: subDays(today, 30), end: today };
    }
  };

  //   const fetchTransactions = async () => {
  //     setGlobalLoader(true);
  //     try {
  //       const res = await axios.get(
  //         `${BaseURL}/GetTransactions/${contactID}/${formatISO(
  //           startDate
  //         )}/${formatISO(endDate)}`,
  //         {
  //           headers: { token: getToken() },
  //         }
  //       );

  //       setContactDetails(res.data.contactDetails || {});
  //       setTransactions(res.data.data || []);
  //     } catch (error) {
  //       console.error("Failed to fetch transactions", error);
  //     } finally {
  //       setGlobalLoader(false);
  //     }
  //   };

  const fetchTransactions = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/GetTransactions/${contactID}/${formatISO(
          startDate
        )}/${formatISO(endDate)}`,
        { headers: { token: getToken() } }
      );

      // ✅ set contactDetails and transactions
      setContactDetails(res.data.contactDetails || {});
      setTransactions(res.data.data || []);

      console.log("Contact Details:", res.data.contactDetails);
      console.log("Transactions:", res.data.data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (filter !== "custom") {
      const { start, end } = getDateRange(filter);
      setStartDate(start);
      setEndDate(end);
    }
  }, [filter]);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, contactID]);

  const totalCredit = transactions.reduce((acc, t) => acc + (t.Credit || 0), 0);
  const totalDebit = transactions.reduce((acc, t) => acc + (t.Debit || 0), 0);

  return (
    <div className="global_container">
      {/* Add Discount */}
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-4">
          Add Discount ({contactDetails.name})
        </h1>
      </div>
      {/* contact details  */}
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-4">Transaction Report</h1>

        <div className="flex flex-col gap-3 md:flex-row justify-between">
          <div>
            <h1>
              <span className="font-semibold">Name:</span> {contactDetails.name}
            </h1>
            <h1>
              <span className="font-semibold">Phone:</span>{" "}
              {contactDetails.mobile}
            </h1>
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {contactDetails.address}
            </p>
          </div>
          <h2 className="text-xl font-bold text-blue-600">
            Receivable Closing Balance:{" "}
            <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 ">
              {contactDetails.ClosingBalance !== undefined
                ? Math.abs(contactDetails.ClosingBalance).toLocaleString()
                : "0.00"}
            </span>
          </h2>
        </div>
      </div>
      {/* Table Data  */}
      <div className="global_sub_container">
        {/*  Filter */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Select Period:</label>
            <select
              className="global_input w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full"
            />
          </div>
        </div>

        {/*  Table */}
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Date</th>
              <th className="global_th">Type</th>
              <th className="global_th">Payment/Sale</th>
              <th className="global_th">Purchase/Received</th>
              <th className="global_th">Discount Received</th>
              <th className="global_th">Discount</th>
              <th className="global_th">Closing Balance</th>
              <th className="global_th">Note</th>
              <th className="global_th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t, i) => (
                <tr key={t._id}>
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">
                    {format(new Date(t.CreatedDate), "dd/MM/yyyy hh:mm a")}
                  </td>

                  {/* Type */}
                  <td className="global_td">
                    {t.Credit > 0 && t.Debit === 0
                      ? "Payment/Sale"
                      : t.Debit > 0 && t.Credit === 0
                      ? "Purchase/Received"
                      : t.Discount === "1"
                      ? "Discount Received"
                      : "Direct Txn"}
                  </td>

                  {/* Payment/Sale */}
                  <td className="global_td">
                    {t.Credit?.toFixed(2) || "0.00"}
                  </td>

                  {/* Purchase/Received */}
                  <td className="global_td">{t.Debit?.toFixed(2) || "0.00"}</td>

                  {/* Discount Received */}
                  <td className="global_td">
                    {t.Discount === "1" ? (t.Credit || 0).toFixed(2) : "0.00"}
                  </td>

                  {/* Discount */}
                  <td className="global_td">
                    {t.Discount === "1" ? (t.Debit || 0).toFixed(2) : "0.00"}
                  </td>

                  {/* Closing Balance */}
                  <td className="global_td">
                    {(t.TotalCredit - t.TotalDebit).toFixed(2)}
                  </td>

                  {/* Note */}
                  <td className="global_td">{t.note || "-"}</td>

                  {/* Actions (example, Sale/Purchase/Direct links) */}
                  <td className="global_td">
                    {/* Example: show buttons conditionally */}
                    {t.saleID && (
                      <Link
                        to={`/SaleDetails/${t.saleID}`}
                        className="btn btn-sm btn-success"
                      >
                        Sale
                      </Link>
                    )}
                    {t.purchaseID && (
                      <Link
                        to={`/PurchaseDetails/${t.purchaseID}`}
                        className="btn btn-sm btn-primary"
                      >
                        Purchase
                      </Link>
                    )}
                    {!t.saleID && !t.purchaseID && (
                      <Link
                        to={`/TransactionDetails/${t._id}`}
                        className="btn btn-sm btn-warning"
                      >
                        Details
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  No Transactions Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transaction;
