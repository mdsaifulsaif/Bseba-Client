import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { toast } from "react-hot-toast";
import loadingStore from "../../Zustand/LoadingStore";

const SaleReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saleDetails, setSaleDetails] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setGlobalLoader } = loadingStore();
  const [returnData, setReturnData] = useState({
    total: 0,
    note: "",
  });

  // Fetch Sale Details
  useEffect(() => {
    const fetchSaleDetails = async () => {
      // setLoading(true);
      setGlobalLoader(true);
      try {
        const response = await axios.get(`${BaseURL}/SalesDetailsByID/${id}`, {
          headers: { token: getToken() },
        });
        setSaleDetails(response.data.data);
      } catch (err) {
        toast.error("Failed to load Sale details. Please try again later.");
      } finally {
        // setLoading(false);
        setGlobalLoader(false);
      }
    };
    fetchSaleDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Product selection
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

  // Serial number selection
  const handleSerialNoSelection = (productId, serialNo, isSelected) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedSerialNos = isSelected
            ? [...product.selectedSerialNos, serialNo]
            : product.selectedSerialNos.filter((s) => s !== serialNo);

          return {
            ...product,
            selectedSerialNos: updatedSerialNos,
            returnQty: updatedSerialNos.length,
          };
        }
        return product;
      })
    );
  };

  // Quantity change
  const handleQtyChange = (productId, qty) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const originalQty =
            saleDetails.Products.find((p) => p.id === productId)?.quantity || 0;
          if (qty > originalQty) {
            toast.error("Return quantity cannot exceed Sale quantity.");
            return { ...product, returnQty: originalQty };
          }
          return { ...product, returnQty: qty };
        }
        return product;
      })
    );
  };

  // Amount change
  const handleAmountChange = (productId, amount) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          return { ...product, price: amount / product.returnQty };
        }
        return product;
      })
    );
  };

  // Calculate total return amount
  const calculateReturnTotal = () =>
    selectedProducts.reduce(
      (sum, product) => sum + (product.price * product.returnQty || 0),
      0
    );

  // Submit return
  const handleReturnSubmit = async (e, isRefund = false) => {
    e.preventDefault();
    const returnTotal = calculateReturnTotal();
    setReturnData({ ...returnData, total: returnTotal });

    const returnPayload = {
      SaleReturn: {
        contactID: saleDetails?.Customer?.id,
        saleID: id,
        total: returnTotal,
        paid: isRefund ? returnTotal : undefined,
        note: returnData.note,
      },
      ReturnProduct: selectedProducts.map((product) => ({
        productID: product.id,
        productLineID: product.productLineID,
        qty: product.returnQty,
        amount: product.price,
        total: product.price * product.returnQty,
        serialNos: product.selectedSerialNos,
      })),
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseURL}/SaleReturn`,
        returnPayload,
        {
          headers: { token: getToken() },
        }
      );

      if (response.data.status === "Success") {
        toast.success(
          isRefund
            ? "Return and refund processed successfully!"
            : "Sale return processed successfully!"
        );
        navigate("/SaleReturnList");
      } else {
        toast.error(response.data.message || "Failed to process sale return.");
      }
    } catch (err) {
      toast.error("Error submitting sale return. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // if (loading) return <div className="container mt-5">Loading...</div>;
  if (!saleDetails) return <div className="container mt-5">No data found.</div>;

  return (
    <div className="global_container">
      <div className="global_sub_container ">
        <h1 className="text-xl font-semibold mb-3">Sale Return</h1>

        {/* Customer & Sale Info */}
        <div className=" flex md:flex-row gap-3 flex-col justify-between ">
          {/* customer details  */}
          <div className="">
            <h1 className="text-xl mb-3">Customer Details</h1>
            <div className="h-[1px] bg-gray-300"></div>
            <div className="flex flex-col gap-3">
              <p>
                <strong>Name:</strong> {saleDetails.Customer.name}
              </p>
              <p>
                <strong>Mobile:</strong> {saleDetails.Customer.mobile}
              </p>
              <p>
                <strong>Address:</strong> {saleDetails.Customer.address}
              </p>
            </div>
          </div>
          {/* ref note  */}
          <div className="flex flex-col gap-3">
            <p>
              <strong>Date:</strong> {formatDate(saleDetails.SaleSummary.Date)}
            </p>
            <p>
              <strong>Reference:</strong> {saleDetails.SaleSummary.Reference}
            </p>
            <p>
              <strong>Note:</strong> {saleDetails.SaleSummary.note}
            </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 w-full md:w-64 shadow-sm">
            <h5 className="font-semibold mb-3 text-center">Sale Summary</h5>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-gray-700">Total:</label>
                <input
                  type="text"
                  value={saleDetails.SaleSummary.total.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>

              {saleDetails.SaleSummary.discount > 0 && (
                <div className="flex justify-between items-center">
                  <label className="text-gray-700">Discount:</label>
                  <input
                    type="text"
                    value={saleDetails.SaleSummary.discount}
                    disabled
                    className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <label className="text-gray-700">Grand Total:</label>
                <input
                  type="text"
                  value={saleDetails.SaleSummary.grandTotal.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="text-gray-700">Paid Amount:</label>
                <input
                  type="text"
                  value={saleDetails.SaleSummary.paid.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="text-gray-700">Due Amount:</label>
                <input
                  type="text"
                  value={saleDetails.SaleSummary.dueAmount.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <h5 className="text-xl font-semibold mb-3">Products for Return</h5>
        <div className=" overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Name</th>
                <th className="global_th">Sale Qty</th>
                <th className="global_th">Price</th>
                <th className="global_th">Total</th>
                <th className="global_th">Select</th>
                <th className="global_th">Return Qty</th>
                <th className="global_th">Return Amount</th>
                <th className="global_th">Serial Nos</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {saleDetails.Products.map((product, index) => (
                <tr key={index}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{product.name}</td>
                  <td className="global_td">{product.quantity}</td>
                  <td className="global_td">
                    {product.price.toLocaleString()}
                  </td>
                  <td className="global_td">
                    {product.total.toLocaleString()}
                  </td>
                  <td className="global_td">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleProductSelection(product, e.target.checked)
                      }
                    />
                  </td>
                  <td className="global_td">
                    <input
                      type="number"
                      value={
                        selectedProducts.find((p) => p.id === product.id)
                          ?.returnQty || ""
                      }
                      onChange={(e) =>
                        handleQtyChange(
                          product.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="form-control global_input"
                      disabled={product.serialNos?.length > 0}
                    />
                  </td>
                  <td className="global_td">
                    <input
                      type="number"
                      value={
                        (selectedProducts.find((p) => p.id === product.id)
                          ?.price || 0) *
                        (selectedProducts.find((p) => p.id === product.id)
                          ?.returnQty || 0)
                      }
                      onChange={(e) =>
                        handleAmountChange(
                          product.id,
                          parseFloat(e.target.value)
                        )
                      }
                      className="form-control global_input"
                    />
                  </td>
                  <td className="global_td">
                    {product.serialNos?.length > 0 &&
                      product.serialNos.map((serial, idx) => (
                        <div key={idx}>
                          <label>{serial}</label>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleSerialNoSelection(
                                product.id,
                                serial,
                                e.target.checked
                              )
                            }
                          />
                        </div>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-end text-danger mb-3">
          <h5 className="text-xl font-semibold text-green-600 pt-3">
            Total Return Amount: {calculateReturnTotal()}
          </h5>
        </div>

        {/* Return Form */}
        <form onSubmit={(e) => handleReturnSubmit(e)}>
          <div className="mb-3">
            <h1 className="text-xl font-semibold mb-3">Return Details</h1>
            <label>Return Note:</label>
            <textarea
              value={returnData.note}
              onChange={(e) =>
                setReturnData({ ...returnData, note: e.target.value })
              }
              className="form-control global_input"
              rows="2"
            />
          </div>
          {/* <div className="flex gap-2">
            <button type="submit" className="global_button">
              Submit Return
            </button>
            <button
              type="button"
              onClick={(e) => handleReturnSubmit(e, true)}
              className="global_button"
            >
              Return & Refund
            </button>
          </div> */}
          <div className="flex flex-col sm:flex-row sm:justify-start gap-2 w-full">
            <button type="submit" className="global_button w-full sm:w-auto">
              Submit Return
            </button>

            <button
              type="button"
              onClick={(e) => handleReturnSubmit(e, true)}
              className="global_button w-full sm:w-auto"
            >
              Return & Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleReturn;
