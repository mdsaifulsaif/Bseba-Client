// import axios from "axios";
// import React, { useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { BaseURL } from "../../Helper/Config";
// import { getToken } from "../../Helper/SessionHelper";

// function PurchaseReturn() {
//   const { id } = useParams();

//   const purchaseReturn = async () => {
//     const res = await axios.get(`${BaseURL}/PurchasesDetailsByID/${id}`, {
//       headers: { token: getToken() },
//     });

//     console.log(res.data.data);
//   };

//   useEffect(() => {
//     purchaseReturn();
//   }, []);
//   return <div>PurchaseReturn</div>;
// }

// export default PurchaseReturn;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";

const PurchaseReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnData, setReturnData] = useState({ total: 0, note: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BaseURL}/PurchasesDetailsByID/${id}`, {
          headers: { token: getToken() },
        });
        setPurchaseDetails(res.data.data);
      } catch (err) {
        alert("Failed to load purchase details.");
        setError("Failed to load purchase details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseDetails();
  }, [id]);

  const handleProductSelection = (product, isSelected) => {
    if (isSelected) {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, returnQty: 0, selectedSerialNos: [] },
      ]);
    } else {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    }
  };

  const handleSerialNoSelection = (productId, serialNo, isSelected) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedSerials = isSelected
            ? [...p.selectedSerialNos, serialNo]
            : p.selectedSerialNos.filter((s) => s !== serialNo);
          return {
            ...p,
            selectedSerialNos: updatedSerials,
            returnQty: updatedSerials.length,
          };
        }
        return p;
      })
    );
  };

  const handleQtyChange = (productId, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const originalQty =
            purchaseDetails.Products.find((prod) => prod.id === productId)
              ?.quantity || 0;
          if (qty > originalQty) {
            alert("Return quantity cannot exceed purchase quantity.");
            return { ...p, returnQty: originalQty };
          }
          return { ...p, returnQty: qty };
        }
        return p;
      })
    );
  };

  const calculateReturnTotal = () => {
    return selectedProducts.reduce(
      (sum, p) => sum + p.unitCost * p.returnQty,
      0
    );
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    const totalReturn = calculateReturnTotal();
    setReturnData({ ...returnData, total: totalReturn });

    const payload = {
      PurchaseReturn: {
        contactID: purchaseDetails.Supplier.id,
        purchaseID: id,
        total: totalReturn,
        note: returnData.note,
      },
      ReturnProduct: selectedProducts.map((p) => ({
        productID: p.id,
        productLineID: p.Productlines,
        qty: p.returnQty,
        amount: p.unitCost,
        total: p.unitCost * p.returnQty,
        serialNos: p.selectedSerialNos,
      })),
    };

    try {
      setLoading(true);
      const res = await axios.post(`${BaseURL}/PurchaseReturn`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        alert("Purchase return submitted successfully!");
        navigate("/PurchaseReturnList");
      } else {
        alert(res.data.message || "Failed to submit return.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting return.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5">{error}</div>;
  if (!purchaseDetails) return null;

  return (
    <div className="container mt-5">
      <div className="card mb-4 shadow-sm">
        <div className="py-1 dark:bg-gray-700 bg-gray-100 flex items-center justify-center m-0 p-0 font-semibold">
          <h3 className="mb-4 text-center  text-2xl">Purchases Return</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supplier Details */}
            <div className=" p-4 rounded-lg ">
              <h5 className="text-lg font-semibold mb-2">Supplier Details</h5>
              <hr className="mb-2" />
              <p>
                <strong>Name:</strong> {purchaseDetails.Supplier.name}
              </p>
              <p>
                <strong>Mobile:</strong> {purchaseDetails.Supplier.mobile}
              </p>
              <p>
                <strong>Address:</strong> {purchaseDetails.Supplier.address}
              </p>
            </div>

            {/* Purchase Info */}
            <div className=" p-4 ">
              <h5 className="text-lg font-semibold mb-2">Purchase Info</h5>
              <hr className="mb-2" />
              <p>
                <strong>Date:</strong> {purchaseDetails.PurchaseSummary.Date}
              </p>
              <p>
                <strong>Reference:</strong>{" "}
                {purchaseDetails.PurchaseSummary.Reference}
              </p>
              <p>
                <strong>Note:</strong>{" "}
                {purchaseDetails.PurchaseSummary.note || "-"}
              </p>
            </div>

            {/* Purchase Summary */}
            <div className="border p-4 border-gray-300 rounded-lg ">
              <h6 className="text-center text-lg font-semibold mb-4">
                Purchases Summary
              </h6>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Total:</label>
                  <input
                    type="text"
                    readOnly
                    value={purchaseDetails.PurchaseSummary.total}
                    className="bg-gray-100 dark:bg-gray-800 border dark:border-gray-500 border-gray-300 rounded-md px-3 py-1 text-right w-32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-medium">Paid Amount:</label>
                  <input
                    type="text"
                    readOnly
                    value={purchaseDetails.PurchaseSummary.paid}
                    className="bg-gray-100 border border-gray-300  dark:border-gray-500 dark:bg-gray-800   rounded-md px-3 py-1 text-right w-32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-medium">Due Amount:</label>
                  <input
                    type="text"
                    readOnly
                    value={purchaseDetails.PurchaseSummary.dueAmount}
                    className="bg-gray-100 border border-gray-300 dark:bg-gray-800  dark:border-gray-500 rounded-md px-3 py-1 text-right w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card p-3 shadow-sm mb-3 overflow-auto">
        <h5 className="text-1xl mb-1 font-semibold">Products for Return</h5>
        <table className="global_table w-full">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">Name</th>
              <th className="global_th">Qty</th>
              <th className="global_th">Price</th>
              <th className="global_th">Total</th>
              <th className="global_th">Select</th>
              <th className="global_th">Return Qty</th>
              <th className="global_th">Serial Nos</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {purchaseDetails.Products.map((prod, index) => (
              <tr className="global_tr" key={index}>
                <td className="global_td">{index + 1}</td>
                <td className="global_td">{prod.name}</td>
                <td className="global_td">{prod.quantity}</td>
                <td className="global_td">{prod.unitCost}</td>
                <td className="global_td">{prod.total}</td>
                <td className="global_td">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleProductSelection(prod, e.target.checked)
                    }
                  />
                </td>
                <td className="global_td">
                  <input
                    type="number"
                    className="form-control form-control-sm global_input"
                    value={
                      selectedProducts.find((p) => p.id === prod.id)
                        ?.returnQty || ""
                    }
                    onChange={(e) =>
                      handleQtyChange(prod.id, parseFloat(e.target.value) || 0)
                    }
                    disabled={prod.serialNos && prod.serialNos.length > 0}
                  />
                </td>
                <td className="global_td">
                  {prod.serialNos?.length > 0 &&
                    prod.serialNos.map((s, i) => (
                      <label key={i} className="me-2">
                        {s}{" "}
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleSerialNoSelection(
                              prod.id,
                              s,
                              e.target.checked
                            )
                          }
                        />
                      </label>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-end text-danger mt-2">
          <strong className="text-red-500">
            Total Return Amount: {calculateReturnTotal()}
          </strong>
        </div>
      </div>

      {/* Return Note & Submit */}
      <div className="card p-3 shadow-sm">
        <form onSubmit={handleReturnSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Return Note:
            </label>
            <textarea
              className="form-control global_input"
              value={returnData.note}
              onChange={(e) =>
                setReturnData({ ...returnData, note: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="text-end">
            <button type="submit" className="global_button">
              Submit Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseReturn;
