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
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
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
        className="max-w-4xl mx-auto bg-white shadow-lg p-6 rounded-lg border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{businessDetails?.name}</h1>
            <p className="text-gray-600">{businessDetails?.address}</p>
          </div>
          <div className="text-right bg-blue-600 text-white px-4 py-2 rounded">
            <h2 className="font-bold">Purchase Invoice</h2>
            <p className="text-sm">
              #{details?.PurchaseSummary?.Reference || id}
            </p>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-4">
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
              <strong>Reference:</strong> {details?.PurchaseSummary?.Reference}
            </p>
            <p>
              <strong>Created:</strong> {details?.Users?.[0]?.fullName || "N/A"}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Unit Price</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {details?.Products?.map((p, i) => (
                <tr key={p.id || i}>
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{p.quantity}</td>
                  <td className="border p-2">{p.unitCost}</td>
                  <td className="border p-2">{p.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-100">
                <td className="border p-2" colSpan={2}>
                  Total
                </td>
                <td className="border p-2">{totalQty}</td>
                <td className="border p-2"></td>
                <td className="border p-2">{totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex flex-col lg:flex-row justify-between mt-4">
          <div>
            <p className="italic text-green-700">
              In Words:{" "}
              {numberToWords(details?.PurchaseSummary?.grandTotal || 0)} Taka
              Only
            </p>
            {details?.PurchaseSummary?.note && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Note:</strong> {details.PurchaseSummary.note}
              </p>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded w-full lg:w-1/3 mt-4 lg:mt-0">
            <p className="flex justify-between">
              <strong>Subtotal:</strong> {details?.PurchaseSummary?.total}
            </p>
            {details?.PurchaseSummary?.discount > 0 && (
              <p className="flex justify-between">
                <strong>Discount:</strong> {details?.PurchaseSummary?.discount}
              </p>
            )}
            <p className="flex justify-between bg-green-100 p-2 rounded mt-2">
              <strong>Grand Total:</strong>{" "}
              {details?.PurchaseSummary?.grandTotal}
            </p>
            <p className="flex justify-between">
              <strong>Paid:</strong> {details?.PurchaseSummary?.paid}
            </p>
            <p className="flex justify-between text-red-600">
              <strong>Due:</strong> {details?.PurchaseSummary?.dueAmount}
            </p>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-4">
        <button onClick={handlePrint} className="global_button">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PurchaseDetails;
