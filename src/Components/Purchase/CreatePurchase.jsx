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
import openCloseStore from "../../Zustand/OpenCloseStore";
import ProductAddModal from "../Modals/ProductAddModal";
import CreateSupplierModal from "../Modals/CreateSupplierModal";

const CreatePurchase = () => {
  const { openModal, setSupplierModal } = openCloseStore();
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
  const [note, setNote] = useState("");
  const [lastEdited, setLastEdited] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [grandTotal, setGrandTotal] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);

  // Serial Modal
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [serialInputs, setSerialInputs] = useState([""]); // dynamic array

  const navigate = useNavigate();

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
    if (!product) return;
    const pid = product._id || product.value;
    const pname =
      product.name || product.label || product.productName || product.name;

    if (!selectedProducts.find((p) => p._id === pid)) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          _id: pid,
          name: pname,
          qty: 1,
          unitCost: product.unitCost || 0,
          dp: product.price || 0,
          mrp: product.mrp || product.price || 0,
          warranty: product.warranty || 0,
          total: product.unitCost || 0,
          serialNos: product.serialNos || [],
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

  // Derived values
  const totalAmount = selectedProducts.reduce(
    (acc, p) => acc + (p.total || 0),
    0
  );

  useEffect(() => {
    if (lastEdited === "percent") {
      if (discountPercent === 0) setDiscount(0);
      else
        setDiscount(Number(((totalAmount * discountPercent) / 100).toFixed(2)));
    }
  }, [discountPercent, totalAmount, lastEdited]);

  useEffect(() => {
    if (lastEdited === "discount") {
      if (discount === 0) setDiscountPercent(0);
      else if (totalAmount > 0)
        setDiscountPercent(Number(((discount / totalAmount) * 100).toFixed(2)));
    }
  }, [discount, totalAmount]);

  useEffect(() => {
    const newGrand = totalAmount - (discount || 0);
    setGrandTotal(newGrand);
    setDueAmount(Math.max(0, newGrand - (paidAmount || 0)));
  }, [totalAmount, discount, paidAmount]);

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

  const handleSerialChange = (i, value) => {
    const updated = [...serialInputs];
    updated[i] = value;
    setSerialInputs(updated);

    const duplicates = checkDuplicates(updated);
    if (duplicates.length > 0) {
      ErrorToast(`Duplicate serials: ${duplicates.join(", ")}`);
    }
  };

  const handleSerialKeyDown = (e, i) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = (serialInputs[i] || "").trim();
      if (val === "") return;
      const duplicates = checkDuplicates(serialInputs);
      if (duplicates.length > 0) {
        ErrorToast(`Duplicate serials: ${duplicates.join(", ")}`);
        return;
      }
      if (i === serialInputs.length - 1) addSerialInput();
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
    setSelectedProducts(updatedProducts);
    SuccessToast("Serial numbers saved");
    setSerialModalOpen(false);
    setSerialInputs([""]);
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
      },
      PurchasesProduct: selectedProducts.map((p) => ({
        productID: p._id,
        qty: p.qty || 0,
        unitCost: p.unitCost || 0,
        dp: p.dp || 0,
        mrp: p.mrp || 0,
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
    <div className="global_container">
      {/* Supplier & Product Selection */}
      <div className="global_sub_container grid grid-cols-4 gap-4">
        <div className="col-span-4 lg:col-span-2">
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

        <div className="col-span-4 lg:col-span-2 flex gap-2">
          <div className="flex items-end">
            <button
              onClick={() => setSupplierModal(true)}
              className="flex items-center justify-center gap-2 global_button"
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
        <div className="col-span-4 lg:col-span-2 flex gap-2">
          <div className="flex items-end">
            <button
              className="flex items-center justify-center gap-2 global_button"
              onClick={() => openModal("product")}
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Selected Products Table */}
      <div className="global_sub_container mt-4 overflow-auto">
        {selectedProducts.length > 0 ? (
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Product Name</th>
                <th className="global_th">Qty</th>
                <th className="global_th">Serial</th>
                <th className="global_th">Unit Cost</th>
                <th className="global_th">DP</th>
                <th className="global_th">MRP</th>
                <th className="global_th">Warranty</th>
                <th className="global_th">Total</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {selectedProducts.map((p, idx) => (
                <tr key={p._id + "-" + idx} className="global_tr">
                  <td className="global_td">{idx + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.qty === 0 ? "" : p.qty}
                      onChange={(e) =>
                        handleProductChange(idx, "qty", e.target.value)
                      }
                      className="global_input w-24"
                    />
                  </td>
                  <td className="global_td text-center">
                    <button
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-200 transition"
                      onClick={() => openSerialModal(idx)}
                    >
                      Add
                    </button>
                    {p.serialNos && p.serialNos.length > 0 && (
                      <div className="text-xs mt-1 text-gray-600">
                        {p.serialNos.length} saved
                      </div>
                    )}
                  </td>
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
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.mrp === 0 ? "" : p.mrp}
                      onChange={(e) =>
                        handleProductChange(idx, "mrp", e.target.value)
                      }
                      className="global_input w-24"
                    />
                  </td>
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
                  <td className="global_td">{(p.total || 0).toFixed(2)}</td>
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
        <div className="global_sub_container mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
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

            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <label>Total:</label>
                <input
                  type="number"
                  value={totalAmount.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm bg-gray-100 cursor-not-allowed text-right"
                />
              </div>
              <div className="flex justify-between">
                <label>Discount %:</label>
                <input
                  type="number"
                  value={discountPercent === 0 ? "" : discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    );
                    setLastEdited("percent");
                  }}
                  className="global_input w-40 rounded-sm text-right"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex justify-between">
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
                  className="global_input w-40 rounded-sm text-right"
                  min="0"
                  max={totalAmount}
                />
              </div>
              <div className="flex justify-between">
                <label>Grand Total:</label>
                <input
                  type="number"
                  value={grandTotal.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm bg-gray-100 cursor-not-allowed text-right"
                />
              </div>
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
              <div className="flex justify-between">
                <label>Due Amount:</label>
                <input
                  type="number"
                  value={dueAmount.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm bg-gray-100 cursor-not-allowed text-right"
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
                      className="bg-red-500 px-2 py-1 cursor-pointer text-white rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {/* Add More Button */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={addSerialInput}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-200 transition"
                >
                  Add More
                </button>
                <div className="text-xs text-gray-600">
                  Tip: Press Enter to add new serial.
                </div>
              </div>

              {/* Previously Saved Serials */}
              {currentProductIndex !== null &&
                selectedProducts[currentProductIndex] &&
                selectedProducts[currentProductIndex].serialNos &&
                selectedProducts[currentProductIndex].serialNos.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">
                      Previously saved:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts[currentProductIndex].serialNos.map(
                        (sn, i) => (
                          <div
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 rounded"
                          >
                            {sn}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Cancel / Save Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSerialModalOpen(false);
                    setSerialInputs([""]);
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

      <ProductAddModal onSuccess={fetchProducts} />
      <CreateSupplierModal onSuccess={fetchSuppliers} />
    </div>
  );
};

export default CreatePurchase;
