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
import { printSaleInvoice } from "../../Helper/PrintSaleInvoice";

const SaleDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);
  // এখানে state রাখবো
  const [copies, setCopies] = useState({
    officer: true,
    office: true,
    dealer: true,
  });

  const toggleCopy = (key) => {
    setCopies((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const getSaleDetailsByID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/SalesDetails/${id}`, {
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
    if (id) getSaleDetailsByID(id);
  }, [id]);

  const handlePrint = () => {
    console.log("Selected copies:", copies);
    printSaleInvoice(printRef, "Sale Invoice", copies);
  };

  if (!details) return <div className="p-4">Loading...</div>;

  return (
    <div className="global_container">
      <div className="flex flex-col justify-between" ref={printRef}>
        <div>
          {/* Headers */}
          <div className="flex justify-between px-1 lg:px-5 py-3 rounded-lg">
            {/* Left */}
            <div className="flex flex-col gap-1">
              <div className="text-lg lg:text-2xl font-semibold flex gap-2">
                {" "}
                <img src={rafidSeeds} height={70} width={70} alt="rafidseeds" />
                <div>
                  <h1>{businessDetails.name}</h1>
                  <p className="text-sm">{businessDetails.address}</p>
                </div>
              </div>

              <div className="text-sm lg:text-base mt-2">
                <p className="font-semibold">
                  {details?.Dealer?.name} ({details?.Dealer?.ID})
                </p>
                <p>Proprietor: {details?.Dealer?.proprietor}</p>
                <p>{details?.Dealer?.mobile}</p>
                <p>{details.Dealer.address}</p>
              </div>
            </div>

            {/* right er Invoice */}
            <div className="flex flex-col text-[12px] lg:text-[15px] w-1/3 font-[500]">
              <h1 className="text-[16px] lg:text-xl text-wrap lg:text-nowrap font-semibold rounded-tl-full bg-[#006D2B] text-white text-center pl-6 pr-1 lg:px-10 py-3">
                Invoice
              </h1>
              <p>Invoice No: {details?.SaleSummary?.Reference}</p>
              <p>
                Date:{" "}
                {details?.SaleSummary?.Date
                  ? (() => {
                      const d = new Date(details.SaleSummary.Date);
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = d.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()
                  : ""}
              </p>
              <p>{businessDetails.mobile}</p>
              <p>{businessDetails.email}</p>
              <p>{businessDetails.website}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto lg:px-5">
            <div className="h-[55vh] flex flex-col justify-between">
              <table className="w-full">
                <thead className="global_thead">
                  <tr className="global_tr">
                    <th className="global_print_th w-7/100">SL</th>
                    <th className="global_print_th w-30/100">
                      Name Of Product
                    </th>
                    <th className="global_print_th w-20/100">Quantity</th>
                    {details.Products.some((p) => p.weight) ? (
                      <th className="global_print_th w-20/100">Weight</th>
                    ) : null}
                    <th className="global_print_th text-end w-10/100">Rate</th>
                    <th className="global_print_th text-end w-13/100">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details?.Products?.map((p, i) => (
                    <tr key={p.id}>
                      <td className="global_td text-center">{i + 1}</td>
                      <td className="global_td text-center">
                        {p.name}{" "}
                        {p.weight && (
                          <span className="text-green-400">
                            (
                            {p.weight >= 1000
                              ? p.weight / 1000 + " KG"
                              : p.weight + " Gram"}
                            )
                          </span>
                        )}
                      </td>
                      <td className="global_td text-center">
                        {p.quantity}{" "}
                        {p.weight && (
                          <span className="px-1 text-blue-300">x</span>
                        )}
                        {p.weight && (
                          <span className="text-green-400">
                            (
                            {p.weight >= 1000
                              ? p.weight / 1000 + " KG"
                              : p.weight + " Gram"}
                            )
                          </span>
                        )}
                      </td>
                      {p.totalWeight ? (
                        <td className="global_td text-center">
                          {p.totalWeight >= 1000
                            ? p.totalWeight / 1000 + " KG"
                            : p.totalWeight + " Gram"}
                        </td>
                      ) : null}
                      <td className="global_td text-end">৳ {p.price}</td>
                      <td className="global_td text-end">৳ {p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex-grow">
                <table className="w-full h-full">
                  <tbody className="h-full">
                    <tr className="global_tr font-semibold text-black">
                      <td className="global_td   w-7/100" colSpan={2}></td>
                      <td className="global_td   w-30/100"></td>
                      <td className="global_td   text-center w-20/100"></td>

                      <td className="global_td   w-20/100"></td>
                      <td className="global_td  w-10/100"></td>
                      <td className="global_td   text-end w-13/100"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="">
                <table className="w-full">
                  <tfoot>
                    <tr className="global_tr font-semibold text-black">
                      <td
                        className="global_td px-0  bg-green-300 w-7/100"
                        colSpan={2}
                      >
                        Total
                      </td>
                      <td className="global_td  bg-green-300 w-30/100"></td>
                      <td className="global_td  bg-green-300 text-center w-20/100">
                        {details?.Products?.reduce(
                          (sum, p) => sum + Number(p.quantity),
                          0
                        )}
                      </td>

                      <td className="global_td  bg-green-300 w-20/100"></td>
                      <td className="global_td  bg-green-300 w-10/100"></td>
                      <td className="global_td  bg-green-300 text-end w-13/100">
                        ৳{" "}
                        {details?.Products?.reduce(
                          (sum, p) => sum + Number(p.total),
                          0
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Footer */}
          <div className="flex justify-between px-1 lg:px-5 py-3 my-4 rounded-lg">
            <div className="flex flex-col gap-1">
              <div className=" flex items-center gap-2">
                <span className="rounded-md">In Word :</span>
                <span className="italic text-green-700 dark:text-green-400 text-sm">
                  {numberToWords(details?.SaleSummary?.grandTotal)} Taka Only
                </span>
              </div>

              <div className="text-sm lg:text-base">
                {details.SaleSummary.note === "" ? null : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <strong className="text-gray-800 dark:text-gray-100">
                      Note:
                    </strong>{" "}
                    {details?.SaleSummary?.note}
                  </p>
                )}
              </div>
            </div>
            {/* right er Invoice */}
            <div className="flex flex-col text-[12px] lg:text-[15px] w-1/3 font-[500]">
              <p className="flex justify-between p-2">
                <strong>Total:</strong>
                <strong>{details?.SaleSummary?.total} Taka</strong>
              </p>
              {details?.SaleSummary?.discount === 0 ? null : (
                <p className="flex justify-between p-2">
                  <strong>Discount:</strong>(
                  {(details.SaleSummary.discount * 100) /
                    details?.SaleSummary?.total}
                  % ) {details?.SaleSummary?.discount} Taka
                </p>
              )}
              <p className="bg-green-300 dark:text-black flex justify-between px-2 py-2">
                <strong>Grand Total:</strong>
                {details?.SaleSummary?.grandTotal} Taka
              </p>
            </div>
          </div>
          {/* Signature */}
          <div className="flex justify-between px-1 lg:px-5 bottom-10 pt-15">
            <div className="flex flex-col gap-1">
              <h1 className="border-b-2"></h1>
              <h1>Prepared By</h1>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="border-b-2"></h1>
              <h1>Recieved By</h1>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="border-b-2"></h1>
              <h1>Authorized By</h1>
            </div>
          </div>
          <div className="w-full text-center text-sm bottom-0 pt-11 text-gray-500 hidden print:block">
            Software Developed By <strong>Bseba.com</strong>
          </div>
        </div>
      </div>

      {/* checkboxes and print button */}
      <div className="flex justify-center items-center py-5 gap-5">
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={copies.officer}
              onChange={() => toggleCopy("officer")}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span>Officers Copy</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={copies.office}
              onChange={() => toggleCopy("office")}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span>Office Copy</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={copies.dealer}
              onChange={() => toggleCopy("dealer")}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span>Dealer Copy</span>
          </label>
        </div>

        <button onClick={handlePrint} className="global_button lg:w-fit w-full">
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default SaleDetails;
