import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";

const SaleReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const printRef = useRef(null);

  const fetchReturns = async (pageNumber = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BaseURL}/SaleReturnList/${pageNumber}/${limit}/0`,
        {
          headers: { token: getToken() },
        }
      );

      if (res.data.status === "Success") {
        let data = res.data.data;

        // Apply search filter locally (by referenceNo or note)
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          data = data.filter(
            (ret) =>
              ret.referenceNo?.toLowerCase().includes(term) ||
              ret.note?.toLowerCase().includes(term)
          );
        }

        setReturns(data);
        setTotal(res.data.total || data.length);
      } else {
        ErrorToast("Failed to fetch sale returns");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching sale returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns(page, search);
  }, [page, search]);

  const handlePrint = () => {
    printElement(printRef, "testing");
  };

  return (
    <div className="global_container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Sale Return List
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {returns.length} of {total} Sales
          </p>
        </div>

        {/* Search */}
        <div className="lg:mb-4 mt-1 lg:mt-6 flex flex-col lg:flex-row gap-3 justify-end">
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
          <input
            type="text"
            placeholder="Search by Reference or Note"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="global_input w-full lg:w-64"
          />
        </div>
      </div>
      {/* Table and pagination under below */}
      {loading ? (
        <div>Loading...</div>
      ) : returns.length === 0 ? (
        <div>No sale returns found</div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            {" "}
            <table className="global_table w-full" ref={printRef}>
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">#</th>
                  <th className="global_th">Reference</th>
                  <th className="global_th">Total</th>
                  <th className="global_th">Profit/Loss</th>
                  <th className="global_th">Note</th>
                  <th className="global_th">Date</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {returns.map((ret, idx) => (
                  <tr className="global_tr" key={ret._id}>
                    <td className="global_td">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="global_td">{ret.referenceNo}</td>
                    <td className="global_td">{ret.total}</td>
                    <td className="global_td">{ret.profitLoss}</td>
                    <td className="global_td">{ret.note || "-"}</td>
                    <td className="global_td min-w-[100px]">
                      {(() => {
                        const d = new Date(ret.CreatedDate);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
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
        className="global_button mt-5 lg:w-fit w-full"
      >
        print
      </button>
    </div>
  );
};

export default SaleReturnList;
