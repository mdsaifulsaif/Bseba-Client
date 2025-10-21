import React, { useEffect, useState, useRef } from "react";
import {
  FaTag,
  FaDollarSign,
  FaCalendarAlt,
  FaStickyNote,
  FaSearchDollar,
} from "react-icons/fa";
import { format } from "date-fns";
import axios from "axios";
import { getToken } from "../../Helper/SessionHelper";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createPortal } from "react-dom";
import { printElement } from "../../Helper/Printer";
import TimeAgo from "../../Helper/UI/TimeAgo";

const Expense = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [createDate, setCreateDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [expenseReport, setExpenseReport] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const { setGlobalLoader } = loadingStore();
  const componentRef = useRef();

  // Fetch Expense Types
  const fetchExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetExpenseTypes`, {
        headers: { token: getToken() },
      });
      setExpenseTypes(res.data.data || []);
    } catch {
      ErrorToast("Failed to load Expenses");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Expense Report
  const fetchExpenseReport = async (start, end) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/GetExpenseByDate/${start.toISOString()}/${end.toISOString()}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") setExpenseReport(res.data.data);
      console.log(res.data.totalAmount);
    } catch {
      ErrorToast("Failed to load expense report");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
    fetchExpenseReport(startDate, endDate);
  }, []);

  useEffect(() => {
    const total = expenseReport.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    setTotalAmount(total);
  }, [expenseReport]);

  useEffect(() => {
    if (startDate && endDate) fetchExpenseReport(startDate, endDate);
  }, [startDate, endDate]);

  const formatDisplayDate = (date) => {
    try {
      return format(new Date(date), "dd-MM-yyyy hh:mm a");
    } catch {
      return date;
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `rgba(0,0,0,0.4) url("/images/nyan-cat.gif") left top no-repeat`,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const res = await axios.get(`${BaseURL}/DeleteExpense/${id}`, {
            headers: { token: getToken() },
          });
          if (res.data.status === "Success") {
            SuccessToast(res.data.message);
            fetchExpenseReport(startDate, endDate);
          } else {
            ErrorToast(res.data.message);
          }
        } catch {
          ErrorToast("Failed to delete expense");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedExpense || !amount) {
      ErrorToast("Please select expense type and enter amount");
      return;
    }

    const payload = {
      TypeID: selectedExpense,
      amount: parseFloat(amount),
      note,
      CreatedDate: createDate,
    };

    setGlobalLoader(true);
    try {
      const res = await axios.post(`${BaseURL}/CreateExpense`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast("Expense created successfully");
        fetchExpenseReport(startDate, endDate);
        setSelectedExpense("");
        setAmount("");
        setNote("");
        setCreateDate(new Date());
      } else {
        ErrorToast(res.data.message || "Failed to create expense");
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handlePrint = () => printElement(componentRef, "Expense Report");

  return (
    <div className="global_container">
      {/* Create Expense Section */}
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">Add Expense</h1>
        <div className="grid grid-cols-4 gap-5">
          {/* Expense Type */}
          <div className="mb-4 col-span-4 lg:col-span-1">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaTag className="mr-2 text-green-600" /> Expense Type
            </label>
            <select
              value={selectedExpense}
              onChange={(e) => setSelectedExpense(e.target.value)}
              className="global_dropdown"
            >
              <option value="">Choose Expense Type</option>
              {expenseTypes.map((exp) => (
                <option key={exp._id} value={exp._id}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="col-span-4 lg:col-span-1">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-600" /> Select Date
            </label>
            <DatePicker
              selected={createDate}
              onChange={(date) => setCreateDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          {/* Amount */}
          <div className="mb-4 col-span-4 lg:col-span-1">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaDollarSign className="mr-2 text-green-600" /> Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="global_input"
              placeholder="Enter amount"
            />
          </div>

          {/* Note */}
          <div className="mb-4 col-span-4 lg:col-span-3">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaStickyNote className="mr-2 text-green-600" /> Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="global_input"
              placeholder="Write a note (optional)"
            />
          </div>

          {/* Create Button */}
          <div className="lg:mt-6 col-span-4 lg:col-span-1 flex justify-center lg:justify-start">
            <button
              onClick={handleSubmit}
              className="global_button w-full lg:w-fit"
            >
              Create Expense
            </button>
          </div>
        </div>
      </div>

      {/* Expense Report Section */}
      <div className="global_sub_container">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold mb-3">Expense Report</h1>
          <span className="font-medium">Total: {totalAmount.toFixed(2)}</span>
        </div>

        {/* Date Filter */}
        <div className="lg:p-4 rounded-2xl shadow-md mb-1 flex gap-4">
          <div>
            <label className="block text-sm">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>
          <div>
            <label className="block text-sm">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" ref={componentRef}>
          {expenseReport.length > 0 ? (
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">Type</th>
                  <th className="global_th">Amount</th>
                  <th className="global_th">Note</th>
                  <th className="global_th">Date</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {expenseReport.map((item, i) => (
                  <tr key={i} className="global_tr">
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{item.typeName}</td>
                    <td className="global_td text-red-600 font-semibold">
                      {parseFloat(item.amount).toFixed(2)}
                    </td>
                    <td className="global_td truncate max-w-[150px]">
                      {item.note || "-"}
                    </td>
                    <td className="global_td">
                      {formatDisplayDate(item.CreatedDate)}{" "}
                      <TimeAgo date={item.CreatedDate} />
                    </td>
                    <td className="global_td">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="global_button_red"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <FaSearchDollar className="mx-auto text-4xl mb-3" />
              <p className="text-gray-500">No expenses found.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <button
            className="global_button w-full lg:w-fit"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default Expense;
