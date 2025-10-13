import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";
import { Link } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";

const SaleList = () => {
  const [sales, setSales] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const { setGlobalLoader } = loadingStore();

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
      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Sale List
          </h1>
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
        </div>
      </div>

      {sales.length === 0 ? (
        <div>No sales found</div>
      ) : (
        <div>
          <div className=" overflow-auto">
            <table className="global_table w-full" ref={printRef}>
              <thead className="global_thead">
                <th className="global_th">No</th>
                <th className="global_th">Dealer</th>
                <th className="global_th">User</th>
                <th className="global_th">Total</th>
                <th className="global_th">Discount</th>
                <th className="global_th">Grand Total</th>
                <th className="global_th">Date</th>
                <th className="global_th" id="no-print">
                  Details
                </th>
              </thead>
              <tbody className="global_tbody">
                {sales.map((sale) => (
                  <tr className="global_tr" key={sale._id}>
                    <td className="global_td">{sale.referenceNo}</td>
                    <td className="global_td">
                      {sale.Dealers?.[0]?.name || ""}
                    </td>
                    <td className="global_td">{sale.Users?.[0]?.name || ""}</td>
                    <td className="global_td">{sale.total}</td>
                    <td className="global_td">{sale.discount}</td>
                    <td className="global_td">{sale.grandTotal}</td>

                    <td className="global_td min-w-[100px]">
                      <span className="mr-2">
                        {" "}
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
                      <TimeAgo date={sale.CreatedDate} />
                    </td>
                    <td className="global_td" id="no-print">
                      <Link
                        to={`/SaleDetails/${sale._id}`}
                        className="global_button"
                      >
                        view
                      </Link>
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
  );
};

export default SaleList;
