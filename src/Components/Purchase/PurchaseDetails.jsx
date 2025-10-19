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

  if (!details) return <div className="p-4">Loading...</div>;

  const totalQty = details?.Products?.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );
  const totalAmount = details?.Products?.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  return (
    <div className="global_container">
      <div
        ref={printRef}
        className="max-w-5xl mx-auto bg-white rounded-md shadow border border-gray-200 p-6"
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-semibold text-[#0a47a9]">
              {businessDetails?.name || "Chuadanga Computer"}
            </h2>
            <p className="text-gray-600">{businessDetails?.address}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-600">
              Purchase Invoice
            </h3>
            <p className="text-blue-500 font-medium text-sm">
              #{details?.PurchaseSummary?.Reference}
            </p>
          </div>
        </div>

        {/* Supplier & Purchase Info */}
        <div className="bg-gray-50 border rounded-md mb-4">
          <div className="border-b px-4 py-2 font-semibold text-sm text-gray-700">
            Supplier & Purchase Information
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4 text-sm">
            <div>
              <p>
                <strong>Name:</strong> {details?.Supplier?.name}
              </p>
              <p>
                <strong>Mobile:</strong> {details?.Supplier?.mobile}
              </p>
              <p>
                <strong>Address:</strong> {details?.Supplier?.address}
              </p>
            </div>
            <div>
              <p>
                <strong>Date:</strong>{" "}
                {formatDate(details?.PurchaseSummary?.Date)}
              </p>
              <p>
                <strong>Reference:</strong>{" "}
                {details?.PurchaseSummary?.Reference}
              </p>
              <p>
                <strong>Created:</strong> {details?.Users?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100 font-semibold">
              <tr>
                <th className="border p-2 text-center w-10">#</th>
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2 text-center w-16">Qty</th>
                <th className="border p-2 text-center w-28">Unit Price</th>
                <th className="border p-2 text-center w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {details?.Products?.map((p, i) => (
                <tr key={i}>
                  <td className="border p-2 text-center">{i + 1}</td>
                  <td className="border p-2">
                    <span className="font-medium">{p.name}</span>
                    {p.serialNos && p.serialNos.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        <strong>Serial Numbers:</strong>{" "}
                        {p.serialNos.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="border p-2 text-center">{p.quantity}</td>
                  <td className="border p-2 text-center">{p.unitCost}</td>
                  <td className="border p-2 text-center">{p.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-50">
                <td className="border p-2 text-center" colSpan="2">
                  Total
                </td>
                <td className="border p-2 text-center">{totalQty}</td>
                <td className="border p-2"></td>
                <td className="border p-2 text-center">{totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex flex-col md:flex-row justify-end">
          <div className="bg-gray-50 border rounded-md p-4 w-full md:w-80 text-sm">
            <h4 className="font-semibold mb-2 border-b pb-1 text-gray-700">
              Payment Summary
            </h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{details?.PurchaseSummary?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="text-green-600">
                {details?.PurchaseSummary?.paid?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-red-600 mt-1">
              <span>Due Amount:</span>
              <span>{details?.PurchaseSummary?.dueAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-center text-gray-600 border-t pt-2">
          Generated on {formatDate(new Date())} | Thank you for your business
          <div className="mt-1 font-medium text-gray-700">
            {businessDetails?.name || "Bseba"}
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PurchaseDetails;
