import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { createPortal } from "react-dom";
import {
  formatISO,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Transaction() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [transactions, setTransactions] = useState([]);
  const [contactDetails, setContactDetails] = useState({});

  // Filter state
  const [filter, setFilter] = useState("last30days");
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  // POST Transaction Form State
  const [credit, setCredit] = useState(0);
  const [debit, setDebit] = useState(0);
  const [note, setNote] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date());

  // POST Discount Form State
  const [discountCredit, setDiscountCredit] = useState(0);
  const [discountDebit, setDiscountDebit] = useState(0);
  const [discountNote, setDiscountNote] = useState("");
  const [discountDate, setDiscountDate] = useState(new Date());

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
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        };
      case "lastWeek": {
        const lastWeek = subWeeks(today, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
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

  const fetchTransactions = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/GetTransactions/${contactID}/${formatISO(
          startDate
        )}/${formatISO(endDate)}`,
        { headers: { token: getToken() } }
      );
      setContactDetails(res.data.contactDetails || {});
      setTransactions(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      toast.error("Failed to fetch transactions");
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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if ((credit <= 0 && debit <= 0) || !createdDate) {
      toast.error("Please enter a valid Credit or Debit and select a date!");
      return;
    }

    setGlobalLoader(true);
    try {
      const payload = {
        contactsID: contactID,
        Credit: Number(credit),
        Debit: Number(debit),
        note,
        CreatedDate: createdDate.toISOString(),
      };
      const res = await axios.post(`${BaseURL}/CreateTransaction`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        toast.success("Transaction added successfully!");
        setCredit(0);
        setDebit(0);
        setNote("");
        setCreatedDate(new Date());
        fetchTransactions();
      } else {
        toast.error(res.data.message || "Failed to create transaction!");
      }
    } catch (error) {
      console.error("Failed to create transaction", error);
      toast.error("Failed to create transaction!");
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if ((discountCredit <= 0 && discountDebit <= 0) || !discountDate) {
      toast.error("Please enter a valid Credit or Debit and select a date!");
      return;
    }

    setGlobalLoader(true);
    try {
      const payload = {
        contactsID: contactID,
        Credit: Number(discountCredit),
        Debit: Number(discountDebit),
        note: discountNote,
        CreatedDate: discountDate.toISOString(),
      };
      const res = await axios.post(`${BaseURL}/CreateDiscount`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        toast.success("Discount added successfully!");
        setDiscountCredit(0);
        setDiscountDebit(0);
        setDiscountNote("");
        setDiscountDate(new Date());
        fetchTransactions();
      } else {
        toast.error(res.data.message || "Failed to add discount!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add discount!");
    } finally {
      setGlobalLoader(false);
    }
  };
  // Totals calculation
  //   const totals = transactions.reduce(
  //     (acc, t) => {
  //       // Payment/Sale + Direct Txn (exclude Discount)
  //       if (
  //         (t.Credit > 0 && t.Debit === 0 && t.Discount !== "1") ||
  //         (!t.saleID && !t.purchaseID && t.Discount !== "1")
  //       ) {
  //         acc.paymentSale += t.Credit || 0;
  //       }

  //       acc.purchaseReceived +=
  //         t.Debit && t.Credit === 0 && t.Discount !== "1" ? t.Debit : 0;
  //       acc.discountReceived += t.Discount === "1" ? t.Credit || 0 : 0;
  //       acc.discount += t.Discount === "1" ? t.Debit || 0 : 0;
  //       acc.closingBalance += (t.TotalCredit || 0) - (t.TotalDebit || 0);

  //       return acc;
  //     },
  //     {
  //       paymentSale: 0,
  //       purchaseReceived: 0,
  //       discountReceived: 0,
  //       discount: 0,
  //       closingBalance: 0,
  //     }
  //   );

  const totals = transactions.reduce(
    (acc, t) => {
      // Payment/Sale = normal Credit transactions + Direct Txn (no discount)
      acc.paymentSale +=
        (t.Credit > 0 && t.Discount !== "1") ||
        (!t.saleID && !t.purchaseID && t.Discount !== "1")
          ? t.Credit || 0
          : 0;

      // Purchase/Received = normal Debit transactions (no discount)
      acc.purchaseReceived += t.Debit > 0 && t.Discount !== "1" ? t.Debit : 0;

      // Discount columns
      acc.discountReceived += t.Discount === "1" ? t.Credit || 0 : 0;
      acc.discount += t.Discount === "1" ? t.Debit || 0 : 0;

      // Closing balance
      acc.closingBalance += (t.TotalCredit || 0) - (t.TotalDebit || 0);

      return acc;
    },
    {
      paymentSale: 0,
      purchaseReceived: 0,
      discountReceived: 0,
      discount: 0,
      closingBalance: 0,
    }
  );

  return (
    <div className="global_container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Add Transaction Form */}
      <div className="global_sub_container mb-6">
        <h1 className="text-lg font-semibold mb-3">
          Add Transaction ({contactDetails.name})
        </h1>
        <form
          onSubmit={handleAddTransaction}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="flex flex-col">
            <label className="font-medium mb-1">Payment / Sale (Credit)</label>
            <input
              type="number"
              className="global_input"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder="Enter Credit"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Purchase / Received (Debit)
            </label>
            <input
              type="number"
              className="global_input"
              value={debit}
              onChange={(e) => setDebit(e.target.value)}
              placeholder="Enter Debit"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">Note</label>
            <input
              type="text"
              className="global_input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">Date</label>
            <DatePicker
              selected={createdDate}
              onChange={(date) => setCreatedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>
          <div className="md:col-span-4 mt-2">
            <button type="submit" className="global_button">
              Add Transaction
            </button>
          </div>
        </form>
      </div>

      {/* Add Discount Form */}
      <div className="global_sub_container mb-6">
        <h1 className="text-lg font-semibold mb-3">
          Add Discount ({contactDetails.name})
        </h1>
        <form
          onSubmit={handleAddDiscount}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Discount Received (Credit)
            </label>
            <input
              type="number"
              className="global_input"
              value={discountCredit}
              onChange={(e) => setDiscountCredit(e.target.value)}
              placeholder="Enter Credit"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">Discount (Debit)</label>
            <input
              type="number"
              className="global_input"
              value={discountDebit}
              onChange={(e) => setDiscountDebit(e.target.value)}
              placeholder="Enter Debit"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">Note</label>
            <input
              type="text"
              className="global_input"
              value={discountNote}
              onChange={(e) => setDiscountNote(e.target.value)}
              placeholder="Enter note"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Date</label>
            <DatePicker
              selected={discountDate}
              onChange={(date) => setDiscountDate(date)}
              dateFormat="dd/MM/yyyy"
              className="global_input w-full"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>
          <div className="md:col-span-4 mt-2">
            <button type="submit" className="global_button">
              Add Discount
            </button>
          </div>
        </form>
      </div>

      {/* Contact Details */}
      <div className="global_sub_container mb-4">
        <h1 className="text-xl font-semibold mb-2">Transaction Report</h1>
        <div className="flex flex-col gap-3 md:flex-row justify-between">
          <div>
            <h2>
              <span className="font-semibold">Name:</span> {contactDetails.name}
            </h2>
            <h2>
              <span className="font-semibold">Phone:</span>{" "}
              {contactDetails.mobile}
            </h2>
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {contactDetails.address}
            </p>
          </div>
          <h2 className="text-xl font-bold text-green-600">
            {contactDetails.ClosingBalance < 0 ? "Payable" : "Receivable"}{" "}
            Closing Balance:{" "}
            <span className="text-2xl font-extrabold dark:text-gray-100 text-gray-900">
              {Math.abs(contactDetails.ClosingBalance || 0).toLocaleString()}
            </span>
          </h2>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="global_sub_container">
        {/* Filter */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Select Period:</label>
            <select
              className="global_dropdown w-full"
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

        <div className="overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Date</th>
                <th className="global_th">Type</th>
                <th className="global_th">Payment /Sale</th>
                <th className="global_th">Purchase /Received</th>
                <th className="global_th">Discount Received</th>
                <th className="global_th">Discount</th>
                <th className="global_th">Closing Balance</th>
                <th className="global_th">Note</th>
                <th className="global_th">Actions</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t, i) => {
                  // Determine transaction type
                  let type = "Direct Txn";
                  if (t.Credit > 0 && t.Discount !== "1") type = "Payment/Sale";
                  else if (t.Debit > 0 && t.Discount !== "1")
                    type = "Purchase/Received";
                  else if (t.Discount === "1") type = "Discount Received";

                  // Calculate columns
                  const paymentSale =
                    t.Credit > 0 && t.Discount !== "1"
                      ? (t.Credit || 0).toFixed(2)
                      : "0.00";

                  const purchaseReceived =
                    t.Debit > 0 && t.Discount !== "1"
                      ? (t.Debit || 0).toFixed(2)
                      : "0.00";

                  const discountReceived =
                    t.Discount === "1" && t.Credit > 0
                      ? (t.Credit || 0).toFixed(2)
                      : "0.00";

                  const discount =
                    t.Discount === "1" && t.Debit > 0
                      ? (t.Debit || 0).toFixed(2)
                      : "0.00";

                  // Closing Balance logic
                  const balance = (t.TotalCredit || 0) - (t.TotalDebit || 0);
                  const closingBalanceLabel =
                    balance > 0
                      ? `Receivable: ${balance.toFixed(2)}`
                      : balance < 0
                      ? `Payable: ${Math.abs(balance).toFixed(2)}`
                      : "0.00";

                  return (
                    <tr key={t._id}>
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">
                        {new Date(t.CreatedDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="global_td">{type}</td>
                      <td className="global_td">{paymentSale}</td>
                      <td className="global_td">{purchaseReceived}</td>
                      <td className="global_td">{discountReceived}</td>
                      <td className="global_td">{discount}</td>
                      <td
                        className={`global_td ${
                          balance > 0
                            ? "text-green-600"
                            : balance < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {closingBalanceLabel}
                      </td>
                      <td className="global_td">{t.note || "-"}</td>
                      <td className="global_td text-center">
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
                            className="global_button"
                          >
                            Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No Transactions Found
                  </td>
                </tr>
              )}

              {/* Totals Row */}
              <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                <td colSpan="3" className="text-right px-2">
                  Total
                </td>
                <td className="global_td">{totals.paymentSale.toFixed(2)}</td>
                <td className="global_td">
                  {totals.purchaseReceived.toFixed(2)}
                </td>
                <td className="global_td">
                  {totals.discountReceived.toFixed(2)}
                </td>
                <td className="global_td">{totals.discount.toFixed(2)}</td>
                <td className="global_td">
                  {/* {totals.closingBalance.toFixed(2)} */}
                  <h2 className="">
                    {contactDetails.ClosingBalance > 0
                      ? "Payable"
                      : "Receivable"}{" "}
                    <span className="">
                      {Math.abs(
                        contactDetails.ClosingBalance || 0
                      ).toLocaleString()}
                    </span>
                  </h2>
                </td>
                <td className="global_td" colSpan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transaction;
