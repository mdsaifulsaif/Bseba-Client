import { FaWallet } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { Link } from "react-router-dom";

const TransictionList = () => {
  const [TransictionLists, setTransictionLists] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const [total, setTotal] = useState(0);

  const { setGlobalLoader } = loadingStore();

  // Fetch Transactions
  const fetchTransictionLists = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/MyTransactionsList/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );

      if (res.data.status === "Success") {
        setTransictionLists(res.data.data);
        setTotal(res.data.total);
      } else {
        ErrorToast("Failed to fetch transactions");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransictionLists();
  }, [page, limit, search]);

  return (
    <div className="global_container">
      {/* Header */}
      <div className="global_sub_container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Transaction List
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {TransictionLists.length} of {total} transactions
            </p>
          </div>

          {/* Search + Limit */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search by trxID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="global_input"
            />
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="global_dropdown"
            >
              {[20, 50, 100, 500].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl">
          <table className="global_table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="global_tr">
                <th className="global_th">Transaction ID</th>
                <th className="global_th">Bank</th>
                <th className="global_th">Note</th>
                <th className="global_th">Total</th>
                <th className="global_th">Status</th>
                <th className="global_th">Last Updated</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {TransictionLists.length > 0 ? (
                TransictionLists.map((c) => (
                  <tr key={c._id} className="global_tr">
                    <td className="global_td">{c.trxID}</td>
                    <td className="global_td">{c.bankName}</td>
                    <td className="global_td max-w-[150px] truncate">
                      {c.note || "—"}
                    </td>

                    <td
                      className={`global_td ${
                        c.total >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {c.total}
                    </td>

                    <td className="global_td">
                      {c.status === "1" ? (
                        <span className="text-green-600 dark:text-green-400">
                          Approved
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="global_td">
                      <TimeAgo date={c.updatedAt} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No transactions found
                  </td>
                </tr>
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
      </div>
    </div>
  );
};

export default TransictionList;
