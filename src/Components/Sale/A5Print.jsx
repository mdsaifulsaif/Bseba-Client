import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { printElement } from "../../Helper/Printer";

const A5Print = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BaseURL}/SalesDetailsByID/${id}`, {
        headers: { token: getToken() },
      });
      if (res.data?.status === "Success") {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    }
  };

  const handlePrint = () => {
    printElement(printRef, `Invoice-${id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      ref={printRef}
      className="flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-900"
    >
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md p-4 w-[148mm] min-h-[210mm] border border-gray-300 dark:border-gray-700 rounded text-sm">
        {/* Header */}
        <div className="text-center mb-1">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Tech BD
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            01727841588
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">Dhaka</p>
          <hr className="border-gray-300 dark:border-gray-600 my-1" />
        </div>

        {/* Customer and Invoice Info */}
        <div className="flex justify-between mb-2">
          <div className="text-gray-700 dark:text-gray-300 text-sm">
            <p>{data?.Customer?.name || "N/A"}</p>
            <p>{data?.Customer?.mobile}</p>
            <p>{data?.Customer?.address}</p>
          </div>
          <div className="text-center text-green-600 dark:text-green-400 font-semibold">
            <h4>Invoice</h4>
          </div>
          <div className="text-right text-gray-700 dark:text-gray-300 text-sm">
            <p>{data?.SaleSummary?.Reference}</p>
            <p>
              {data?.SaleSummary?.Date ? formatDate(data.SaleSummary.Date) : ""}
            </p>
            <p>Created: {data?.Users?.name}</p>
          </div>
        </div>

        {/* Product Table */}
        <table className="global_table dark:border-gray-600 w-full border-collapse text-sm mb-2">
          <thead className="bg-green-600 dark:bg-green-700 text-white">
            <tr>
              <th className="global_th p-1 w-[30px]">No.</th>
              <th className="global_th p-1 text-left">Item Description</th>
              <th className="global_th p-1 text-center w-[50px]">QTY</th>
              <th className="global_th p-1 text-center w-[60px]">Price</th>
              <th className="global_th p-1 text-right w-[70px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {data?.Products?.length > 0 ? (
              data.Products.map((p, i) => (
                <tr
                  key={p.id}
                  className="border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="global_td p-1 text-center">{i + 1}</td>
                  <td className="global_td p-1">{p.name}</td>
                  <td className="global_td p-1 text-center">{p.quantity}</td>
                  <td className="global_td p-1 text-center">{p.price}</td>
                  <td className="global_td p-1 text-right">{p.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center global_td p-2 dark:text-gray-300"
                >
                  No items found
                </td>
              </tr>
            )}
            <tr className="font-semibold">
              <td
                colSpan="2"
                className="global_td p-1 text-right dark:text-gray-200"
              >
                Total Product
              </td>
              <td className="global_td p-1 text-center dark:text-gray-200">
                {data?.Products?.reduce((sum, p) => sum + p.quantity, 0) || 0}
              </td>
              <td colSpan="2" className="global_td dark:text-gray-200"></td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words and Summary */}
        <div className="flex justify-between mt-1">
          <div>
            <p className="text-xs text-gray-700 dark:text-gray-400 mb-2">
              One Hundred Eighteen Point Eight Only
            </p>
            {data?.SaleSummary?.note && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Note:{" "}
                <span className="text-gray-700 dark:text-gray-400">
                  {data.SaleSummary.note}
                </span>
              </p>
            )}
          </div>

          <table className="text-sm border-collapse border-gray-600 dark:border-gray-700">
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-1 font-semibold">
                  Total
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-1 text-right">
                  {data?.SaleSummary?.total?.toFixed(2)}
                </td>
              </tr>
              {data?.SaleSummary?.discount > 0 && (
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 p-1 font-semibold">
                    Discount
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-1 text-right">
                    {data.SaleSummary.discount.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-1 font-semibold">
                  Payable
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-1 text-right">
                  {data?.SaleSummary?.grandTotal?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 p-1 font-semibold">
                  Due
                </td>
                <td className="border border-gray-300 dark:border-gray-700 p-1 text-right text-green-600 dark:text-green-400 font-semibold">
                  {data?.SaleSummary?.dueAmount?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between mt-8 text-xs text-gray-700 dark:text-gray-400">
          <p>Customer Signature</p>
          <p>Authorised Signature</p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-3 text-gray-500 dark:text-gray-400">
          <p>
            Powered by{" "}
            <span className="text-red-600 font-semibold dark:text-red-400">
              Bseba.com
            </span>
          </p>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        id="no-print"
        className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 dark:hover:bg-green-600"
      >
        Print Invoice
      </button>
    </div>
  );
};

export default A5Print;
