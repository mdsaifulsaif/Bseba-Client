import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

const CreateQuotation = () => {
  const { setGlobalLoader } = loadingStore();
  const [quotation, setQuotation] = useState({
    total: 0,
    profit: 0,
    discount: 0,
    grandTotal: 0,
    BillTo: "",
    note: "",
  });
  const [quotationProducts, setQuotationProducts] = useState([]);
  const [productsOptions, setProductsOptions] = useState([]);

  //  Fetch products from /NewProductList API
  useEffect(() => {
    const fetchProducts = async () => {
      setGlobalLoader(true);
      try {
        const response = await axios.get(`${BaseURL}/NewProductList`, {
          headers: { token: getToken() },
        });

        if (response.data && response.data.status === "Success") {
          const options = response.data.data.map((p) => ({
            value: p._id,
            label: p.name,
            price: p.mrp || 0, // selling price
            purchase: p.unitCost || 0, // purchase price
          }));
          setProductsOptions(options);
        } else {
          ErrorToast("Failed to fetch products");
        }
      } catch (error) {
        console.error(error);
        ErrorToast("API error while fetching products");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchProducts();
  }, []);

  //  Add product
  const handleProductSelect = (product) => {
    if (!product) return;

    const exists = quotationProducts.find((p) => p.value === product.value);
    if (exists) {
      const updated = quotationProducts.map((p) =>
        p.value === product.value
          ? {
              ...p,
              qty: p.qty + 1,
              total: (p.qty + 1) * p.price,
            }
          : p
      );
      setQuotationProducts(updated);
      calculateTotals(updated);
      return;
    }

    const newProduct = { ...product, qty: 1, total: product.price };
    const updated = [...quotationProducts, newProduct];
    setQuotationProducts(updated);
    calculateTotals(updated);
  };

  //  Remove product
  const handleRemoveProduct = (indexToRemove) => {
    const updated = quotationProducts.filter((_, i) => i !== indexToRemove);
    setQuotationProducts(updated);
    calculateTotals(updated);
  };

  //  Change qty or price
  const handleProductChange = (index, field, value) => {
    const updated = [...quotationProducts];
    updated[index][field] = value === "" ? 0 : Number(value);
    updated[index].total =
      (updated[index].qty || 0) * (updated[index].price || 0);
    setQuotationProducts(updated);
    calculateTotals(updated);
  };

  //  Calculate totals
  const calculateTotals = (products) => {
    const total = products.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalPurchase = products.reduce(
      (sum, p) => sum + (p.purchase || 0) * (p.qty || 0),
      0
    );
    const grandTotal = total - (quotation.discount || 0);
    const profit = total - totalPurchase;

    setQuotation((prev) => ({
      ...prev,
      total,
      profit,
      grandTotal,
    }));
  };

  //  Submit quotation
  const handleSubmit = async () => {
    if (quotationProducts.length === 0)
      return ErrorToast("Add at least one product!");

    if (quotation.total <= 0) return ErrorToast("Invalid total amount!");

    const payload = {
      Quotation: quotation,
      QuotationProduct: quotationProducts.map((p) => ({
        productID: p.value,
        qty: p.qty,
        price: p.price,
        total: p.total,
      })),
    };

    try {
      const res = await axios.post(`${BaseURL}/CreateQuotation`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        SuccessToast("Quotation created successfully!");
        // Reset form
        setQuotation({
          total: 0,
          profit: 0,
          discount: 0,
          grandTotal: 0,
          BillTo: "",
          note: "",
        });
        setQuotationProducts([]);
      } else {
        ErrorToast("Failed to create quotation");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("API error while creating quotation");
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h2 className="global_heading">Create New Quotation</h2>

        {/* Bill To & Product Select */}
        <div className="grid grid-cols-2 gap-4 ">
          <div>
            <label className="block mb-1 font-medium">Bill To</label>
            <input
              type="text"
              className="global_input"
              placeholder="Customer Name"
              value={quotation.BillTo}
              onChange={(e) =>
                setQuotation({ ...quotation, BillTo: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Select Product</label>
            <Select
              options={productsOptions}
              onChange={handleProductSelect}
              placeholder="Choose Product"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Note Section */}
        <div className="flex flex-col mb-5 h-full">
          <label className="block mb-2 font-medium text-gray-700">Note:</label>
          <textarea
            className=" global_input w-full  resize-none outline-0 border "
            placeholder="Optional note"
            value={quotation.note}
            onChange={(e) =>
              setQuotation({ ...quotation, note: e.target.value })
            }
          />
        </div>
        {/* Note & Totals */}
        <div className="">
          <div className=" ">
            {/* Totals Section */}

            <div className="flex flex-col justify-between p-5 border border-gray-200 dark:bg-gray-900 rounded-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div className="flex flex-col items-center gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">
                    Total:
                  </label>
                  <input
                    type="number"
                    readOnly
                    className="border border-gray-300 dark:border-gray-700 p-2 rounded w-36 bg-gray-100 dark:bg-gray-800 text-right text-gray-800 dark:text-gray-100 outline-0 focus:ring-2 focus:ring-green-500 transition"
                    value={quotation.total}
                  />
                </div>

                {/* Discount */}
                <div className="flex flex-col items-center gap-2">
                  <label className="font-medium text-red-600 dark:text-red-400">
                    Discount:
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="border border-gray-300 dark:border-gray-700 p-2 rounded w-36 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-0 focus:ring-2 focus:ring-green-500 transition"
                    value={quotation.discount === 0 ? "" : quotation.discount}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;
                      const safeValue = value < 0 ? 0 : value;
                      setQuotation((prev) => ({
                        ...prev,
                        discount: safeValue,
                        grandTotal: prev.total - safeValue,
                      }));
                    }}
                  />
                </div>

                {/* Profit */}
                <div className="flex flex-col items-center gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">
                    Profit:
                  </label>
                  <input
                    type="number"
                    readOnly
                    className="border border-gray-300 dark:border-gray-700 p-2 rounded w-36 bg-gray-100 dark:bg-gray-800 text-right text-gray-800 dark:text-gray-100 outline-0"
                    value={quotation.profit}
                  />
                </div>

                {/* Grand Total */}
                <div className="flex flex-col items-center gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">
                    Grand Total:
                  </label>
                  <input
                    type="number"
                    readOnly
                    className="border border-gray-300 dark:border-gray-700 p-2 rounded w-36 bg-gray-100 dark:bg-gray-800 text-right text-gray-800 dark:text-gray-100 outline-0"
                    value={quotation.grandTotal}
                  />
                </div>
              </div>
            </div>

            <button className="global_button mt-3 " onClick={handleSubmit}>
              Create Quotation
            </button>
          </div>
        </div>
      </div>
      {quotationProducts.length > 0 && (
        <div className="global_sub_container">
          {/* Table */}

          <div className="w-full overflow-auto my-6">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">#</th>
                  <th className="global_th">Product</th>
                  <th className="global_th">Qty</th>
                  <th className="global_th">Price</th>
                  <th className="global_th">Total</th>
                  <th className="global_th">Remove</th>
                  <th className="global_th">Purchase</th>
                  <th className="global_th">PurchaseTotal</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {quotationProducts.map((item, index) => (
                  <tr className="global_tr" key={item.value}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{item.label}</td>
                    <td className="global_td">
                      <input
                        type="number"
                        value={item.qty}
                        min={1}
                        className="global_input"
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "qty",
                            e.target.value === "" ? 1 : Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="global_td">
                      <input
                        type="number"
                        value={item.price}
                        className="global_input"
                        onChange={(e) =>
                          handleProductChange(index, "price", e.target.value)
                        }
                      />
                    </td>
                    <td className="global_td">{item.total}</td>
                    <td className="global_td text-center">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 bg-red-600 rounded cursor-pointer hover:bg-red-700"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <MdDelete size={20} color="white" />
                      </span>
                    </td>
                    <td className="global_td">{item.purchase}</td>
                    <td className="global_td">
                      {(item.purchase * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuotation;
