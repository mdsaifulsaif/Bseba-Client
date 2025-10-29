// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { BaseURL } from "../../Helper/Config";
// import { getToken } from "../../Helper/SessionHelper";
// import { ErrorToast } from "../../Helper/FormHelper";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Select from "react-select";
// import {
//   format,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   startOfYear,
//   endOfYear,
//   subMonths,
//   subWeeks,
//   subYears,
// } from "date-fns";

// const ExpenseReport = () => {
//   const [expenses, setExpenses] = useState([]);
//   const [expenseTypeData, setExpenseTypeData] = useState([]);
//   const [selectedPeriod, setSelectedPeriod] = useState("");
//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());

//   // Fetch Expense Types
//   const fetchExpenseTypes = async () => {
//     try {
//       const res = await axios.get(`${BaseURL}/GetExpenseTypes`, {
//         headers: { token: getToken() },
//       });
//       if (res.data?.data) setExpenseTypeData(res.data.data);
//     } catch (err) {
//       console.error("Failed to fetch expense types:", err);
//       ErrorToast("Failed to fetch expense types");
//     }
//   };

//   // Fetch Expenses by Date Range
//   const fetchExpenses = async (start, end) => {
//     try {
//       const res = await axios.get(
//         `${BaseURL}/GetExpenseByDate/${format(
//           start,
//           "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
//         )}/${format(end, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}`,
//         { headers: { token: getToken() } }
//       );
//       if (res.data?.data) setExpenses(res.data.data);
//       else setExpenses([]);
//     } catch (err) {
//       console.error("Failed to fetch expenses:", err);
//       ErrorToast("Failed to fetch expenses");
//     }
//   };

//   useEffect(() => {
//     // Determine date range based on selected period
//     switch (selectedPeriod) {
//       case "thisWeek":
//         fetchExpenses(
//           startOfWeek(new Date(), { weekStartsOn: 1 }),
//           endOfWeek(new Date(), { weekStartsOn: 1 })
//         );
//         break;
//       case "thisMonth":
//         fetchExpenses(startOfMonth(new Date()), endOfMonth(new Date()));
//         break;
//       case "thisYear":
//         fetchExpenses(startOfYear(new Date()), endOfYear(new Date()));
//         break;
//       case "lastMonth":
//         fetchExpenses(
//           startOfMonth(subMonths(new Date(), 1)),
//           endOfMonth(subMonths(new Date(), 1))
//         );
//         break;
//       case "lastWeek":
//         fetchExpenses(
//           startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
//           endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
//         );
//         break;
//       case "lastYear":
//         fetchExpenses(
//           startOfYear(subYears(new Date(), 1)),
//           endOfYear(subYears(new Date(), 1))
//         );
//         break;
//       default:
//         fetchExpenses(startDate, endDate);
//     }
//     fetchExpenseTypes();
//   }, [startDate, endDate, selectedPeriod]);

//   // Calculate Totals
//   const totalAmount = expenses.reduce(
//     (sum, item) => sum + parseFloat(item.amount),
//     0
//   );
//   const totalAmountByType = expenses.reduce((acc, item) => {
//     if (!acc[item.typeName]) acc[item.typeName] = 0;
//     acc[item.typeName] += parseFloat(item.amount);
//     return acc;
//   }, {});

//   const customStyles = {
//     control: (base) => ({
//       ...base,
//       fontSize: "14px",
//       height: "31px",
//       minHeight: "31px",
//       borderRadius: 0,
//       border: "1px solid rgb(222, 226, 230)",
//       boxShadow: "none",
//     }),
//     option: (base, state) => ({
//       ...base,
//       backgroundColor: state.isSelected
//         ? "#0d6efd"
//         : state.isFocused
//         ? "#e9ecef"
//         : "white",
//       color: state.isSelected ? "white" : "black",
//     }),
//     menu: (base) => ({ ...base, zIndex: 1050, borderRadius: 0 }),
//   };

//   return (
//     <div className="global-margin-main-content">
//       <div className="global-bg-glass form-wrapper global-content-gap-top">
//         <div className="row mb-4">
//           {/* Start Date */}
//           <div className="col-12 col-sm-6 mt-3">
//             <label className="form-label form-custom-label">Start Date</label>
//             <DatePicker
//               selected={startDate}
//               onChange={(date) => setStartDate(date)}
//               dateFormat="dd-MM-yyyy"
//               className="form-control form-control-sm form-custom-focus-border"
//             />
//           </div>

//           {/* End Date */}
//           <div className="col-12 col-sm-6 mt-3">
//             <label className="form-label form-custom-label">End Date</label>
//             <DatePicker
//               selected={endDate}
//               onChange={(date) => setEndDate(date)}
//               dateFormat="dd-MM-yyyy"
//               className="form-control form-control-sm form-custom-focus-border"
//             />
//           </div>

//           {/* Period Select */}
//           <div className="col-12 col-sm-6 mt-3">
//             <label className="form-label form-custom-label">Period</label>
//             <Select
//               styles={customStyles}
//               options={[
//                 { value: "", label: "Custom" },
//                 { value: "thisWeek", label: "This Week" },
//                 { value: "thisMonth", label: "This Month" },
//                 { value: "thisYear", label: "This Year" },
//                 { value: "lastMonth", label: "Last Month" },
//                 { value: "lastYear", label: "Last Year" },
//               ]}
//               onChange={(opt) => setSelectedPeriod(opt?.value || "")}
//               isClearable
//               placeholder="Select Period"
//             />
//           </div>
//         </div>

//         {/* Expenses Table */}
//         <div className="mt-4 global-font-size-14px">
//           <table className="table table-sm table-bordered">
//             <thead className="table-success">
//               <tr>
//                 <th>Expense Type</th>
//                 <th>Amount</th>
//                 <th>Note</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {expenses.length ? (
//                 expenses.map((item, i) => (
//                   <tr key={i}>
//                     <td>{item.typeName}</td>
//                     <td>
//                       {new Intl.NumberFormat("en-IN").format(item.amount)}
//                     </td>
//                     <td>{item.note}</td>
//                     <td>{format(new Date(item.CreatedDate), "dd-MM-yyyy")}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4">No expenses available</td>
//                 </tr>
//               )}
//             </tbody>
//             <tfoot>
//               <tr className="table-info">
//                 <th>Total Amount:</th>
//                 <th>
//                   {new Intl.NumberFormat("en-IN").format(
//                     totalAmount.toFixed(2)
//                   )}
//                 </th>
//                 <th colSpan="2"></th>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         {/* Total by Type */}
//         <div className="mt-4">
//           <h6>Total Amount by Expense Type</h6>
//           <table className="table table-sm table-bordered">
//             <thead className="table-success">
//               <tr>
//                 <th>Expense Type</th>
//                 <th>Total Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(totalAmountByType).map(([type, amount]) => (
//                 <tr key={type}>
//                   <td>{type}</td>
//                   <td>
//                     {new Intl.NumberFormat("en-IN").format(amount.toFixed(2))}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExpenseReport;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { createPortal } from "react-dom";

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypeData, setExpenseTypeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Fetch Expense Types
  const fetchExpenseTypes = async () => {
    try {
      const res = await axios.get(`${BaseURL}/GetExpenseTypes`, {
        headers: { token: getToken() },
      });
      if (res.data?.data) setExpenseTypeData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch expense types:", err);
      ErrorToast("Failed to fetch expense types");
    }
  };

  // Fetch Expenses by Date Range
  const fetchExpenses = async (start, end) => {
    if (!start || !end) return;
    try {
      // Format as YYYY-MM-DD
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      const res = await axios.get(
        `${BaseURL}/GetExpenseByDate/${startStr}/${endStr}`,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data?.data) setExpenses(res.data.data);
      else setExpenses([]);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      ErrorToast("Failed to fetch expenses");
    }
  };

  useEffect(() => {
    let start, end;

    switch (selectedPeriod) {
      case "thisWeek":
        start = startOfWeek(new Date(), { weekStartsOn: 1 });
        end = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "thisMonth":
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case "thisYear":
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(new Date(), 1));
        end = endOfMonth(subMonths(new Date(), 1));
        break;
      case "lastWeek":
        start = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        end = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        break;
      case "lastYear":
        start = startOfYear(subYears(new Date(), 1));
        end = endOfYear(subYears(new Date(), 1));
        break;
      default:
        start = startDate;
        end = endDate;
    }

    fetchExpenses(start, end);
    fetchExpenseTypes();
  }, [startDate, endDate, selectedPeriod]);

  // Totals
  const totalAmount = expenses.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  const totalAmountByType = expenses.reduce((acc, item) => {
    if (!acc[item.typeName]) acc[item.typeName] = 0;
    acc[item.typeName] += parseFloat(item.amount);
    return acc;
  }, {});

  //   const customStyles = {
  //     control: (base) => ({
  //       ...base,
  //       fontSize: "14px",
  //       height: "31px",
  //       minHeight: "31px",
  //       borderRadius: 0,
  //       border: "1px solid rgb(222, 226, 230)",
  //       boxShadow: "none",
  //     }),
  //     option: (base, state) => ({
  //       ...base,
  //       backgroundColor: state.isSelected
  //         ? "#0d6efd"
  //         : state.isFocused
  //         ? "#e9ecef"
  //         : "white",
  //       color: state.isSelected ? "white" : "black",
  //     }),
  //     menu: (base) => ({ ...base, zIndex: 1050, borderRadius: 0 }),
  //   };

  return (
    <div className="global_container">
      <div className="global_sub_container flex flex-col gap-3 justify-between md:flex-row-reverse">
        {/* Start Date */}
        <div className="">
          <label className="form-label form-custom-label">Start Date</label>
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

        {/* End Date */}
        <div className="">
          <label className="form-label form-custom-label">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd-MM-yyyy"
            // className="global_input"
            className="global_input pl-10 w-full"
            popperPlacement="bottom-start"
            popperClassName="z-[9999]"
            calendarClassName="react-datepicker-custom"
            popperContainer={(props) =>
              createPortal(<div {...props} />, document.body)
            }
          />
        </div>

        {/* Period Select */}
        <div>
          <label className="block text-sm font-medium mb-1">Period</label>

          <Select
            classNamePrefix="react-select"
            options={[
              { value: "", label: "Custom" },
              { value: "thisWeek", label: "This Week" },
              { value: "thisMonth", label: "This Month" },
              { value: "thisYear", label: "This Year" },
              { value: "lastMonth", label: "Last Month" },
              { value: "lastYear", label: "Last Year" },
            ]}
            onChange={(opt) => setSelectedPeriod(opt?.value || "")}
            isClearable
            placeholder="Select Period"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>
      </div>
      <div className="global_sub_container">
        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">Expense Type</th>
                <th className="global_th">Amount</th>
                <th className="global_th">Note</th>
                <th className="global_th">Date</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {expenses.length ? (
                expenses.map((item, i) => (
                  <tr key={i}>
                    <td className="global_td">{item.typeName}</td>
                    <td className="global_td">
                      {new Intl.NumberFormat("en-IN").format(item.amount)}
                    </td>
                    <td className="global_td">{item.note}</td>
                    <td className="global_td">
                      {format(new Date(item.CreatedDate), "dd-MM-yyyy")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="global_td">No expenses available</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th className="global_th">Total Amount:</th>
                <th className="global_th">
                  {new Intl.NumberFormat("en-IN").format(
                    totalAmount.toFixed(2)
                  )}
                </th>
                <th className="global_th"></th>
                <th className="global_th"></th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Total by Type */}
        <div className="mt-4 overflow-x-auto">
          <h1 className="global_heading">Total Amount by Expense Type</h1>
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">Expense Type</th>
                <th className="global_th">Total Amount</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {Object.entries(totalAmountByType).map(([type, amount]) => (
                <tr key={type}>
                  <td className="global_td">{type}</td>
                  <td className="global_td">
                    {new Intl.NumberFormat("en-IN").format(amount.toFixed(2))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
