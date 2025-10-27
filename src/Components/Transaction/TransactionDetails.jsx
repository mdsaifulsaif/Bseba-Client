import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import openCloseStore from "../../Zustand/OpenCloseStore";
import EditTransactionModal from "../Modals/EditTransactionModal";

function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();
  const [TDdata, setTData] = useState({});
  const [deleted, setDeleted] = useState(false);
  const { setEditTransactionModal } = openCloseStore();
  //   for modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction); // pass data to modal
    setEditTransactionModal(true);
  };
  //   const transactions = [
  //     {
  //       _id: "671c96f479770376df65fa82",
  //       contactsID: "66af5f941b35cdbf478bbc8c",
  //       Credit: 712000,
  //       Debit: 0,
  //       note: "Transaction for sale order 12345",
  //       CreatedDate: "2024-08-29T12:34:56Z",
  //     },

  //   ];

  const fetchTransactionDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/ViewTransactionById/${id}`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setTData(res.data.data || {});
      } else {
        toast.error("Failed to fetch transaction details!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

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
          const res = await axios.get(
            `${BaseURL}/DeleteTransactionById/${id}`,
            { headers: { token: getToken() } }
          );

          if (res.data.status === "Success") {
            toast.success("Successfully deleted transaction");
            setTData({}); // clear data
            setDeleted(true); // show no transaction message
          } else {
            toast.error(res.data.message || "Failed to delete transaction");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Delete failed");
        }
      }
    });
  };

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  return (
    <div className="global_container">
      <div className="w-9/11 mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100  ">
            Tech BD
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-100">
            01727841588
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-100">
            Address: Dhaka
          </p>

          <h2 className="text-lg font-bold text-green-600 mt-3">
            Money Receipt
          </h2>
        </div>

        {/* If deleted show message */}
        {deleted ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-gray-600">
              No transaction found.
            </p>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="border border-gray-300 rounded-md overflow-hidden mb-6">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2 w-1/2">Name</td>
                    <td className="p-2">
                      {TDdata.contactDetails?.name || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Mobile</td>
                    <td className="p-2">
                      {TDdata.contactDetails?.mobile || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Address</td>
                    <td className="p-2">
                      {TDdata.contactDetails?.address || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Payment</td>
                    <td className="p-2">{TDdata.Credit || 0}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Received</td>
                    <td className="p-2">{TDdata.Debit || 0}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">
                      Balance After Transaction
                    </td>
                    <td className="p-2 text-green-600 font-medium">
                      Receivable: {Math.abs(TDdata.closingBalance) || 0}
                    </td>
                  </tr>
                  {/* <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Current Balance</td>
                    <td className="p-2 text-green-600 font-medium">
                      Receivable: {TDdata.currentBalance || 0}
                    </td>
                  </tr> */}
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Note</td>
                    <td className="p-2">{TDdata.note || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="font-semibold p-2">Transaction Date</td>
                    <td className="p-2">
                      {TDdata.CreatedDate
                        ? new Date(TDdata.CreatedDate).toLocaleString("en-GB")
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold p-2">Created By</td>
                    <td className="p-2">
                      {TDdata.userDetails?.fullName || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center mt-4 w-full">
              <button
                onClick={() => handleDelete(TDdata._id)}
                className="global_button_red w-full md:w-auto"
              >
                Delete Transaction
              </button>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {/* <Link
                  to={`/Transaction/${TDdata.contactsID || ""}`}
                  className="global_edit w-full md:w-auto text-center"
                >
                  Edit Transaction
                </Link> */}
                <button
                  className="global_edit w-full md:w-auto"
                  onClick={() => handleEditClick(TDdata)}
                >
                  Edit Transaction
                </button>
                {/* <button
                  onClick={() => setEditTransactionModal(true)}
                  className="global_edit"
                >
                  Edit Transaction
                </button> */}

                <button
                  onClick={() => window.print()}
                  className="global_button w-full md:w-auto"
                >
                  Print
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* <EditTransactionModal /> */}
      <EditTransactionModal
        transactionData={selectedTransaction}
        refreshParent={fetchTransactionDetails}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default TransactionDetails;
