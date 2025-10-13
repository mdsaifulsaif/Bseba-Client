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

const AddStock = () => {
  const [products, setProducts] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");

  const { setGlobalLoader } = loadingStore();

  const [note, setNote] = useState("");

  const [purchaseDate, setPurchaseDate] = useState(new Date());

  const navigate = useNavigate();

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
    fetchProducts();
  }, []);

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
          qty: 1,

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

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");
    // ❌ Prevent submission if any product has qty <= 0
    const invalidQty = selectedProducts.filter((p) => !p.qty || p.qty <= 0);
    if (invalidQty.length > 0) {
      return ErrorToast(
        `Please enter quantity for: ${invalidQty.map((p) => p.name).join(", ")}`
      );
    }
    const payload = {
      Stock: {
        note: note,
      },
      StockProduct: selectedProducts.map((p) => ({
        productID: p._id,
        name: p.name,
        qty: p.qty || 0,

        price: p.price || 0, // ✅ Sell Price
        sp: p.sp || 0, // ✅ Special Price
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/AddStock`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast("Purchase created successfully");
        setSelectedProducts([]);

        navigate(`/AddStockDetails/${res.data.ID}`);
      } else if (res.data.status === "Failed") {
        ErrorToast(res.data.message);
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
      {/*  Product Selection */}

      <div className="flex w-full gap-2">
        <div className="w-full">
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
            getOptionLabel={(option) =>
              `${option.name} (Stock: ${option.stock || 0})`
            }
          />
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

      {/* Selected products table */}
      <div className="global_sub_container mt-4 overflow-auto">
        {selectedProducts.length > 0 ? (
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Product Name</th>
                <th className="global_th">Qty</th>

                <th className="global_th">Sell Price</th>
                <th className="global_th">Special Price</th>

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
                      min={1}
                      value={p.qty === 0 ? "" : p.qty}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "qty", // ✅ use qty consistently
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
          </div>
          <div className="mt-4 w-full flex justify-center lg:justify-end">
            <button
              onClick={handleSubmit}
              className="global_button w-full lg:w-fit"
            >
              Add Stock
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStock;
