import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import Select from "react-select";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreatePurchase = () => {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [searchSupplierKeyword, setSearchSupplierKeyword] = useState("");
  const { setGlobalLoader } = loadingStore();
  const { setSupplierModal } = openCloseStore();
  const [note, setNote] = useState("");
  const [lastEdited, setLastEdited] = useState(null); // "discount" | "percent"
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [grandTotal, setGrandTotal] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const navigate = useNavigate();

  // Fetch suppliers
  const fetchSuppliers = async (keyword = 0) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/SupplierList/1/20/${keyword}`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setSuppliers(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.supplier} (${s.company})`,
          }))
        );
      } else {
        ErrorToast("Failed to fetch suppliers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch products
  const fetchProducts = async (keyword = 0) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/ProductList/1/20/${keyword}`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setProducts(
          res.data.data.map((p) => ({
            value: p._id,
            label: p.name,
            ...p,
          }))
        );
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  useEffect(() => {
    const keyword =
      searchSupplierKeyword.trim() === "" ? 0 : searchSupplierKeyword;
    fetchSuppliers(keyword);
  }, [searchSupplierKeyword]);

  useEffect(() => {
    const keyword =
      searchProductKeyword.trim() === "" ? 0 : searchProductKeyword;
    fetchProducts(keyword);
  }, [searchProductKeyword]);

  // Add product
  const handleAddProduct = (product) => {
    if (!selectedProducts.find((p) => p._id === product._id)) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          purchasesQty: 1,
          unitCost: product.unitCost || 0,
          price: product.price || 0, // ✅ Sell Price
          sp: product.sp || 0, // ✅ Special Price
          total: product.unitCost || 0,
        },
      ]);
    }
  };

  // Update product field
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value === "" ? 0 : Number(value);

    updated[index].total =
      (updated[index].purchasesQty || 0) * (updated[index].unitCost || 0);

    setSelectedProducts(updated);
  };

  // Derived values
  const totalAmount = selectedProducts.reduce(
    (acc, p) => acc + (p.total || 0),
    0
  );

  // Auto calculate based on percentage
  useEffect(() => {
    if (lastEdited === "percent") {
      if (discountPercent === 0) {
        setDiscount(0); // Clear discount when percent is 0
      } else if (discountPercent > 0) {
        const calcDiscount = (totalAmount * discountPercent) / 100;
        setDiscount(Number(calcDiscount.toFixed(2)));
      }
    }
  }, [discountPercent, totalAmount, lastEdited]);

  // Keep percentage synced if user edits flat discount
  useEffect(() => {
    if (lastEdited === "discount") {
      if (discount === 0) {
        setDiscountPercent(0); // Clear percent when discount is 0
      } else if (totalAmount > 0) {
        const percent = (discount / totalAmount) * 100;
        setDiscountPercent(Number(percent.toFixed(2)));
      }
    }
  }, [discount, totalAmount, lastEdited]);

  // Always recalc grandTotal & dueAmount
  useEffect(() => {
    const newGrand = totalAmount - (discount || 0);
    setGrandTotal(newGrand);

    const newDue = Math.max(0, newGrand - (paidAmount || 0));
    setDueAmount(newDue);
  }, [totalAmount, discount, paidAmount]);

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedSupplier) return ErrorToast("Select a supplier");
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");

    const payload = {
      Purchase: {
        supplierID: selectedSupplier.value,
        total: totalAmount,
        discount: discount || 0,
        grandTotal: grandTotal,
        paid: paidAmount,
        dueAmount: dueAmount,
        note: note,
      },
      PurchasesProduct: selectedProducts.map((p) => ({
        productID: p._id,
        name: p.name,
        purchasesQty: p.purchasesQty || 0,
        unitCost: p.unitCost || 0,
        price: p.price || 0, // ✅ Sell Price
        sp: p.sp || 0, // ✅ Special Price
        total: p.total || 0,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreatePurchases`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast("Purchase created successfully");
        setSelectedProducts([]);
        setSelectedSupplier(null);
        navigate(`/PurchaseDetails/${res.data.purchaseID}`);
      } else {
        ErrorToast("Failed to create purchase");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      {/* Supplier & Product Selection */}
      <div className="global_sub_container grid grid-cols-4 gap-4">
        <div className="col-span-4 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Supplier Name *
          </label>

          <Select
            options={suppliers}
            value={selectedSupplier}
            onChange={setSelectedSupplier}
            placeholder="Select Supplier"
            classNamePrefix="react-select"
            className=""
            onInputChange={(val) => setSearchSupplierKeyword(val)}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
        </div>
        <div className="col-span-4 lg:col-span-2 flex gap-2">
          <div className="flex items-end">
            <button
              onClick={() => {
                setSupplierModal(true);
              }}
              className=" flex items-center justify-center gap-2 global_button"
            >
              Add Supplier
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mt-1 mb-1">
              Select Date
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={purchaseDate}
                onChange={(date) => setPurchaseDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full "
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>
        </div>

        <div className="col-span-4 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Product Name *
          </label>
          <Select
            options={products}
            onChange={handleAddProduct}
            placeholder="Select Product"
            classNamePrefix="react-select"
            onInputChange={(val) => setSearchProductKeyword(val)}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
      </div>

      {/* Selected products table */}
      <div className="global_sub_container mt-4 overflow-auto">
        {selectedProducts.length > 0 ? (
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Product Name</th>
                <th className="global_th">Qty</th>
                <th className="global_th">Unit Cost</th>
                <th className="global_th">Sell Price</th>
                <th className="global_th">Special Price</th>
                <th className="global_th">Total</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {selectedProducts.map((p, idx) => (
                <tr className="global_tr" key={p._id}>
                  <td className="global_td">{idx + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.purchasesQty === 0 ? "" : p.purchasesQty}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "purchasesQty",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="global_input w-24"
                    />
                  </td>
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.unitCost === 0 ? "" : p.unitCost}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "unitCost",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="global_input w-24"
                    />
                  </td>
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.price === 0 ? "" : p.price}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "price",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="global_input w-24"
                    />
                  </td>
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.sp === 0 ? "" : p.sp}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "sp",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="global_input w-24"
                    />
                  </td>
                  <td className="global_td">{p.total.toFixed(2)}</td>
                  <td className="global_td">
                    <button
                      onClick={() =>
                        setSelectedProducts(
                          selectedProducts.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No products selected
          </div>
        )}
      </div>

      {/* Purchase Summary */}
      {selectedProducts.length > 0 && (
        <div className="global_sub_container">
          <div className="flex flex-col lg:flex-row rounded-lg  gap-6">
            {/* Note */}
            <div className="flex-1">
              <label
                htmlFor="note"
                className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
              >
                Note
              </label>
              <textarea
                name="note"
                id="note"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                }}
                className="global_input min-h-[150px] w-full"
              />
            </div>

            {/* Purchase Summary */}
            <div className="flex-1 global_sub_container">
              <div className="space-y-3">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <label>Total:</label>
                  <input
                    type="number"
                    value={totalAmount.toFixed(2)}
                    disabled
                    className="global_input w-40 rounded-sm text-right bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Discount % */}
                <div className="flex justify-between items-center">
                  <label>Discount % :</label>
                  <input
                    type="number"
                    value={discountPercent === 0 ? "" : discountPercent}
                    onChange={(e) => {
                      setDiscountPercent(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      );
                      setLastEdited("percent");
                    }}
                    className="global_input rounded-sm w-40 text-right"
                    min="0"
                    max="100"
                  />
                </div>
                {/* Discount */}
                <div className="flex justify-between items-center">
                  <label>Discount Amount:</label>
                  <input
                    type="number"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) => {
                      setDiscount(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      );
                      setLastEdited("discount");
                    }}
                    className="global_input rounded-sm w-40 text-right"
                    min="0"
                    max={totalAmount}
                  />
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center">
                  <label>Grand Total:</label>
                  <input
                    type="number"
                    value={grandTotal.toFixed(2)}
                    disabled
                    className="global_input w-40 rounded-sm text-right bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Paid Amount */}
                <div className="flex justify-between items-center">
                  <label>Paid Amount:</label>
                  <input
                    type="number"
                    value={paidAmount === 0 ? "" : paidAmount}
                    onChange={(e) => {
                      let val =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      if (val > grandTotal) val = grandTotal; // cap at grand total
                      setPaidAmount(val);
                    }}
                    className="global_input w-40 rounded-sm text-right"
                  />
                </div>

                {/* Due Amount */}
                <div className="flex justify-between items-center">
                  <label>Due Amount:</label>
                  <input
                    type="number"
                    value={dueAmount.toFixed(2)}
                    disabled
                    className="global_input w-40 rounded-sm text-right bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 w-full flex justify-center lg:justify-end">
            <button
              onClick={handleSubmit}
              className="global_button w-full lg:w-fit"
            >
              Create Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePurchase;
