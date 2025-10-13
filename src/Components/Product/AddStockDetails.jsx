import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import rafidSeeds from "../../assets/Rafid-Seeds.png";

const AddStockDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);

  const getAddStockDetailsByID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/AddStockDetailsByID/${id}`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        setDetails(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) getAddStockDetailsByID(id);
  }, [id]);

  const handlePrint = () => {
    printElement(printRef, "AddStock details");
  };

  if (!details) return <div className="p-4">Loading...</div>;

  // 🔹 Calculate totals
  const totalQty = details?.AddStockProducts?.reduce(
    (sum, p) => sum + p.qty,
    0
  );
  const grandTotal = details?.AddStockProducts?.reduce(
    (sum, p) => sum + p.qty * p.price,
    0
  );

  return (
    <div className="global_container">
      <div ref={printRef}>
        {/* Header */}
        <div className="flex justify-between px-1 lg:px-5 py-3 my-4 rounded-lg">
          <div className="flex flex-col gap-1">
            <div className="text-lg lg:text-2xl font-semibold flex gap-2">
              <img src={rafidSeeds} height={70} width={70} alt="rafidseeds" />
              <div>
                <h1>{businessDetails.name}</h1>
                <p className="text-sm">{businessDetails.address}</p>
              </div>
            </div>

            <div className="text-sm lg:text-base">
              <p className="font-semibold mb-2">Added By</p>
              <p>{details?.userName}</p>
            </div>
          </div>

          {/* Right invoice info */}
          <div className="flex flex-col text-[12px] lg:text-[15px] w-1/3 font-[500]">
            <h1 className="text-[16px] lg:text-xl text-wrap lg:text-nowrap font-semibold rounded-tl-full bg-[#006D2B] text-white text-center pl-6 pr-1 lg:px-10 py-3">
              AddStock Invoice
            </h1>
            <p>Invoice No: {details?.no}</p>
            <p>
              Date:{" "}
              {details?.CreatedDate
                ? (() => {
                    const d = new Date(details.CreatedDate);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()
                : ""}
            </p>
            <p>Added By : {details?.userName}</p>
            <p>{businessDetails.mobile}</p>
            <p>{businessDetails.email}</p>
            <p>{businessDetails.website}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-6 lg:px-5">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_print_th">SL</th>
                <th className="global_print_th">Product</th>
                <th className="global_print_th">Qty</th>
                <th className="global_print_th">Price</th>
                <th className="global_print_th">Special Price</th>
              </tr>
            </thead>
            <tbody>
              {details?.AddStockProducts?.map((p, i) => (
                <tr key={p._id}>
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td">{p.qty}</td>
                  <td className="global_td">{p?.price || ""}</td>
                  <td className="global_td">{p?.sp || ""}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="global_tr font-semibold text-black">
                <td className="global_td bg-green-300" colSpan={2}>
                  Total
                </td>
                <td className="global_td bg-green-300">{totalQty}</td>
                <td className="global_td bg-green-300"></td>
                <td className="global_td bg-green-300">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="flex flex-col lg:flex-row justify-between lg:px-5">
          <div className="rounded-lg">
            {details.note && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong className="text-gray-800 dark:text-gray-100">
                  Note:
                </strong>{" "}
                {details.note}
              </p>
            )}
          </div>

          <div className="rounded-lg flex flex-col bg-green-100 dark:bg-gray-800 lg:w-1/3 gap-2 justify-between text-start">
            <p className="flex justify-between p-2">
              <strong>Total Qty:</strong>
              <strong>{totalQty}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Print button */}
      <div className="flex justify-center items-center py-5">
        <button onClick={handlePrint} className="global_button">
          Print
        </button>
      </div>
    </div>
  );
};

export default AddStockDetails;
