import { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PurchaseReturnList = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { setGlobalLoader } = loadingStore();

  // Fetch purchase return list
  const fetchPurchaseReturns = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/PurchaseReturnList/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        const reversedData = (res.data.data || []).slice().reverse();
        console.log(reversedData);
        setReturns(reversedData);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      ErrorToast("Failed to load purchase return list");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchPurchaseReturns();
  }, [page, limit, search]);

  // Delete Handle (if needed)
  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
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
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
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
          const response = await axios.get(
            `${BaseURL}/DeletePurchaseReturn/${id}`,
            {
              headers: { token: getToken() },
            }
          );

          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            setReturns((prev) => prev.filter((r) => r._id !== id));
            setTotal((prevTotal) => prevTotal - 1);
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(
            error.response?.data?.message || "Failed to delete return"
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        {/* Header + Search + Limit */}
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <h2 className="text-xl font-semibold flex flex-col">
              Purchase Return List
              <span className="text-sm">
                Showing {returns.length} of {total} records
              </span>
            </h2>

            <input
              type="text"
              placeholder="Search returns..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="global_input w-full lg:w-lg"
            />

            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="global_dropdown lg:w-fit"
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
        {returns.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">No</th>
                    <th className="global_th">Supplier</th>
                    <th className="global_th">Date</th>
                    <th className="global_th">Invoice No</th>
                    <th className="global_th">Total Amount</th>
                    <th className="global_th">Note</th>
                    <th className="global_th">Action</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {/* ekhane data pore boshabe */}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 dark:text-gray-800 py-2 rounded-r-md rounded-l-full ${
                  page === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "global_button"
                }`}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className={`px-4 dark:text-gray-800 py-2 rounded-l-md rounded-r-full ${
                  page >= Math.ceil(total / limit)
                    ? "bg-gray-200  cursor-not-allowed"
                    : "global_button"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No purchase returns found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseReturnList;
