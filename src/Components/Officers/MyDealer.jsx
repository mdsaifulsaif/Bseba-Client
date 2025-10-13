import { FaWallet } from "react-icons/fa";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { Link } from "react-router-dom";

const MyDealer = () => {
  const [Mydealers, setMyDealers] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const { setGlobalLoader } = loadingStore();

  useEffect(() => {
    setPage(1); // reset page
    fetchMyDealers();
  }, [search]);

  // Fetch MyDealers
  const fetchMyDealers = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/Dealer/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setMyDealers(res.data.data);
        setTotal(res.data.total);
      } else {
        ErrorToast("Failed to fetch MyDealers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchMyDealers()]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    fetchMyDealers();
  }, [page, limit, search]);

  return (
    <div className="global_container">
      {/* MyDealer List */}
      <div className="global_sub_container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              MyDealer List
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {Mydealers.length} of {total} MyDealers
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search MyDealer..."
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

        <div className="overflow-x-auto rounded-2xl">
          <table className="global_table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="global_tr">
                <th className="global_th">Name</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">Address</th>

                <th className="global_th">Total Balance</th>
                <th className="global_th">Last Updated</th>
                <th className="global_th">Laser</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {Mydealers.length > 0 ? (
                Mydealers.map((c) => (
                  <tr key={c._id} className="global_tr">
                    <td className="global_td">{c.name}</td>
                    <td className="global_td">{c.mobile}</td>
                    <td className="global_td max-w-[150px] truncate">
                      {c.address}
                    </td>

                    <td
                      className={`global_td ${
                        c.totalBalance >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {c.totalBalance}
                    </td>
                    <td className="global_td">
                      {" "}
                      <TimeAgo date={c.updatedAt} />
                    </td>

                    <td className="global_td">
                      <Link
                        to={`/ViewDealerLaser/${c._id}`}
                        // onClick={() => {
                        //   handleEdit(c);
                        // }}
                        className="global_edit"
                      >
                        View Laser
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No MyDealers found
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

export default MyDealer;
