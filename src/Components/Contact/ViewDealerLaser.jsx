import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { FaCalendarAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { printElement } from "../../Helper/Printer";
import TimeAgo from "../../Helper/UI/TimeAgo";

const ViewDealerLaser = () => {
  const { id } = useParams();
  const [laser, setLaser] = useState(null);
  const { setGlobalLoader } = loadingStore();

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  ); // last 30 days default
  const [endDate, setEndDate] = useState(new Date());
  const printRef = useRef(null);

 const formatDate = (date, endOfDay = false) => {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  const bdOffset = 6 * 60; // minutes
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const bdTime = new Date(utc + bdOffset * 60000);

  return bdTime.toISOString();
};

  const fetchDealerLaser = async () => {
    const start = formatDate(startDate, false); // 00:00:00
    const end = formatDate(endDate, true); // 23:59:59

    try {
      setGlobalLoader(true);
      const res = await axios.get(
        `${BaseURL}/DealerLaser/${id}/${start}/${end}`,
        { headers: { token: getToken() } }
      );
      if (res?.data) {
        setLaser(res.data);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id && startDate && endDate) {
      fetchDealerLaser();
    }
  }, [id, startDate, endDate]);

  // totals
  const totalInvoice =
    laser?.data?.reduce((sum, t) => sum + (t.Credit || 0), 0) || 0;
  const totalReceived =
    laser?.data?.reduce((sum, t) => sum + (t.Debit || 0), 0) || 0;
  const closingBalance = laser?.contactDetails?.ClosingBalance || 0;
  const totalDiscount =
    laser?.data?.reduce((sum, t) => sum + (parseInt(t.discount) || 0), 0) || 0;
  function getDateRange(option) {
    const now = new Date();
    let start, end;

    const startOfDay = (d) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const endOfDay = (d) => {
      d.setHours(23, 59, 59, 999);
      return d;
    };

    // helper: Saturday = 6
    const getDiffFromSaturday = (day) => {
      // JS: Sunday = 0 ... Saturday = 6
      return (day + 1) % 7; // so that Saturday → 0, Sunday → 1, Monday → 2 ... Friday → 6
    };

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
        end.setDate(now.getDate() - diff2 - 1); // গত সপ্তাহের শুক্রবার
        start = startOfDay(new Date(end));
        start.setDate(end.getDate() - 6); // শনিবার থেকে শুরু
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
  }

  return (
    <div className="p-2" ref={printRef}>
      <h1 className="text-xl font-semibold mb-2">Dealer Transactions Report</h1>

      {/* Dealer Info */}
      {laser?.contactDetails && (
        <div className="mb-2 space-y-1 global_sub_container">
          <h2 className="text-lg font-bold">{laser.contactDetails.name}</h2>
          <p>{laser.contactDetails.mobile}</p>
          <p>{laser.contactDetails.address}</p>
          <p
            className={`font-medium ${ laser?.contactDetails?.ClosingBalance < 0 ? "text-red-600" : "text-green-400"
              } `}
          >
            {laser?.contactDetails?.ClosingBalance < 0
              ? `Receivable Closing Balance: ${Math.abs(
                laser?.contactDetails?.ClosingBalance
              ).toLocaleString()}`
              : `Payable Closing Balance: ${laser?.contactDetails?.ClosingBalance.toLocaleString()}`}
          </p>
        </div>
      )}

      {/* Date Filter */}
      <div id="no-print" className="flex flex-col lg:flex-row justify-between">
        {" "}
        <div className="flex items-end mb-4">
          <select
            onChange={(e) => {
              const { start, end } = getDateRange(e.target.value);
              setStartDate(start);
              setEndDate(end);
            }}
            className="global_dropdown"
          >
            {[
              "Last 30 Days",
              "This Year",
              "This Month",
              "This Week",
              "Last Week",
              "Last Month",
              "Last Year",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 mb-4 items-end">
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="global_table">
          <thead className="global_thead">
            <th className="global_th">#</th>
            <th className="global_th">Date</th>
            <th className="global_th">Type</th>
            <th className="global_th text-right">Invoice</th>
            <th className="global_th">Discount</th>
            <th className="global_th text-right">Net Amount</th>
            <th className="global_th text-right">Received</th>
            <th className="global_th text-right">Closing Balance</th>
            {/* <th className="global_th">Note</th> */}
            <th id="no-print" className="global_th">
              Details
            </th>
          </thead>
          <tbody className="global_tbody">
            {laser?.data?.length > 0 ? (
              laser.data.map((t, i) => (
                <tr key={t._id} className="global_tr">
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">
                    <span className="mr-1">
                      {new Date(t.CreatedDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <TimeAgo date={t.CreatedDate} />
                  </td>
                  <td className="global_td">
                    {"saleID" in (t || {}) && t?.saleID != null
                      ? "Sale"
                      : "Payment"}
                  </td>{" "}
                  <td className="global_td">{(Number(t?.Credit) || 0) + (Number(t?.discount) || 0)}</td>
                  <td className="global_td">{t.discount}</td>
                  <td className="global_td">{t.Credit.toFixed(2)}</td>

                  <td className="global_td">{t.Debit.toFixed(2)}</td>
                  <td
                    className={
                      "global_td " +
                      (t.TotalDebit - t.TotalCredit > 0
                        ? "text-red-400"
                        : t.TotalDebit - t.TotalCredit < 0
                          ? "text-green-500"
                          : "")
                    }
                  >
                    {t.TotalDebit - t.TotalCredit > 0
                      ? `Payable: ${(t.TotalDebit - t.TotalCredit).toFixed(2)}`
                      : t.TotalDebit - t.TotalCredit < 0
                        ? `Receivable: ${Math.abs(t.TotalDebit - t.TotalCredit).toFixed(2)}`
                        : "0.00"}
                  </td>
                  <td id="no-print" className="global_td">
                    {t.saleID && (
                      <Link
                        to={`/SaleDetails/${t.saleID}`}
                        className="global_button"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals */}
          {laser?.data?.length > 0 && (
            <tfoot>
              <tr className="global_tr">
                <td className="global_td" colSpan="3">
                  Total Amount:
                </td>{" "}
                <td className="global_td">{totalInvoice.toFixed(2)}</td>
                <td className="global_td">{totalDiscount}</td>
                <td className="global_td ">{(Number(totalInvoice) || 0) - (Number(totalDiscount) || 0)}</td>
                <td className="global_td ">{totalReceived.toFixed(2)}</td>
                <td className="global_td">
                  {closingBalance < 0 ? (
                    <span className="text-green-500">Ending Receivable</span>
                  ) : (
                    <span>Payable</span>
                  )}{" "}
                  : {Math.abs(closingBalance).toLocaleString()}
                </td>
                <td id="no-print" className="global_td"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => printElement(printRef, "Dealer Laser")}
          className="global_button mt-5"
          id="no-print"
        >
          Print
        </button>
      </div>

    </div>
  );
};

export default ViewDealerLaser;
