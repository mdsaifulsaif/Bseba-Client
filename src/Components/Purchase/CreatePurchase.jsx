import React, { useEffect, useRef, useState } from "react";
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
import CreateSupplierModalImmediate from "../Modals/CreateSupplierModalImmediate";
import toast from "react-hot-toast";
import { playWarningSound } from "../../Helper/utils";
import openCloseStore from "../../Zustand/OpenCloseStore";

const CreatePurchase = () => {
  const [supplierModal, setSupplierModal] = useState(false);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [searchSupplierKeyword, setSearchSupplierKeyword] = useState("");
  const { setGlobalLoader } = loadingStore();
  const [note, setNote] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());

  const [cost, setCost] = useState(0);
  const [barcode, setBarcode] = useState("");

  const { openModal } = openCloseStore();
  // Serial Modal
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [serialInputs, setSerialInputs] = useState([]); // dynamic array
  const inputRefs = useRef([]);

  // Summary
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const navigate = useNavigate();

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
          label: `${productData.name} (${productData.Brands.name}) (${productData.Categories.name})`,
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
  // Fetch suppliers
  const fetchSuppliers = async (keyword = 0) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/SuppliersList/1/20/${keyword}`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setSuppliers(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name} (${s.mobile})`,
            ...s,
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
            label: `${p.name} (${p.Brands.name}) (${p.Categories.name})`,
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

  // প্রতিবার input সংখ্যা বাড়লে, refs array adjust করো
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, serialInputs.length);
  }, [serialInputs]);

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
    if (!product) return;
    if (!selectedProducts.find((p) => p._id === product._id)) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          _id: product._id,
          label: product.label,
          name: product.name,
          qty: 1,
          unitCost: product.unitCost || 0,
          dp: product.price || 0,
          mrp: product.mrp || product.price || 0,
          warranty: product.warranty || 0,
          total: product.unitCost || 0,
          serialNos: product.serialNos || [],
          qtyDisable: false,
          salePrice: product.unitCost || 0,
        },
      ]);
    } else {
      ErrorToast("Product already added");
    }
  };

  // Update product field
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value === "" ? 0 : Number(value);
    updated[index].total =
      (updated[index].qty || 0) * (updated[index].unitCost || 0);
    setSelectedProducts(updated);
  };

  const totalAmount = selectedProducts.reduce(
    (acc, p) => acc + (p.total || 0),
    0
  );
  const grandTotal = totalAmount + (cost || 0) - (discount || 0);
  const dueAmount = Math.max(0, grandTotal - (paidAmount || 0));

  // Serial modal handlers
  const openSerialModal = (index) => {
    setCurrentProductIndex(index);
    const existing = selectedProducts[index].serialNos || [];
    setSerialInputs(existing.length > 0 ? [...existing] : [""]);
    setSerialModalOpen(true);
  };

  const addSerialInput = () => {
    const duplicates = checkDuplicates(serialInputs);
    if (duplicates.length > 0) {
      ErrorToast(`Duplicate serials: ${duplicates.join(", ")}`);
      return;
    }
    setSerialInputs((s) => [...s, ""]);
  };

  const removeSerialInput = (i) => {
    setSerialInputs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSerialChange = (index, value) => {
    const updated = [...serialInputs];
    updated[index] = value;
    setSerialInputs(updated);
  };
  const handleSerialKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const currentValue = serialInputs[index].trim();

      // 🔍 duplicate check
      const isDuplicate =
        currentValue &&
        serialInputs.some(
          (val, i) => i !== index && val.trim() === currentValue
        );

      if (isDuplicate) {
        // ❌ duplicate পাওয়া গেছে
        toast.error("Duplicated Serial");
        playWarningSound();
        // 🚫 current input খালি করে দাও
        setSerialInputs((prev) => {
          const updated = [...prev];
          updated[index] = ""; // clear current field
          return updated;
        });

        return; // stop here — পরের input এ যাবে না
      }

      // ✅ no duplicate — proceed
      const nextIndex = index + 1;
      if (nextIndex < serialInputs.length) {
        inputRefs.current[nextIndex]?.focus();
      } else {
        setSerialInputs((prev) => [...prev, ""]);
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 50);
      }
    }
  };

  const checkDuplicates = (serials) => {
    const trimmed = serials
      .map((s) => (s || "").trim())
      .filter((s) => s !== "");
    const duplicates = new Set();
    const seen = new Set();

    // within current inputs
    trimmed.forEach((s) => {
      if (seen.has(s)) duplicates.add(s);
      else seen.add(s);
    });

    // against other products
    selectedProducts.forEach((p, idx) => {
      if (idx === currentProductIndex) return;
      (p.serialNos || []).forEach((s) => {
        if (s && trimmed.includes(s)) duplicates.add(s);
      });
    });

    return Array.from(duplicates);
  };

  const saveSerialNos = () => {
    const serials = serialInputs
      .map((s) => (s || "").trim())
      .filter((s) => s !== "");
    const duplicates = checkDuplicates(serials);
    if (duplicates.length > 0) {
      ErrorToast(`Duplicate serials: ${duplicates.join(", ")}`);
      return;
    }
    const updatedProducts = [...selectedProducts];
    updatedProducts[currentProductIndex].serialNos = serials;
    updatedProducts[currentProductIndex].qty = serials.length;
    updatedProducts[currentProductIndex].total =
      serials.length * updatedProducts[currentProductIndex].unitCost;
    updatedProducts[currentProductIndex].qtyDisable = true;
    setSelectedProducts(updatedProducts);
    toast.success("Serial numbers saved");
    setSerialModalOpen(false);
  };

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedSupplier) return ErrorToast("Select a supplier");
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");

    const payload = {
      Purchase: {
        contactID: selectedSupplier.value,
        total: totalAmount,
        discount: discount || 0,
        grandTotal: grandTotal,
        paid: paidAmount,
        dueAmount: dueAmount,
        note: note,
        date: purchaseDate.toISOString(),
        cost: cost || 0,
      },
      PurchasesProduct: selectedProducts.map((p) => ({
        productID: p._id,
        qty: p.qty || 0,
        unitCost: p.unitCost || 0,
        dp: p.dp || 0,
        mrp: p.salePrice || 0,
        warranty: p.warranty || 0,
        total: p.total || 0,
        serialNos: p.serialNos || [],
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/CreatePurchases`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        console.log("after create prucech", res.data.purchaseID);
        SuccessToast("Purchase created successfully");
        setSelectedProducts([]);
        setSelectedSupplier(null);
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
      {/* Supplier & Product Selection */}
      <div className="global_sub_container grid grid-cols-8 gap-4">
        {/* Supplier*/}
        <div className="col-span-8 lg:col-span-4">
          <label className="block text-sm font-medium mb-1">
            Supplier Name <span className="text-red-500"> *</span>
          </label>
          <Select
            options={suppliers}
            value={selectedSupplier}
            onChange={setSelectedSupplier}
            placeholder="Select Supplier"
            classNamePrefix="react-select"
            onInputChange={(val) => setSearchSupplierKeyword(val)}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
        </div>
        {/* Add Supplier Button*/}
        <div className="flex items-end col-span-8 lg:col-span-1">
          <button
            onClick={() => setSupplierModal(true)}
            className="global_button text-sm py-1 w-full"
          >
            New Supplier
          </button>
        </div>
        {/*Purchase Date*/}
        <div className="col-span-8 lg:col-span-3">
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
        {/* Product*/}
        <div className="col-span-8 lg:col-span-4">
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
        <div className="flex items-end col-span-8 lg:col-span-1">
          <button
            className="global_button text-sm py-1 w-full"
            onClick={() => openModal("product")}
          >
            New Product
          </button>
        </div>

        {/* Barcode*/}
        <div className="flex items-end col-span-8 lg:col-span-3">
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

      {/* Selected Products Table */}
      <div className="global_sub_container mt-4 overflow-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">No</th>
              <th className="global_th">Product Name</th>
              <th className="global_th">Serial</th>
              <th className="global_th">Warranty</th>
              <th className="global_th">Qty</th>

              <th className="global_th">কেনা দাম</th>
              <th className="global_th">Sale Price</th>
              <th className="global_th">Margin</th>
              <th className="global_th">DP/RP</th>
              <th className="global_th">DP Margin</th>
              <th className="global_th">Total</th>
              <th className="global_th">Action</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {selectedProducts.map((p, idx) => (
              <tr key={p._id + "-" + idx} className="global_tr">
                <td className="global_td w-2 text-center">{idx + 1}</td>
                {/* Name*/}
                <td className="global_td">
                  <h1 className="min-w-[150px]">{p.label}</h1>
                </td>
                {/* Serial*/}
                <td className="global_td w-4 text-center">
                  <button
                    className="bg-green-100 dark:bg-green-500 dark:text-white text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-200 transition"
                    onClick={() => openSerialModal(idx)}
                  >
                    Add
                  </button>
                </td>
                {/* Warranty*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.warranty === 0 ? "" : p.warranty}
                    onChange={(e) =>
                      handleProductChange(idx, "warranty", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/* QTy*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    disabled={p.qtyDisable}
                    value={p.qty === 0 ? "" : p.qty}
                    onChange={(e) =>
                      handleProductChange(idx, "qty", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/* Unit Cost কেনা দাম*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.unitCost === 0 ? "" : p.unitCost}
                    onChange={(e) =>
                      handleProductChange(idx, "unitCost", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/* Sale Price o Unit cost hoye backend a jabe*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.slaePrice === 0 ? "" : p.salePrice}
                    onChange={(e) =>
                      handleProductChange(idx, "salePrice", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/* Margin*/}
                <td className="global_td w-24">
                  {(
                    ((p.salePrice - p.unitCost) / (p.unitCost || 1)) * 100 || 0
                  ).toFixed(2)}
                  %
                </td>
                {/* dP*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.dp === 0 ? "" : p.dp}
                    onChange={(e) =>
                      handleProductChange(idx, "dp", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/*DP Margin*/}
                <td className="global_td w-24">
                  {p.dp ? (((p.dp - p.unitCost) / p.dp) * 100).toFixed(2) : 0}%
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Purchase Summary + Note */}
      {selectedProducts.length > 0 && (
        <div className="global_sub_container mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Note*/}
            <div className="flex-1">
              <label className="block mb-2 font-medium text-gray-700">
                Note
              </label>
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
                <label>Cost:</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCost(value === "" ? "" : parseInt(value, 10));
                  }}
                  className="global_input w-40 rounded-sm text-right"
                />
              </div>
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
                  value={dueAmount.toFixed(2)}
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
              Create Purchase
            </button>
          </div>
        </div>
      )}

      {/* Serial Modal */}
      {serialModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Add Serial Numbers</h2>
              {/* Serial Inputs */}
              {serialInputs.map((s, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    value={s}
                    onChange={(e) => handleSerialChange(i, e.target.value)}
                    onKeyDown={(e) => handleSerialKeyDown(e, i)}
                    className="global_input flex-1"
                    placeholder={`Serial ${i + 1}`}
                  />
                  {serialInputs.length > 1 && (
                    <button
                      onClick={() => removeSerialInput(i)}
                      className="global_button_red"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {/* Add More Button */}
              <div className="flex items-center gap-2 mb-4">
                <button onClick={addSerialInput} className="global_button">
                  Add More
                </button>
              </div>
              {/* Cancel / Save Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSerialModalOpen(false);
                  }}
                  className="global_button_red"
                >
                  Cancel
                </button>
                <button onClick={saveSerialNos} className="global_button">
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ProductAddModal
        handleAddProduct={handleAddProduct}
        onSuccess={fetchProducts}
      />
      <CreateSupplierModalImmediate
        open={supplierModal}
        setOpen={setSupplierModal}
        setSelectedSupplier={setSelectedSupplier}
      />
    </div>
  );
};

export default CreatePurchase;
