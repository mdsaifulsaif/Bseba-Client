import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { toast } from "react-hot-toast";
import { AiOutlineEye } from "react-icons/ai";
import DatePicker from "react-datepicker";
import Select from "react-select";
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
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const TransactionReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(new Date()); // আজকের তারিখ
  const [endDate, setEndDate] = useState(new Date()); // আজকের তারিখ
  const [period, setPeriod] = useState({ value: "today", label: "Today" }); // React Select এর জন্য object
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Period options
  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

  // Fetch API
  const fetchTransactions = async (start, end) => {
    try {
      const res = await axios.get(
        `${BaseURL}/AllTransactions/${formatISO(start)}/${formatISO(end)}`,
        { headers: { token: getToken() } }
      );
      setTransactions(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transactions");
    }
  };

  // Load current day by default
  useEffect(() => {
    fetchTransactions(startDate, endDate);
  }, [startDate, endDate]);

  // Handle period change (React Select version)
  const handlePeriodChange = (selectedOption) => {
    if (!selectedOption) return;
    setPeriod(selectedOption);

    let newStartDate = new Date();
    let newEndDate = new Date();

    switch (selectedOption.value) {
      case "today":
        newStartDate = new Date();
        newEndDate = new Date();
        break;
      case "thisWeek":
        newStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "lastWeek":
        newStartDate = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        newEndDate = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        break;
      case "thisMonth":
        newStartDate = startOfMonth(new Date());
        break;
      case "lastMonth":
        newStartDate = startOfMonth(subMonths(new Date(), 1));
        newEndDate = endOfMonth(subMonths(new Date(), 1));
        break;
      case "thisYear":
        newStartDate = startOfYear(new Date());
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
  };

  // Navigate handlers
  const handleSaleReturnPopUp = (t) =>
    navigate(`/SaleReturnDetails/${t.salereturnID}`);
  const handleInvoicePopUp = (t) => navigate(`/SaleDetails/${t.saleID}`);
  const handlePurchasePopUp = (t) =>
    navigate(`/PurchaseDetails/${t.purchaseID}`);
  const handleTransactionDetails = (t) =>
    navigate(`/TransactionDetails/${t._id}`);

  // Filter transactions by search
  const filteredTransactions = transactions.filter((t) => {
    const c = t.contactDetails || {};
    const name = c.name?.toLowerCase() || "";
    const mobile = c.mobile || "";
    const address = c.address?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      address.includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm)
    );
  });

  // Totals
  const totalFilteredCredit = useMemo(
    () => filteredTransactions.reduce((acc, t) => acc + (t.Credit || 0), 0),
    [filteredTransactions]
  );
  const totalFilteredDebit = useMemo(
    () => filteredTransactions.reduce((acc, t) => acc + (t.Debit || 0), 0),
    [filteredTransactions]
  );

  return (
    <div className="global_container">
      {/* Filters */}
      <div className="global_sub_container">
        <h1 className="global_heading">Transactions Report</h1>
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Period Select */}
          <div className="w-full sm:w-[200px]">
            <label className="block text-sm mb-1">Period</label>
            <Select
              value={period}
              onChange={handlePeriodChange}
              options={periodOptions}
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Start Date */}
          <div className="w-full sm:w-[200px]">
            <label className="block text-sm mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="yyyy/MM/dd"
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
          <div className="w-full sm:w-[200px]">
            <label className="block text-sm mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="yyyy/MM/dd"
              className="global_input w-full"
            />
          </div>

          {/* Search */}
          <div className="w-full sm:flex-1">
            <label className="block text-sm mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by Name, Address or Mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="global_input w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container overflow-x-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Date</th>
              <th className="global_th">Contact</th>
              <th className="global_th">Type</th>
              <th className="global_th">Received/Purchase</th>
              <th className="global_th">Payment/Sale</th>
              <th className="global_th">Note</th>
              <th className="global_th">Actions</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {filteredTransactions.length ? (
              filteredTransactions.map((t, i) => (
                <tr key={i} className="text-center">
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">
                    {new Date(t.CreatedDate).toLocaleDateString("en-GB")}{" "}
                    {new Date(t.CreatedDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="global_td">
                    {t.contactDetails
                      ? `${t.contactDetails.name || "N/A"}, ${
                          t.contactDetails.mobile || "N/A"
                        }`
                      : "No Contact"}
                    <br />
                    {t.contactDetails?.address || "N/A"}
                  </td>
                  <td className="global_td">
                    {t.salereturnID
                      ? "Sale Return"
                      : t.saleID
                      ? "Sale"
                      : t.purchaseID
                      ? "Purchase"
                      : "Direct Txn"}
                  </td>
                  <td className="global_td">{t.Debit?.toFixed(2) || "0.00"}</td>
                  <td className="global_td">
                    {t.Credit?.toFixed(2) || "0.00"}
                  </td>
                  <td className="global_td">{t.note || "No Notes"}</td>
                  <td className="global_td flex justify-center gap-1">
                    {t.saleID && (
                      <button
                        onClick={() => handleInvoicePopUp(t)}
                        className="text-blue-600"
                      >
                        <AiOutlineEye /> Sale
                      </button>
                    )}
                    {t.purchaseID && (
                      <button
                        onClick={() => handlePurchasePopUp(t)}
                        className="text-green-600"
                      >
                        <AiOutlineEye /> Purchase
                      </button>
                    )}
                    {t.salereturnID && (
                      <button
                        onClick={() => handleSaleReturnPopUp(t)}
                        className="text-orange-600"
                      >
                        <AiOutlineEye /> Return
                      </button>
                    )}
                    {!t.saleID && !t.purchaseID && !t.salereturnID && (
                      <button
                        onClick={() => handleTransactionDetails(t)}
                        className="text-gray-600"
                      >
                        <AiOutlineEye /> View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="global_td text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
            <tr>
              <td colSpan="3" className="global_td text-right font-semibold">
                Total
              </td>
              <td className="global_td text-center font-semibold">
                {totalFilteredDebit.toFixed(2)}
              </td>
              <td className="global_td text-center font-semibold">
                {totalFilteredCredit.toFixed(2)}
              </td>
              <td colSpan="3" className="global_td"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TransactionReport;
