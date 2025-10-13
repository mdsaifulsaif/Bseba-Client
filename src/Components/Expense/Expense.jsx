import React, { useEffect, useState, useRef } from "react";
import {
  FaWallet,
  FaTag,
  FaDollarSign,
  FaCalendarAlt,
  FaStickyNote,
  FaSearchDollar,
  FaAngleDown,
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
  const [RSM, setRSM] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedRSM, setSelectedRSM] = useState("");
  const [selectedExpense, setSelectedExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date());
  const [viewNote, setViewNote] = useState(null);
  const today = new Date();
  const [createDate, setCreateDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [expenseReport, setExpenseReport] = useState([]);

  const [totalAmount, setTotalAmount] = useState(0);
  const componentRef = useRef();
  const formRef = useRef();
  const { setGlobalLoader } = loadingStore();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchRSM(),
          fetchExpenseTypes(),
          fetchExpenseReport(startDate, endDate),
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const total = expenseReport.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    setTotalAmount(total);
  }, [expenseReport]);

  // Fetch RSM
  const fetchRSM = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/getRSM`, {
        headers: { token: getToken() },
      });
      const data = res.data.data || [];
      setRSM(data);

      const mainRSM = data.find((r) => r.main === 1);
      if (mainRSM) {
        setSelectedRSM(mainRSM._id);
      }
    } catch (error) {
      ErrorToast("Failed to load RSM");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch expense types
  const fetchExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetExpenseTypes`, {
        headers: { token: getToken() },
      });
      setExpenseTypes(res.data.data || []);
    } catch (error) {
      // ErrorToast("Failed to load Expenses");
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchExpenseReport = async (start, end) => {
    setGlobalLoader(true);
    try {
      const formattedStart = start.toISOString();
      const formattedEnd = end.toISOString();

      const res = await axios.get(
        `${BaseURL}/GetExpenseByDate/${formattedStart}/${formattedEnd}`,
        { headers: { token: getToken() } }
      );

      if (res.data.status === "Success") {
        setExpenseReport(res.data.data);
      } else {
        null;
      }
    } catch (error) {
      console.error(error);
      // ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchExpenseReport(startDate, endDate);
    }
  }, [startDate, endDate]);

  const formatDisplayDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd-MM-yyyy hh:mm a");
    } catch (error) {
      return dateString;
    }
  };

  const handlePrint = () => {
    printElement(componentRef, "Expense Report");
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title:
        '<span class="text-gray-900 dark:text-white">Are you sure to Delete the Expense?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      customClass: {
        popup:
          "rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-2xl font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-2xl font-medium transition-colors ml-2 backdrop-blur-sm",
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
          const response = await axios.delete(
            `${BaseURL}/DeleteExpense/${id}`,
            {
              headers: { token: getToken() },
            }
          );
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchExpenseReport(startDate, endDate);
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(
            error.response?.data?.message || "Failed to delete expense"
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  const handleSubmitWithoutRSM = async () => {
    if (!selectedExpense || !amount) {
      ErrorToast("Please select expense type and enter amount");
      return;
    }

    const payload = {
      TypeID: selectedExpense,
      RSMID: selectedRSM || null,
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
        setSelectedExpense("");
        fetchExpenseReport(startDate, endDate);
        setAmount("");
        setNote("");
        setCreatedDate(new Date());
        const mainRSM = RSM.find((r) => r.main === 1);
        if (mainRSM) setSelectedRSM(mainRSM._id);
      } else {
        ErrorToast(res.data.message || "Failed to create expense");
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRSM && selectedExpense && amount) {
      // Show confirmation when RSM is not selected
      Swal.fire({
        title:
          '<span class="text-gray-900 dark:text-white">Create Expense without RSM?</span>',
        html: '<p class="text-gray-600 dark:text-gray-300">Do you want to create this expense without selecting an RSM?</p>',
        icon: "question",
        showCancelButton: true,
        background: "rgba(255, 255, 255, 0.2)",
        backdrop: `
          rgba(0,0,0,0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `,
        customClass: {
          popup:
            "rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
          confirmButton:
            "px-4 py-2 bg-green-600/90 hover:bg-green-700/90 text-white rounded-2xl font-medium transition-colors backdrop-blur-sm ml-3",
          cancelButton:
            "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-2xl font-medium transition-colors ml-2 backdrop-blur-sm",
          title: "text-lg font-semibold",
          htmlContainer: "mt-2",
        },
        buttonsStyling: false,
        confirmButtonText: "Yes, create it!",
        cancelButtonText: "No, cancel",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          handleSubmitWithoutRSM();
        }
      });
    } else {
      // Normal submission with all required fields
      if (!selectedExpense || !amount) {
        ErrorToast("Please select expense type and enter amount");
        return;
      }

      const payload = {
        TypeID: selectedExpense,
        RSMID: selectedRSM,
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
          setSelectedExpense("");
          fetchExpenseReport(startDate, endDate);
          setAmount("");
          setNote("");
          setCreatedDate(new Date());
          const mainRSM = RSM.find((r) => r.main === 1);
          if (mainRSM) setSelectedRSM(mainRSM._id);
        } else {
          ErrorToast(res.data.message || "Failed to create expense");
        }
      } catch (error) {
        ErrorToast(error.message);
      } finally {
        setGlobalLoader(false);
      }
    }
  };

  return (
    <div ref={formRef} className="global_container">
      {/* create expense */}
      <div className="global_sub_container ">
        {/* RSM Dropdown */}
        <div className="gap-5 grid grid-cols-4">
          <div className="mb-4 col-span-4 lg:col-span-1">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaWallet className="mr-2 text-green-600" /> Select RSM
            </label>

            <select
              value={selectedRSM}
              onChange={(e) => setSelectedRSM(e.target.value)}
              className="global_dropdown"
            >
              <option value="">Choose RSM (Optional)</option>
              {RSM.map((rsm) => (
                <option key={rsm._id} value={rsm._id}>
                  {rsm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Type Dropdown */}
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
          <div className="flex-1 col-span-4 lg:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Select Date
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={createDate}
                onChange={(date) => setCreateDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4 col-span-4 lg:col-span-1">
            <label className=" text-sm font-medium mb-1 flex items-center">
              <FaDollarSign className="mr-2 text-green-600" /> Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                setAmount(value === "" ? "" : Number(value));
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-1 focus:ring-2 focus:ring-green-500"
              placeholder="Enter amount"
            />
          </div>
          {/* Note Input */}
          <div className="mb-4 col-span-4 lg:col-span-3">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaStickyNote className="mr-2 text-green-600" /> Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-green-500"
              placeholder="Write a note (optional)"
            />
          </div>
          {/* create button */}
          <div className="lg:mt-6 col-span-4 lg:col-span-1 flex justify-center lg:justify-start">
            {" "}
            <button
              onClick={handleSubmit}
              className="global_button text-nowrap h-fit  w-full lg:w-fit "
            >
              Create Expense
            </button>
          </div>
        </div>
      </div>

      <div className="global_sub_container">
        {/* Top Title like Expense Report and total right */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold ">Expense Report</h1>
          <div className="flex items-center">
            <span className="font-medium">Total: {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="lg:p-4 rounded-2xl shadow-md mb-1">
          <div className="flex flex-row gap-4 items-center">
            <div>
              <label className="block text-sm">Start Date</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt />
                </div>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input pl-10 w-full"
                  popperPlacement="bottom-start"
                  popperClassName="z-[9999]"
                  calendarClassName="react-datepicker-custom"
                  popperContainer={(props) =>
                    createPortal(<div {...props} />, document.body)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm">End Date</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt />
                </div>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input pl-10 w-full"
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
        </div>
        {/* table */}
        <div className="rounded-2xl shadow-md overflow-hidden">
          {expenseReport.length > 0 ? (
            <div className="overflow-x-auto" ref={componentRef}>
              <table className="global-table">
                <thead className="global_thead">
                  <th className="global_th">Type</th>
                  <th className="global_th">RSM</th>
                  <th className="global_th">Amount</th>
                  <th className="global_th">User</th>
                  <th className="global_th">Note</th>
                  <th className="global_th">Date</th>
                </thead>
                <tbody className="global_tbody">
                  {expenseReport.map((item, idx) => (
                    <tr key={idx} className="global_tr">
                      <td className="global_td ">{item.typeName}</td>
                      <td className="global_td ">{item.RSMName || ""}</td>
                      <td className="global_td text-red-600 font-semibold">
                        {parseFloat(item.amount).toFixed(2)}
                      </td>
                      <td className="global_td ">{item.userName}</td>
                      {/* Note functionality */}
                      <td className="global_td max-w-[150px] truncate">
                        {item.note}
                      </td>
                      <td className="global_td min-w-[100px]">
                        {formatDisplayDate(item.CreatedDate)}{" "}
                        <TimeAgo date={item.CreatedDate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  <tr className="global_tr">
                    <td className="global_td font-bold">Total</td>
                    <td className="global_td"></td>
                    <td className="global_td font-bold text-red-700">
                      {totalAmount.toFixed(2)}
                    </td>
                    <td className="global_td"></td>
                    <td className="global_td"></td>
                    <td className="global_td"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaSearchDollar className="mx-auto text-4xl mb-3" />
              <p className="text-gray-500">
                No expenses found for this date range.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-5 no-print w-full lg:w-fit">
          <button className="global_button w-full" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default Expense;
