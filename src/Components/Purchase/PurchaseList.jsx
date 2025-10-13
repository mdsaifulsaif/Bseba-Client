import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { Link } from "react-router-dom";
import { printElement } from "../../Helper/Printer";

const PurchaseList = () => {
  const { setGlobalLoader } = loadingStore();
  const [purchases, setPurchases] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const printRef = useRef(null);

  const fetchPurchases = async () => {
    setGlobalLoader(true);
    try {
      const keyword = searchKeyword.trim() === "" ? 0 : searchKeyword;
      const res = await axios.get(
        `${BaseURL}/PurchasesList/${page}/${limit}/${keyword}`, // include limit
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setPurchases(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        ErrorToast("Failed to fetch purchases");
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page, limit, searchKeyword]);

  return (
    <div className="global_container">
      {/* Header: Title + Per page + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Purchase List
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {purchases.length} of {total} Purchases
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by Supplier Name or Reference..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(1);
            }}
            className="global_input"
          />
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="global_dropdown"
          >
            {[20, 50, 100, 200].map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container overflow-auto rounded-lg">
        <table className="global_table w-full" ref={printRef}>
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">No</th>
              <th className="global_th">Supplier</th>
              <th className="global_th">Company</th>
              <th className="global_th">Address</th>
              <th className="global_th">Grand Total</th>
              <th className="global_th">Paid</th>
              <th className="global_th">Due</th>
              <th className="global_th">Created By</th>
              <th className="global_th">Date</th>
              <th className="global_th" id="no-print">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {purchases.length === 0 ? (
              <tr className="global_tr">
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No purchases found
                </td>
              </tr>
            ) : (
              purchases.map((p, idx) => (
                <tr className="global_tr" key={p._id}>
                  <td className="global_td">{p.referenceNo}</td>
                  <td className="global_td">
                    {p.Supplier?.[0]?.supplier || ""}
                  </td>
                  <td className="global_td">
                    {p.Supplier?.[0]?.company || ""}
                  </td>
                  <td className="global_td min-w-[150px] max-w-[200px] truncate">
                    {p.Supplier?.[0]?.address || ""}
                  </td>

                  <td className="global_td">{p.grandTotal.toFixed(2)}</td>
                  <td className="global_td">{p.paid.toFixed(2)}</td>
                  <td className="global_td">{p.dueAmount.toFixed(2)}</td>
                  <td className="global_td">{p.Users?.[0]?.name || ""}</td>
                  <td className="global_td min-w-[100px]">
                    {(() => {
                      const d = new Date(p.CreatedDate);
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = d.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </td>
                  <td className="global_td" id="no-print">
                    <Link
                      className="global_button"
                      to={`/PurchaseDetails/${p._id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
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

      <button
        onClick={() => {
          printElement(printRef, "any");
        }}
        className="global_button mt-5"
      >
        Print
      </button>
    </div>
  );
};

export default PurchaseList;
