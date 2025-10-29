import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { printElement } from "../../Helper/Printer";

const SaleReturnDetails = () => {
  const { id } = useParams();
  const [saleReturnDetails, setSaleReturnDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef();

  useEffect(() => {
    const fetchSaleReturnDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseURL}/SaleReturnDetails/${id}`, {
          headers: { token: getToken() },
        });
        setSaleReturnDetails(response.data.data);
        console.log(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load sale return details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSaleReturnDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );

  if (!saleReturnDetails) return null;

  const formatNum = (num) => (num ? num.toLocaleString() : "0");

  return (
    <div className="global_container ">
      <div ref={componentRef} className="text-center">
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
            Sale Return Details
          </h2>
        </div>
        {/* Top 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 text-left gap-6 text-sm mb-5">
          {/* Customer Details */}
          <div>
            <h4 className="font-semibold mb-1 border-b border-gray-300 text-gray-800">
              Customer Details
            </h4>
            <p>
              <strong>Name:</strong> {saleReturnDetails.contact.name}
            </p>
            <p>
              <strong>Mobile:</strong> {saleReturnDetails.contact.mobile}
            </p>
            <p>
              <strong>Address:</strong> {saleReturnDetails.contact.address}
            </p>
          </div>

          {/* Sale Info */}
          <div>
            <h4 className="font-semibold mb-1 border-b border-gray-300 text-gray-800">
              Sale Information
            </h4>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                saleReturnDetails.saleDetails.CreatedDate
              ).toLocaleDateString()}
            </p>
            <p>
              <strong>Reference:</strong>{" "}
              {saleReturnDetails.saleDetails.referenceNo}
            </p>
            <p>
              <strong>Total:</strong>{" "}
              {formatNum(saleReturnDetails.saleDetails.total)}
            </p>
          </div>

          {/* Sale Return Summary */}
          <div>
            <h4 className="font-semibold mb-1 border-b border-gray-300 text-gray-800">
              Sale Return Summary
            </h4>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(saleReturnDetails.CreatedDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Reference:</strong> {saleReturnDetails.referenceNo}
            </p>
            <p>
              <strong>Created By:</strong>{" "}
              {saleReturnDetails.userDetails.fullName}
            </p>
          </div>
        </div>

        {/* Sale Products */}
        <div className="text-left mb-6">
          <h4 className="font-semibold text-gray-800 mb-1">Sale Products</h4>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr className="text-center">
                <th className="border px-2 py-1 w-8">#</th>
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {saleReturnDetails.saleProducts?.length > 0 ? (
                saleReturnDetails.saleProducts.map((product, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{product.name}</td>
                    <td className="border px-2 py-1">{product.qtySold}</td>
                    <td className="border px-2 py-1">
                      {formatNum(product.price)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatNum(product.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center border py-2 text-gray-500"
                  >
                    No Sale Products Found
                  </td>
                </tr>
              )}
              <tr>
                <td
                  colSpan="4"
                  className="text-right border font-semibold px-2"
                >
                  Sale Total
                </td>
                <td className="border px-2 text-center">
                  {formatNum(saleReturnDetails.saleDetails.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sale Return Products */}
        <div className="text-left">
          <h4 className="font-semibold text-red-600 mb-1">
            Sale Return Products
          </h4>
          <table className="w-full border text-sm">
            <thead className="bg-red-100 text-red-700">
              <tr className="text-center">
                <th className="border px-2 py-1 w-8">#</th>
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Quantity Returned</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {saleReturnDetails.saleReturnProducts?.length > 0 ? (
                saleReturnDetails.saleReturnProducts.map((product, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{product.name}</td>
                    <td className="border px-2 py-1">{product.qty}</td>
                    <td className="border px-2 py-1">
                      {formatNum(product.amount)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatNum(product.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center border py-2 text-gray-500"
                  >
                    No Sale Return Products Found
                  </td>
                </tr>
              )}
              <tr>
                <td
                  colSpan="4"
                  className="text-right border font-semibold px-2"
                >
                  Return Total
                </td>
                <td className="border px-2 text-center">
                  {formatNum(saleReturnDetails.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-5">
        <button
          onClick={() => printElement(componentRef, "Sale Return Details")}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default SaleReturnDetails;
