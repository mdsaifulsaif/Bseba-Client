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

  // Fetch expense types
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

  // Fetch expense report
  const fetchExpenseReport = async (start, end) => {
    setGlobalLoader(true);
    try {
      const formattedStart = start.toISOString();
      const formattedEnd = end.toISOString();
      const res = await axios.get(
        `${BaseURL}/GetExpenseByDate/${formattedStart}/${formattedEnd}`,
        { headers: { token: getToken() } }
      );

      if (res.data.status === "Success") setExpenseReport(res.data.data);
    } catch (error) {
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      customClass: {
        popup: "rounded-xl shadow-lg",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const res = await axios.delete(`${BaseURL}/DeleteExpense/${id}`, {
            headers: { token: getToken() },
          });
          if (res.data.status === "Success") {
            SuccessToast("Expense deleted");
            fetchExpenseReport(startDate, endDate);
          } else {
            ErrorToast("Failed to delete expense");
          }
        } catch {
          ErrorToast("Error deleting expense");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  const handlePrint = () => printElement(componentRef, "Expense Report");

  return (
    <div className="global_container">
      {/* Create Expense */}
      <div className="global_sub_container">
        <div className="grid grid-cols-4 gap-5">
          {/* Expense Type */}
          <div className="col-span-4 lg:col-span-1">
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
              <FaCalendarAlt className="mr-2 text-green-600" /> Date
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
          <div className="col-span-4 lg:col-span-1">
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
          <div className="col-span-4 lg:col-span-1">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaStickyNote className="mr-2 text-green-600" /> Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input"
              placeholder="Optional note"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleSubmit} className="global_button">
            Create Expense
          </button>
        </div>
      </div>

      {/* Report */}
      <div className="global_sub_container">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Expense Report</h1>
          <p className="font-semibold text-red-600">
            Total: {totalAmount.toFixed(2)}
          </p>
        </div>

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
