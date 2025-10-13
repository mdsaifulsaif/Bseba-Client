import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";

const TransictionDetails = () => {
  const { id } = useParams(); // get transaction ID from URL
  const [transaction, setTransaction] = useState(null);
  const [transactionList, setTransactionList] = useState([]);
  const { setGlobalLoader } = loadingStore();

  // Fetch Transaction by ID
  const fetchTransactionDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetPostTransactionById/${id}`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        setTransaction(res.data.transaction);
        setTransactionList(res.data.transactionList);
      } else {
        ErrorToast("Failed to fetch transaction details");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) fetchTransactionDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      setGlobalLoader(true);

      const res = await axios.get(`${BaseURL}/ApproveTransaction/${id}`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        SuccessToast("Transaction Approved Successfully");

        // transaction status update kore diba
        setTransaction((prev) => ({
          ...prev,
          status: "1", // approved
        }));

        // approved transaction list update
        if (res.data.approvedTransactions) {
          setTransactionList(res.data.approvedTransactions);
        }
      } else {
        ErrorToast(res.data.message || "Approval failed");
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Transaction Details
        </h1>

        {/* Transaction Info */}
        {transaction ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
            <p>
              <strong>Transaction ID:</strong> {transaction.trxID}
            </p>
            <p>
              <strong>Bank:</strong> {transaction.bankName}
            </p>
            <p>
              <strong>Total:</strong> {transaction.total}
            </p>
            <p>
              <strong>Note:</strong> {transaction.note}
            </p>
            <p>
              <strong>Posted By:</strong> {transaction.postedBy}
            </p>
            <p>
              <strong>RSM:</strong> {transaction.RSMName || "N/A"}
            </p>
            <p>
              <strong>ASM:</strong> {transaction.ASMName || "N/A"}
            </p>
            <p>
              <strong>Posting Time:</strong>{" "}
              <span className="px-2 text-red-400">
                {" "}
                {(() => {
                  const d = new Date(transaction.createdAt);
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  return `${day}-${month}-${year}`;
                })()}
              </span>
              <TimeAgo date={transaction.createdAt} />
            </p>
            <p>
              {transaction.status === "0" ? (
                <span className="text-amber-300 mr-2">Pending</span>
              ) : (
                <span className="text-green-500 mr-2">Approved</span>
              )}
              {transaction.status === "0" && (
                <button
                  onClick={() => {
                    handleApprove();
                  }}
                  className="global_button"
                >
                  Approve
                </button>
              )}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Loading transaction...
          </p>
        )}

        {/* Transaction List Table */}
        <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Transaction Items
        </h2>
        <div className="overflow-x-auto rounded-2xl">
          <table className="global_table">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr className="global_tr">
                <th className="global_th">Dealer</th>
                <th className="global_th">Category</th>

                <th className="global_th">Amount</th>
                <th className="global_th">Money Receive No</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {transactionList.length > 0 ? (
                transactionList.map((item) => (
                  <tr key={item._id} className="global_tr">
                    <td className="global_td">
                      {item.dealerName} <br />
                      <span className="text-xs text-gray-500">
                        {item.dealerMobile} • {item.dealerAddress}
                      </span>
                    </td>
                    <td className="global_td">{item.categoryName}</td>

                    <td className="global_td text-green-600 dark:text-green-400">
                      {item.Debit}
                    </td>
                    <td className="global_td">{item.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No transaction items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransictionDetails;
