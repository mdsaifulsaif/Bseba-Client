import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import Select from "react-select";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProductAddModal from "../Modals/ProductAddModal";
import CreateCustomerModalImmediate from "../Modals/CreateCustomerModalImmediate";
import toast from "react-hot-toast";
import { playWarningSound } from "../../Helper/utils";

const CreatePurchase = () => {
  const [customerModal, setCustomerModal] = useState(false);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [searchCustomerKeyword, setSearchCustomerKeyword] = useState("");
  const { setGlobalLoader } = loadingStore();
  const [note, setNote] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());

  const [otherCostName, setOtherCostName] = useState("");
  const [cost, setCost] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [viewTotalPurchasePrice, setViewTotalPurchasePrice] = useState(true);
  // Summary
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const fetchProductWithPosMachine = async (code) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/ProductList/1/1/${code}`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success" && res.data.data.length > 0) {
        const productData = res.data.data[0];
        const product = {
          ...productData,
          value: productData._id,
          label: `${productData.name} (${productData.Brands.name}) (${productData.Categories.name} ${productData.qty})`,
        };
        handleAddProduct(product);
      } else {
        playWarningSound();
        toast.error("No Product Found with This Pos");
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
      setBarcode(""); // clear input after API call
    }
  };
  // Fetch c
  const fetchCustomers = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/CustomersList/1/20/${searchCustomerKeyword || 0}`,
        {
          headers: { token: getToken() },
        }
      );
      if (res.data.status === "Success") {
        setCustomers(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name} (${s.address}) (${s.mobile}) (${s.balance}) `,
            ...s,
          }))
        );
      } else {
        ErrorToast("Failed to fetch customers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/ProductList/1/20/${searchProductKeyword || 0}`,
        {
          headers: { token: getToken() },
        }
      );
      if (res.data.status === "Success") {
        setProducts(
          res.data.data.map((p) => ({
            value: p._id,
            label: `${p.name} (${p.Brands.name}) (${p.Categories.name}) (${p.qty})`,
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
    fetchCustomers();
  }, [searchCustomerKeyword]);

  useEffect(() => {
    fetchProducts();
  }, [searchProductKeyword]);

  // Add product
  const handleAddProduct = (product) => {
    if (!product) return;
    if (product.qty === 0) {
      ErrorToast("Product quantity is zero");
      return;
    }

    const exist = selectedProducts.find((p) => p._id === product._id);

    if (exist && product.qty > exist.qtySold) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                qtySold: p.qtySold + 1,
                total: (p.qtySold + 1) * p.price,
                // অথবা আপনার calculation অনুযায়ী
              }
            : p
        )
      );
    }

    if (exist && product.qty === exist.qtySold) {
      ErrorToast("No more Stock");
    }

    if (!selectedProducts.find((p) => p._id === product._id)) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          _id: product._id,
          label: product.label,
          name: product.name,
          qty: 1,
          price: product.mrp || 0,
          total: product.mrp || 0,
          qtySold: 1,
          unitCost: product.unitCost || 0,
        },
      ]);
    }
  };

  // Update product field
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value === "" ? 0 : Number(value);
    updated[index].total =
      (updated[index].qtySold || 0) * (updated[index].price || 0);
    setSelectedProducts(updated);
  };

  const totalAmount = selectedProducts.reduce(
    (acc, p) => acc + (p.total || 0),
    0
  );
  const grandTotal =
    totalAmount +
    (cost || 0) -
    (discount || 0) +
    (selectedCustomer?.balance || 0);
  const dueAmount = Math.max(0, grandTotal - (paidAmount || 0));

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedCustomer) return ErrorToast("Select a Customer");
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");

    const payload = {
      Sale: {
        contactID: selectedCustomer.value,
        total: totalAmount,
        discount: discount || 0,
        grandTotal: grandTotal,
        PreviousBalance: selectedCustomer.balance || 0,
        CurrentBalance: selectedCustomer.balance || 0,
        paid: paidAmount,
        dueAmount: dueAmount,
        CreatedDate: purchaseDate,
        note: note,
        date: purchaseDate.toISOString(),
        ...(otherCostName && cost > 0
          ? { outher: otherCostName, outherAmount: cost }
          : {}),
      },
      SaleProduct: selectedProducts.map((p) => ({
        productID: p._id,
        qtySold: p.qtySold,
        price: p.price,
        total: p.total || 0,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/FifoSales2`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        console.log("after create prucech", res.data.purchaseID);
        SuccessToast("Purchase created successfully");
        setSelectedProducts([]);
        setSelectedCustomer(null);
      } else {
        ErrorToast(res.data.message || "Failed to create purchase");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="">
      {/* Contact & Product Selection */}
      <div className="global_sub_container grid grid-cols-4 gap-4">
        {/* Contact*/}
        <div className="col-span-4 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Customer Name
          </label>
          <Select
            options={customers}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            placeholder="Select Customer"
            classNamePrefix="react-select"
            onInputChange={(val) => setSearchCustomerKeyword(val)}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
        </div>
        {/* Add Contact*/}
        <div className="col-span-4 lg:col-span-2 flex gap-2">
          <div className="flex items-end">
            <button
              onClick={() => setCustomerModal(true)}
              className="flex items-center justify-center gap-2 global_button"
            >
              Add Customer
            </button>
          </div>
          {/* Date*/}
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
                className="global_input pl-10 w-full"
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
        {/* Product*/}
        <div className="col-span-4 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Product Name <span className="text-red-500"> *</span>
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
        {/* Add Product*/}
        <div className="col-span-4 lg:col-span-2 flex gap-2">
          {/* Barcode*/}
          <div className="flex items-end">
            <input
              value={barcode}
              onChange={(e) => {
                setBarcode(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // form submit block
                  fetchProductWithPosMachine(e.target.value); // call API
                }
              }}
              className="w-full global_input text-black dark:text-white h-fit"
              placeholder="Search Product With Barcode"
            />
          </div>
        </div>
      </div>

      {/* Selected Products Table */}
      <div className="global_sub_container mt-4 overflow-auto">
        <div className="flex justify-end items-center gap-2">
          <label htmlFor="disableSuggestion" className="text-sm font-medium">
            View Purchase Price{" "}
            {viewTotalPurchasePrice ? "Enabled" : "Disabled"}
          </label>

          <input
            id="disableSuggestion"
            type="checkbox"
            checked={viewTotalPurchasePrice}
            onChange={(e) => setViewTotalPurchasePrice(e.target.checked)}
            className="toggle toggle-lg bg-gray-200 border-gray-300 checked:bg-green-500 checked:border-green-500 focus:ring-4 focus:ring-green-200 focus:ring-opacity-50 focus:outline-none transition-all duration-300 ease-in-out cursor-pointer"
          />
        </div>
        {selectedProducts.length > 0 ? (
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Product Name</th>
                <th className="global_th">Qty</th>

                <th className="global_th">Sale Price</th>

                <th className="global_th">Total</th>
                <th className="global_th">Action</th>
                {viewTotalPurchasePrice && (
                  <>
                    <th className="global_th">Purchase Price</th>
                    <th className="global_th">Total Puchase</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="global_tbody">
              {selectedProducts.map((p, idx) => (
                <tr key={p._id + "-" + idx} className="global_tr">
                  <td className="global_td w-2 text-center">{idx + 1}</td>
                  {/* Name*/}
                  <td className="global_td w-[200px]">{p.label}</td>

                  {/* QTy*/}
                  <td className="global_td w-24">
                    <input
                      type="number"
                      disabled={p.qtySold}
                      value={p.qtySold === 0 ? "" : p.qtySold}
                      onChange={(e) =>
                        handleProductChange(idx, "qtySold", e.target.value)
                      }
                      className="global_input w-24"
                    />
                  </td>

                  {/* Sale Price o Unit cost hoye backend a jabe*/}
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.price === 0 ? "" : p.price}
                      onChange={(e) =>
                        handleProductChange(idx, "price", e.target.value)
                      }
                      className="global_input w-24"
                    />
                  </td>

                  {/*Total */}
                  <td className="global_td">{(p.total || 0).toFixed(2)}</td>
                  {/* Remove*/}
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
                  {viewTotalPurchasePrice && (
                    <>
                      {" "}
                      <td className="global_td">{p.unitCost}</td>
                      <td className="global_td">
                        {(p.unitCost * p.qtySold).toFixed(2)}
                      </td>
                    </>
                  )}
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

      {/* Summary + Note */}
      {selectedProducts.length > 0 && (
        <div className="global_sub_container mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Note*/}
            <div className="flex-1">
              <label className="block mb-2 font-medium">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="global_input min-h-[150px] w-full"
              />
            </div>
            {/* Summary*/}
            <div className="flex-1 space-y-3">
              {/* Total*/}
              <div className="flex justify-between">
                <label>Total:</label>
                <input
                  type="number"
                  value={totalAmount.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>

              {/* Discount %*/}
              <div className="flex justify-between">
                <label>Discount %:</label>
                <input
                  type="number"
                  value={discountPercent === 0 ? "" : discountPercent}
                  onChange={(e) => {
                    const percentValue =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    const newDiscountAmount =
                      (percentValue / 100) * totalAmount;
                    setDiscount(newDiscountAmount);
                    setDiscountPercent(percentValue);
                  }}
                  className="global_input w-40 rounded-sm text-right"
                  min="0"
                  max="100"
                />
              </div>
              {/* Discount*/}
              <div className="flex justify-between">
                <label>Discount Amount:</label>
                <input
                  type="number"
                  value={discount === 0 ? "" : discount}
                  onChange={(e) => {
                    const discountValue =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    const newDiscountPercent =
                      totalAmount > 0 ? (discountValue / totalAmount) * 100 : 0;

                    setDiscount(discountValue);
                    setDiscountPercent(
                      parseFloat(newDiscountPercent.toFixed(2))
                    );
                  }}
                  className="global_input w-40 rounded-sm text-right"
                  min="0"
                  max={totalAmount}
                />
              </div>
              {/* Cost*/}
              <div className="flex justify-between">
                <input
                  type="text"
                  value={otherCostName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOtherCostName(value);
                  }}
                  placeholder="Other Cost Name"
                  className="global_input w-40 rounded-sm text-start"
                />
                <input
                  type="number"
                  value={cost}
                  disabled={otherCostName === ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCost(value === "" ? "" : parseInt(value, 10));
                  }}
                  className={`global_input w-40 rounded-sm text-right ${
                    otherCostName === ""
                      ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>
              {/* Previous Due*/}
              {selectedCustomer && selectedCustomer.balance > 0 && (
                <div className="flex justify-between">
                  <label className="text-red-500 font-medium">
                    Previous Due:
                  </label>
                  <input
                    type="number"
                    value={selectedCustomer.balance.toFixed(2)}
                    disabled
                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500 font-medium"
                  />
                </div>
              )}
              {/* Grand Total*/}
              <div className="flex justify-between">
                <label>Grand Total:</label>
                <input
                  type="number"
                  value={grandTotal.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>

              {/* Paid Amount*/}
              <div className="flex justify-between">
                <label>Paid Amount:</label>
                <input
                  type="number"
                  value={paidAmount === 0 ? "" : paidAmount}
                  onChange={(e) => {
                    let val =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    if (val > grandTotal) val = grandTotal;
                    setPaidAmount(val);
                  }}
                  className="global_input w-40 rounded-sm text-right"
                />
              </div>
              {/* Due Amount*/}
              <div className="flex justify-between">
                <label>Due Amount:</label>
                <input
                  type="number"
                  value={dueAmount}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center lg:justify-end">
            <button
              onClick={handleSubmit}
              className="global_button w-full lg:w-fit"
            >
              Create Sale
            </button>
          </div>
        </div>
      )}

      <ProductAddModal
        handleAddProduct={handleAddProduct}
        onSuccess={fetchProducts}
      />

      <CreateCustomerModalImmediate
        open={customerModal}
        setOpen={setCustomerModal}
        setSelectedCustomer={setSelectedCustomer}
      />
    </div>
  );
};

export default CreatePurchase;
