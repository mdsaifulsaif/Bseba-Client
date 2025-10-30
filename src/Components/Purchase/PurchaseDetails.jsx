import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ErrorToast } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import { numberToWords } from "../../Helper/UI/NumberToWord";

const PurchaseDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);

  const fetchDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/PurchasesDetailsByID/${id}`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") setDetails(res.data.data);
      else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(error.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handlePrint = () => printElement(printRef, "Purchase Details");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const totalQty = details?.Products?.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );
  const totalAmount = details?.Products?.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  return (
    <div className="global_container dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div
        ref={printRef}
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 print:w-[210mm] print:min-h-[297mm]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#0a47a9] dark:text-blue-400">
            {businessDetails?.name || "Chuadanga Computer"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base mt-1">
            Purchase Invoice
          </p>
          <p className="text-blue-500 dark:text-blue-400 font-medium text-sm mt-1">
            #{details?.PurchaseSummary?.Reference}
          </p>
        </div>

        {/* Supplier & Purchase Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4 print:grid-cols-2">
          {/* Supplier Info */}
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold mb-1 text-lg border-b border-gray-300 dark:border-gray-600 pb-1 text-gray-800 dark:text-gray-100">
              Supplier Details
            </h3>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Name:
              </span>{" "}
              {details?.Supplier?.name}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Mobile:
              </span>{" "}
              {details?.Supplier?.mobile}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Address:
              </span>{" "}
              {details?.Supplier?.address}
            </p>
          </div>

          {/* Purchase Info */}
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold mb-1 text-lg border-b border-gray-300 dark:border-gray-600 pb-1 text-gray-800 dark:text-gray-100">
              Purchase Information
            </h3>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Date:
              </span>{" "}
              {formatDate(details?.PurchaseSummary?.Date)}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Reference:
              </span>{" "}
              {details?.PurchaseSummary?.Reference}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Created By:
              </span>{" "}
              {details?.Users?.name || "N/A"}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-gray-200 dark:border-gray-700 text-sm">
            <thead className="bg-green-100 dark:bg-green-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {details?.Products?.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{p.name}</span>
                    {p.serialNos?.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        <strong>Serial Numbers:</strong>{" "}
                        {p.serialNos.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{p.quantity}</td>
                  <td className="px-3 py-2 text-right">{p.unitCost}</td>
                  <td className="px-3 py-2 text-right">{p.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold">
              <tr>
                <td colSpan="2" className="px-3 py-2 text-right">
                  Total
                </td>
                <td className="px-3 py-2 text-right">{totalQty}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-right">{totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 w-full md:w-80 text-sm">
            <h4 className="font-semibold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1 text-gray-800 dark:text-gray-100">
              Payment Summary
            </h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{details?.PurchaseSummary?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="text-green-600 dark:text-green-400">
                {details?.PurchaseSummary?.paid?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-red-600 dark:text-red-400 mt-1">
              <span>Due Amount:</span>
              <span>{details?.PurchaseSummary?.dueAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-300 border-t border-gray-300 dark:border-gray-600 pt-2">
          Generated on {formatDate(new Date())} | Thank you for your business
          <div className="mt-1 font-medium text-gray-700 dark:text-gray-200">
            {businessDetails?.name || "Bseba"}
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-4 print:hidden">
        <button onClick={handlePrint} className="global_button">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PurchaseDetails;
