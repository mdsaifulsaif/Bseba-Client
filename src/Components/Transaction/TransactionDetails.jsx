import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TransactionDetails() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [TDdata, setTData] = useState({});

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

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  return (
    <div className="global_container">
      {/* <div className="global_sub_container"> */}
      <div className=" w-9/11  mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tech BD</h1>
          <p className="text-sm text-gray-600">01727841588</p>
          <p className="text-sm text-gray-600">Address: Dhaka</p>

          <h2 className="text-lg font-bold text-green-600 mt-3">
            Money Receipt
          </h2>
        </div>

        {/* Table Section */}
        <div className="border border-gray-300  rounded-md overflow-hidden mb-6">
          <table className="w-full border-collapse ">
            <tbody>
              <tr className="border-b border-gray-300 ">
                <td className="font-semibold p-2 w-1/2">Name</td>
                <td className="p-2">{TDdata.contactDetails?.name || "-"}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="font-semibold p-2">Mobile</td>
                <td className="p-2">{TDdata.contactDetails?.mobile || "-"}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="font-semibold p-2">Address</td>
                <td className="p-2">{TDdata.contactDetails?.address || "-"}</td>
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
                <td className="font-semibold p-2">Balance After Transaction</td>
                <td className="p-2 text-green-600 font-medium">
                  Receivable: {TDdata.closingBalance || 0}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="font-semibold p-2">Current Balance</td>
                <td className="p-2 text-green-600 font-medium">
                  Receivable: {TDdata.currentBalance || 0}
                </td>
              </tr>
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
                <td className="p-2">{TDdata.userDetails?.fullName || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons */}

        <div className="flex flex-col md:flex-row gap-3 justify-between items-center mt-4 w-full">
          {/* Delete Button */}
          <button className="global_button_red w-full md:w-auto">
            Delete Transaction
          </button>

          {/* Right Side Buttons */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Link
              to={`/Transaction/${TDdata.contactsID || ""}`}
              className="global_edit w-full md:w-auto text-center"
            >
              Edit Transaction
            </Link>

            <button
              onClick={() => window.print()}
              className="global_button w-full md:w-auto"
            >
              Print
            </button>
          </div>
        </div>
      </div>
      {/* </div> */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default TransactionDetails;
