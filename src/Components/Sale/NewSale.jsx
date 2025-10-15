import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";

import axios from "axios";
import Select from "react-select";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useNavigate } from "react-router-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";

const NewSale = () => {
  const { setGlobalLoader } = loadingStore();
  const { setDealerModal } = openCloseStore();
  // State
  const [dealers, setDealers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ CreatedDate: new Date(), note: "" });
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null); // ✅ Missing state
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  );
  const [searchDealerKeyword, setSearchDealerKeyword] = useState("");
  const [isCash, setIsCash] = useState(false);
  // extra state
  const [lastEdited, setLastEdited] = useState(null); // "discount" | "percent"
  const navigate = useNavigate();

  // Fetch dealers - এখানে full object রাখছি
  const fetchDealers = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/DealerList/1/20/${searchDealerKeyword || 0}`,
        {
          headers: { token: getToken() },
        }
      );
      if (res.data.status === "Success") {
        setDealers(
          res.data.data.map((d) => ({
            value: d._id,
            label: `${d.name} | ${d.proprietor} | ${d.ID}`, // ✅ combine all
            ...d,
            RSMID: d.RSMID || "",
            ASMID: d.ASMID || "",
            MSOID: d.MSOID || "",
            totalBalance: d.totalBalance || 0,
            CreatedDate: d.CreatedDate || d.createdAt,
          }))
        );
      } else {
        ErrorToast("Failed to fetch dealers");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching dealers");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setCategories(
          res.data.data.map((c) => ({ value: c._id, label: c.name }))
        );
      } else {
        ErrorToast("Failed to fetch categories");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch products by category
  const fetchProductsByCategory = async (categoryID) => {
    if (!categoryID) return;
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/GetProductByCategoryID/${categoryID}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setProducts(
          res.data.data.map((p) => ({
            value: p._id,
            label: p.name,
            ...p,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Failed to fetch products");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Handle product change in table
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];

    if (field === "qtySold") {
      // Validate stock quantity
      if (value > updated[index].stock) {
        ErrorToast(`Quantity cannot exceed stock (${updated[index].stock})`);
        return; // Don't update if exceeds stock
      }
      if (value < 0) {
        value = 0; // Don't allow negative values
      }
    }

    updated[index][field] = value;
    updated[index].total = updated[index].qtySold * updated[index].price;
    setSelectedProducts(updated);
  };

  // Remove product from selectedProducts
  const handleRemoveProduct = (indexToRemove) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== indexToRemove));
    // আর কোনো field reset করবো না
  };

  // ✅ Add product to table when selected
  const handleAddProduct = (product) => {
    if (!product) return;

    // Check if product already exists
    const exists = selectedProducts.some((p) => p._id === product._id);
    if (exists) {
      ErrorToast("Product already added");
      return;
    }

    const newProduct = {
      ...product,
      qtySold: 1, // default quantity
      price: product.price, // use selling price if available
      total: product.price, // initial total
    };

    setSelectedProducts((prev) => [...prev, newProduct]);
    setSelectedProductForStock(null); // clear selection
  };

  // Totals
  const totalAmount = selectedProducts.reduce((acc, p) => acc + p.total, 0);
  useEffect(() => {
    const keyword = searchDealerKeyword.trim() === "" ? 0 : searchDealerKeyword;
    fetchDealers(keyword);
  }, [searchDealerKeyword]);
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

  const grandTotal = totalAmount - discount;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Submit Sale - এখানে selectedDealer._id ব্যবহার করব
  const handleSubmit = async () => {
    if (!selectedDealer) return ErrorToast("Select a dealer");
    if (selectedProducts.length === 0) return ErrorToast("Select products");

    // Validate stock quantities before submitting
    const stockErrors = selectedProducts.filter((p) => p.qtySold > p.stock);
    if (stockErrors.length > 0) {
      ErrorToast(
        `Please fix stock quantities for: ${stockErrors
          .map((p) => p.name)
          .join(", ")}`
      );
      return;
    }

    // Validate that all products have quantity > 0
    const zeroQtyProducts = selectedProducts.filter((p) => p.qtySold === 0);
    if (zeroQtyProducts.length > 0) {
      ErrorToast(
        `Please add quantity for: ${zeroQtyProducts
          .map((p) => p.name)
          .join(", ")}`
      );
      return;
    }

    const payload = {
      Sale: {
        DealerID: selectedDealer._id, // এখানে _id ব্যবহার করছি
        ...(selectedCategory?.value && { CategoryID: selectedCategory.value }),
        ASMID: selectedDealer.ASMID, // এখন সব সময় include হবে
        RSMID: selectedDealer.RSMID, // এখন সব সময় include হবে
        ...(selectedDealer.MSOID ? { MSOID: selectedDealer.MSOID } : {}), // এখন সব সময় include হবে
        total: totalAmount,
        discount: discount,
        grandTotal: grandTotal,
        paid: paidAmount,
        dueAmount: dueAmount,
        CreatedDate: form.CreatedDate,
        PreviousBalance: 0,
        CurrentBalance: grandTotal - paidAmount,
        referenceNo: "",
        note: form.note,
        ...(isCash ? {} : { paymentDate: paymentDate }),
        ...(isCash ? { remark: "Cash" } : {}),
      },
      SaleProduct: selectedProducts.map((p) => ({
        productID: p._id,
        name: p.name,
        qtySold: p.qtySold,
        price: p.price,
        total: p.total,
        totalWeight: p.weight * p.qtySold,
        weight: p.weight,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreateSales`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setSelectedProducts([]);
        setSelectedDealer(null);
        setSelectedCategory(null);
        setDiscount(0);
        setDiscountPercent(0);
        setPaidAmount(0);
        setForm({ CreatedDate: new Date(), note: "" });
        setSelectedProductForStock(null);
        setProducts([]);
        navigate(`/SaleDetails/${res.data.saleID}`);
      } else {
        ErrorToast(res.data.data);
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDealers();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory.value);
    } else {
      setProducts([]);
      setSelectedProductForStock(null); // ✅ category clear হলে product ও clear
    }
  }, [selectedCategory]);

  // ✅ Dealer change হলে সব reset করা
  useEffect(() => {
    if (!selectedDealer) {
      setSelectedCategory(null);
      setSelectedProductForStock(null);
      setProducts([]);
    }
  }, [selectedDealer]);

  // ✅ Available products (excluding already selected ones)
  const availableProducts = products.filter(
    (product) =>
      !selectedProducts.some((selected) => selected._id === product._id)
  );

  return (
    <div className="global_container">
      <div className="global_sub_container grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dealer */}
        <div className="">
          <label className="block text-sm font-medium mb-1">Dealer *</label>
          <div className="flex gap-2">
            {" "}
            <Select
              options={dealers}
              value={selectedDealer}
              onChange={setSelectedDealer}
              onInputChange={(val) => setSearchDealerKeyword(val)}
              placeholder="Select Dealer"
              formatOptionLabel={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium">{option.name}</span>
                  <span className="text-sm">
                    {option.proprietor} ID:{option.ID}
                  </span>
                </div>
              )}
              classNamePrefix="react-select"
              className="w-3/4"
              isClearable={selectedProducts.length === 0} // ✅ table এ product থাকলে clear করা যাবে না
              isDisabled={selectedProducts.length > 0} // ✅ table এ product থাকলে change করা যাবে না
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
            <button
              onClick={() => {
                setDealerModal(true);
              }}
              className="global_button"
            >
              Add Dealer
            </button>
          </div>
        </div>
        {/* Date */}
        <div className="col-span-1 flex gap-5">
          <div className=" cols-span-1">
            <label className="block text-sm font-medium mb-1">
              Select Date
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={form.CreatedDate}
                onChange={(date) => setForm({ ...form, CreatedDate: date })}
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
          <ToggleSwitch label={"Cash"} onChange={setIsCash} value={isCash} />
          {!isCash && (
            <div className=" cols-span-1">
              <label className="block text-sm font-medium mb-1">
                Payment Date
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt />
                </div>
                <DatePicker
                  selected={paymentDate}
                  onChange={(date) => setPaymentDate(date)}
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
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={(category) => {
              setSelectedCategory(category);
              setSelectedProductForStock(null); // product selection clear
            }}
            placeholder="Select Category"
            classNamePrefix="react-select"
            isClearable={selectedProducts.length === 0} // ✅ product থাকলে clear করা যাবে না
            isDisabled={!selectedDealer || selectedProducts.length > 0} // ✅ dealer না থাকলে বা product থাকলে disabled
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        {/* Product */}
        <div className="cols-span-1">
          <label className="block text-sm font-medium mb-1">Product *</label>
          <Select
            options={availableProducts}
            value={selectedProductForStock}
            onChange={handleAddProduct} // ✅ Directly add to table
            placeholder="Select Product"
            classNamePrefix="react-select"
            isDisabled={
              !selectedCategory ||
              !selectedDealer ||
              availableProducts.length === 0
            }
            isClearable={false}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            getOptionLabel={(option) =>
              `${option.name} (Stock: ${option.stock || 0}) (${
                option.weight >= 1000
                  ? option.weight / 1000 + " KG"
                  : option.weight + " Gram"
              })`
            }
            getOptionValue={(option) => option._id}
          />
        </div>
      </div>

      {/* Selected Products Table */}
      <div className="global_sub_container mt-4 overflow-auto">
        {selectedProducts.length > 0 ? (
          <table className="global_table w-full">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Product Name</th>
                <th className="global_th">Stock</th>
                <th className="global_th">Qty</th>
                <th className="global_th">Weight</th>
                <th className="global_th">Sell Price</th>
                <th className="global_th">Total</th>
                <th className="global_th">Action</th>
                <th className="global_th">Special Price</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {selectedProducts.map((p, idx) => (
                <tr className="global_tr" key={`${p._id}-${idx}`}>
                  <td className="global_td">{idx + 1}</td>
                  <td className="global_td">
                    {p.name}{" "}
                    {p.weight && (
                      <span className="text-xs text-green-400">
                        (
                        {p.weight >= 1000
                          ? p.weight / 1000 + " KG"
                          : p.weight + " Gram"}
                        )
                      </span>
                    )}
                  </td>
                  <td className="global_td">{p.stock || 0}</td>
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.qtySold === 0 ? "" : p.qtySold}
                      onChange={(e) => {
                        const inputValue =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        handleProductChange(idx, "qtySold", inputValue);
                      }}
                      className={`global_input w-24 ${
                        p.qtySold > p.stock ? "border-red-500 bg-red-50" : ""
                      }`}
                      min="1"
                      max={p.stock}
                    />
                    {p.qtySold > p.stock && (
                      <div className="text-red-500 text-xs mt-1">
                        Exceeds stock ({p.stock})
                      </div>
                    )}
                  </td>
                  {/* Weight */}
                  <td className="global_td w-24">
                    {p.weight * p.qtySold >= 1000
                      ? (p.weight * p.qtySold) / 1000 + " KG"
                      : p.weight * p.qtySold + " Gram"}
                  </td>
                  <td className="global_td">
                    <input
                      type="number"
                      value={p.price === 0 ? "" : p.price}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "price",
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      className="global_input w-24"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="global_td">{p.total?.toFixed(2) || "0.00"}</td>
                  <td className="global_td">
                    <button
                      onClick={() => handleRemoveProduct(idx)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                  <td className="global_td">{p.sp?.toFixed(2) || "0.00"}</td>
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

      {/* Sale Summary */}
      {selectedProducts.length > 0 && (
        <div className="global_sub_container">
          <div className="flex flex-col lg:flex-row mt-4 gap-6">
            {/* Note */}
            <div className="flex-1">
              <label
                htmlFor="note"
                className="block mb-2 font-medium text-gray-700 dark:text-gray-300"
              >
                Note:
              </label>
              <textarea
                type="text"
                className="global_input min-h-[150px] w-full"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            {/* Summary */}
            <div className="flex-1 global_sub_container">
              <h1 className="text-center font-medium text-lg mb-4">
                Sale Summary
              </h1>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label>Total:</label>
                  <input
                    type="number"
                    value={totalAmount.toFixed(2)}
                    disabled
                    className="global_input rounded-sm w-40 text-right bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
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
                    className="global_input rounded-sm w-40 text-right bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 w-full flex justify-center lg:justify-end">
            <button
              onClick={handleSubmit}
              className="global_button lg:w-fit w-full"
            >
              Create Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSale;
