import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import rafidSeeds from "../../assets/Rafid-Seeds.png";
import { numberToWords } from "../../Helper/UI/NumberToWord";

const PurchaseDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);

  const getPurchaseDetailsByID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/PurchasesDetailsByID/${id}`, {
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
    if (id) getPurchaseDetailsByID(id);
  }, [id]);

  const handlePrint = () => {
    printElement(printRef, "purchase details");
  };

  if (!details) return <div className="p-4">Loading...</div>;

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
              <p className="font-semibold mb-2">Supplier</p>
              <p>{details?.Supplier?.supplier}</p>
              <p>{details?.Supplier?.mobile}</p>
              <p>{details?.Supplier?.address}</p>
            </div>
          </div>
          {/* right er Purchase Invoice */}
          <div className="flex flex-col text-[12px] lg:text-[15px] w-1/3 font-[500]">
            <h1 className="text-[16px] lg:text-xl text-wrap lg:text-nowrap font-semibold rounded-tl-full bg-[#006D2B] text-white text-center pl-6 pr-1 lg:px-10 py-3">
              Purchase Invoice
            </h1>
            <p>Invoice No: {details?.PurchaseSummary?.Reference}</p>
            <p>
              Date:{" "}
              {details?.PurchaseSummary?.Date
                ? (() => {
                    const d = new Date(details.PurchaseSummary.Date);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()
                : ""}
            </p>
            <p>{businessDetails.mobile}</p>
            <p className="break-words max-w-[110px] lg:w-full">
              {businessDetails.email}
            </p>
            <p>{businessDetails.website}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-6 lg:px-5">
          <table className="global_table">
            <thead className="global_thead">
              <th className="global_print_th">SL</th>
              <th className="global_print_th">Product</th>
              <th className="global_print_th">Qty</th>
              <th className="global_print_th">Unit Cost</th>
              <th className="global_print_th">Total</th>
            </thead>
            <tbody>
              {details?.Products?.map((p, i) => (
                <tr key={p.id}>
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td">{p.quantity}</td>
                  <td className="global_td">{p.unitCost}</td>
                  <td className="global_td">{p.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="global_tr font-semibold text-black">
                <td className="global_td bg-green-300" colSpan={2}>
                  Total
                </td>
                <td className="global_td bg-green-300">
                  {details?.Products?.reduce(
                    (sum, p) => sum + Number(p.quantity),
                    0
                  )}
                </td>
                <td className="global_td bg-green-300"></td>
                <td className="global_td bg-green-300">
                  {details?.Products?.reduce(
                    (sum, p) => sum + Number(p.total),
                    0
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="flex  flex-col lg:flex-row justify-between lg:px-5">
          <div className="rounded-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-[15px] rounded-md">In Word :</span>
              <span className="italic text-green-700 dark:text-green-400 text-sm">
                {numberToWords(details?.PurchaseSummary?.grandTotal)} Taka Only
              </span>
            </h2>
            {details.PurchaseSummary.note === "" ? null : (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <strong className="text-gray-800 dark:text-gray-100">
                  Note:
                </strong>{" "}
                {details?.PurchaseSummary?.note}
              </p>
            )}
          </div>

          <div className="rounded-lg flex flex-col bg-green-100 dark:bg-gray-800 lg:w-1/3 gap-2 justify-between text-start">
            <p className="flex justify-between p-2">
              <strong>Total:</strong>
              <strong>{details?.PurchaseSummary?.total} Taka</strong>
            </p>
            {details?.PurchaseSummary?.discount === 0 ? null : (
              <p className="flex justify-between p-2">
                <strong>Discount:</strong> {details?.PurchaseSummary?.discount}{" "}
                Taka
              </p>
            )}
            <p className="bg-green-300 dark:text-black flex justify-between px-2 py-2">
              <strong>Grand Total:</strong>
              {details?.PurchaseSummary?.grandTotal} Taka
            </p>
            <p className="flex justify-between p-2">
              <strong>Paid:</strong>
              {details?.PurchaseSummary?.paid} Taka
            </p>
            <p className="flex justify-between p-2">
              <strong>Due:</strong>
              {details?.PurchaseSummary?.dueAmount} Taka
            </p>
          </div>
        </div>
      </div>

      {/* Print button */}
      <div className="flex justify-center items-center py-5">
        <button onClick={handlePrint} className="global_button">
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default PurchaseDetails;
