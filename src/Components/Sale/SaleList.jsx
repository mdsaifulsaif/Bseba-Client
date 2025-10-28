import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";
import { Link } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { MdDeleteOutline } from "react-icons/md";
import { TbTruckReturn } from "react-icons/tb";
import { IoPrintSharp } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Open / Close icons

const SaleList = () => {
  const [sales, setSales] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const { setGlobalLoader } = loadingStore();

  const [isOpen, setIsOpen] = useState(false);

  const printRef = useRef(null);
  const fetchSales = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/SalesList/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        let data = res.data.data;
        console.log(data);
        setSales(data);
        setTotal(res.data.total || data.length);
      } else {
        ErrorToast("Failed to fetch sales");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching sales");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, search, limit]);

  const handlePrint = () => {
    printElement(printRef, "testing");
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Sale List
        </h1>
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="global_dropdown"
            >
              {[10, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {sales.length} of {total} Sales
            </p>
          </div>

          <div className="flex flex-col lg:flex-row my-2 gap-3">
            <input
              type="text"
              placeholder="Search by Reference or Dealer"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="global_input w-full lg:w-64"
            />
          </div>
        </div>

        {sales.length === 0 ? (
          <div>No sales found</div>
        ) : (
          <div>
            <div className=" overflow-auto">
              <table className="global_table w-full" ref={printRef}>
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">No</th>
                    <th className="global_th">Name</th>
                    <th className="global_th">Grand Total</th>
                    <th className="global_th">Paid</th>
                    <th className="global_th">Deu</th>
                    <th className="global_th">Created By</th>
                    <th className="global_th">Date</th>
                    <th className="global_th">Delete</th>
                    <th className="global_th">Return</th>
                    <th className="global_th">Print</th>
                    <th className="global_th">80MM</th>
                    <th className="global_th">Challan</th>
                    <th className="global_th">Profit</th>

                    {/* <th className="global_th" id="no-print">
                    Details
                  </th> */}
                  </tr>
                </thead>

                <tbody className="global_tbody">
                  {sales.map((sale) => (
                    <tr className="global_tr" key={sale._id}>
                      <td className="global_td">{sale.referenceNo}</td>
                      <td className="global_td">
                        {/* {sale.Dealers?.[0]?.name || ""} */}
                        {sale.Customer?.[0]?.name || ""}
                        {console.log(sale)}
                      </td>
                      <td className="global_td">{sale.grandTotal}</td>
                      <td className="global_td">{sale.paid}</td>
                      <td className="global_td">{sale.dueAmount}</td>

                      <td className="global_td min-w-[100px]">
                        {sale.Users?.[0]?.fullName}
                      </td>
                      <td className="global_td ">
                        <span className="mr-2">
                          {(() => {
                            const d = new Date(sale.CreatedDate);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </span>
                        {/* <TimeAgo date={sale.CreatedDate} /> */}
                      </td>
                      <td className="global_td text-center" id="no-print">
                        <div className="flex items-center justify-center">
                          <MdDeleteOutline className="text-red-600 text-xl cursor-pointer transform transition-transform duration-200 hover:scale-110" />
                        </div>
                      </td>

                      {/* <td className="global_td text-center mx-auto" id="no-print">
                      <MdDeleteOutline />
                      <Link
                        to={`/SaleDetails/${sale._id}`}
                        className="global_button"
                      >
                        View
                      </Link>
                    </td> */}
                      <td className="global_td">
                        <div className="flex items-center justify-center">
                          <TbTruckReturn className="text-red-600 text-xl cursor-pointer transform transition-transform duration-200 hover:scale-110" />
                        </div>
                      </td>
                      <td className="global_td">
                        <div className="flex items-center justify-center">
                          <IoPrintSharp className="text-green-600 text-xl cursor-pointer transform transition-transform duration-200 hover:scale-110" />
                        </div>
                      </td>
                      <td className="global_td">
                        <div className="flex items-center justify-center">
                          <IoPrintSharp className="text-green-600 text-xl cursor-pointer transform transition-transform duration-200 hover:scale-110" />
                        </div>
                      </td>
                      <td className="global_td">
                        <div className="flex items-center justify-center">
                          <IoPrintSharp className="text-green-600 text-xl cursor-pointer transform transition-transform duration-200 hover:scale-110" />
                        </div>
                      </td>
                      {/* <td className="global_td"></td> */}
                      <td className="global_td">
                        <div className="flex flex-col items-center justify-center">
                          {/* Toggle Button */}
                          <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 dark:text-white hover:text-green-600 cursor-pointer text-xl transition-colors duration-200 hover:scale-110"
                          >
                            {isOpen ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </button>

                          {/* Profit Content */}
                          {isOpen && (
                            <div className="mt-1 text-sm font-medium text-green-600">
                              100
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-r-md rounded-l-full ${
                    page === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {Math.ceil(total / limit)}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className={`px-4 py-2 rounded-l-md rounded-r-full ${
                    page >= Math.ceil(total / limit)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => {
            handlePrint();
          }}
          className="global_button mt-5"
        >
          print
        </button>
      </div>
    </div>
  );
};

export default SaleList;
