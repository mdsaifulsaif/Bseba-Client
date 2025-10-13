import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { useParams } from "react-router-dom";

const DealerList = () => {
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const { setGlobalLoader } = loadingStore();
  const { id } = useParams();
  // Fetch Dealers
  const fetchDealers = async () => {
    setGlobalLoader(true);
    try {
      const query =
        search.trim() === "" ? "0" : encodeURIComponent(search.trim());
      const res = await axios.get(
        `${BaseURL}/MyDealerList/${id}/${page}/${limit}/${query}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setDealers(res.data.data);
        setTotal(res.data.total);
      } else {
        ErrorToast("Failed to fetch Dealers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, [page, limit, search]);

  return (
    <div className="global_sub_container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Dealer List
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {dealers.length} of {total} Dealers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
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

          <input
            type="text"
            placeholder="Search Dealer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="global_input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <th className="global_th">Name</th>
            <th className="global_th">Mobile</th>
            <th className="global_th">Address</th>
            <th className="global_th">Total Balance</th>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {dealers.length > 0 ? (
              dealers.map((c) => (
                <tr key={c._id} className="global_tr">
                  <td className="global_td">{c.name}</td>
                  <td className="global_td">{c.mobile}</td>
                  <td className="global_td">{c.address}</td>
                  <td
                    className={`global_td text-sm font-medium ${
                      c.totalBalance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {c.totalBalance}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No Dealers found
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
  );
};

export default DealerList;
