import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { useNavigate } from "react-router-dom";

const PostTransaction = () => {
  const { setGlobalLoader } = loadingStore();
  const [searchDealerKeyword, setSearchDealerKeyword] = useState("");
  // State
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState({
    CreatedDate: new Date(),
    trxID: "",
    note: "",
  });
  const [transactionList, setTransactionList] = useState([]);

  // Fetch Banks
  const fetchBanks = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetBank`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setBanks(
          res.data.data.map((b) => ({
            value: b._id,
            label: `${b.name} (${b.branch})`,
            ...b,
          }))
        );
      } else {
        ErrorToast("Failed to fetch banks");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching banks");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setCategories(
          res.data.data.map((c) => ({
            value: c._id,
            label: c.name,
            ...c,
          }))
        );
      } else {
        ErrorToast("Failed to fetch categories");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching categories");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Dealers
  const fetchDealers = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/Dealer/1/5/${searchDealerKeyword || 0}`,
        {
          headers: { token: getToken() },
        }
      );
      if (res.data.status === "Success") {
        setDealers(
          res.data.data.map((d) => ({
            value: d._id,
            label: `${d.name} (${d.mobile})`,
            ...d,
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

  useEffect(() => {
    fetchDealers();
  }, [searchDealerKeyword]);

  useEffect(() => {
    fetchBanks();
    fetchCategories();
    fetchDealers();
  }, []);

  // Add dealer + category to transaction list with direct values
  const handleAddTransactionWithValues = (dealer, category, bank) => {
    if (!dealer) return ErrorToast("Select a dealer");
    if (!category) return ErrorToast("Select a category");
    if (!bank) return ErrorToast("Select a bank first");

    // Prevent duplicate dealer + category
    const exists = transactionList.some(
      (t) => t._id === dealer._id && t.categoryId === category.value
    );
    if (exists) {
      return ErrorToast(`${dealer.name} with ${category.label} already added`);
    }

    const newTransaction = {
      ...dealer,
      categoryId: category.value,
      categoryName: category.label,
      Credit: 0,
      note: "",
    };

    setTransactionList((prev) => [...prev, newTransaction]);
    setSelectedDealer(null);
    setSelectedCategory(null);
  };

  // Remove transaction row
  const handleRemoveTransaction = (index) => {
    setTransactionList((prev) => prev.filter((_, i) => i !== index));
  };

  // Update transaction row (Credit or note)
  const handleTransactionChange = (index, field, value) => {
    const updated = [...transactionList];
    updated[index][field] = field === "Credit" ? Number(value) : value;
    setTransactionList(updated);
  };

  // Total amount
  const totalAmount = transactionList.reduce(
    (acc, t) => acc + (t.Credit || 0),
    0
  );

  // Submit transaction
  const handleSubmit = async () => {
    if (!selectedBank) return ErrorToast("Select a bank");
    if (!form.trxID.trim()) return ErrorToast("Transaction ID is required");
    if (transactionList.length === 0)
      return ErrorToast("Add at least one dealer");

    const zeroAmountDealers = transactionList.filter((t) => t.Credit <= 0);
    if (zeroAmountDealers.length > 0)
      return ErrorToast(
        `Please add amount for: ${zeroAmountDealers
          .map((t) => t.name)
          .join(", ")}`
      );

    const payload = {
      Transaction: {
        RSMID: transactionList[0]?.RSMID || "",
        ASMID: transactionList[0]?.ASMID || "",
        MSOID: transactionList[0]?.MSOID || "",
        bankID: selectedBank._id,
        total: totalAmount,
        trxID: form.trxID,
        note: form.note,
        CreatedDate: form.CreatedDate,
      },
      TransactionList: transactionList.map((t) => ({
        RSMID: t.RSMID,
        ASMID: t.ASMID,
        MSOID: t.MSOID,
        DealerID: t._id,
        CategoryID: t.categoryId,
        bankID: selectedBank._id,
        Debit: t.Credit,
        note: t.note,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await axios.post(`${BaseURL}/PostTransaction`, payload, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast("Transaction posted successfully");
        setTransactionList([]);
        setSelectedBank(null);
        setSelectedDealer(null);
        setSelectedCategory(null);
        setForm({ CreatedDate: new Date(), trxID: "", note: "" });
        navigate("/TransictionList");
      } else {
        ErrorToast(res.data.message || "Failed to post transaction");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bank */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bank <span className="text-red-500">*</span>
          </label>
          <Select
            options={banks}
            value={selectedBank}
            onChange={setSelectedBank}
            placeholder="Select Bank"
            isDisabled={transactionList.length > 0}
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.trxID}
            onChange={(e) => setForm({ ...form, trxID: e.target.value })}
            className="global_input w-full"
            disabled={!selectedBank}
            placeholder="Enter Transaction ID"
          />
        </div>

        {/* Dealer Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Dealer <span className="text-red-500">*</span>
          </label>
          <Select
            options={dealers}
            value={selectedDealer}
            onChange={setSelectedDealer}
            isDisabled={!selectedBank}
            placeholder="Select Dealer"
            getOptionLabel={(option) =>
              `${option.name} (${option.mobile}) - Balance: ${
                option.totalBalance || 0
              }`
            }
            onInputChange={(val) => setSearchDealerKeyword(val)}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            getOptionValue={(option) => option._id}
            classNamePrefix="react-select"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              if (val) {
                // Pass the selected values directly instead of relying on state
                handleAddTransactionWithValues(
                  selectedDealer,
                  val,
                  selectedBank
                );
              }
            }}
            isDisabled={!selectedDealer || !selectedBank}
            placeholder="Select Category"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="global_sub_container mt-4 overflow-auto">
        {transactionList.length > 0 ? (
          <table className="global_table w-full">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Dealer</th>
                <th className="global_th">Category</th>
                <th className="global_th">Amount</th>
                <th className="global_th">Money Receive No</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactionList.map((t, idx) => (
                <tr
                  className="global_tr"
                  key={`${t._id}-${t.categoryId}-${idx}`}
                >
                  <td className="global_td">{idx + 1}</td>
                  <td className="global_td">{t.name}</td>
                  <td className="global_td">{t.categoryName}</td>
                  <td className="global_td w-32">
                    <input
                      type="number"
                      min={0}
                      value={t.Credit === 0 ? "" : t.Credit}
                      onChange={(e) =>
                        handleTransactionChange(idx, "Credit", e.target.value)
                      }
                      className="global_input w-32"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="global_td w-40">
                    <input
                      type="text"
                      value={t.note}
                      onChange={(e) =>
                        handleTransactionChange(idx, "note", e.target.value)
                      }
                      className="global_input w-40"
                      placeholder="Money Receive No"
                    />
                  </td>
                  <td className="global_td">
                    <button
                      onClick={() => handleRemoveTransaction(idx)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="global_tr bg-gray-50 font-semibold">
                <td className="global_td" colSpan={3}>
                  Total Amount
                </td>
                <td className="global_td">{totalAmount.toFixed(2)}</td>
                <td className="global_td" colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No dealers selected
          </div>
        )}
      </div>

      {/* General Note */}
      <div className="global_sub_container mt-4">
        <label className="block mb-2 font-medium text-gray-700">
          General Note
        </label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="global_input w-full min-h-[120px]"
          placeholder="Enter general notes for the transaction"
        />
      </div>

      {/* Submit Button */}
      <div className="mt-4 w-full flex justify-end">
        <button
          onClick={handleSubmit}
          className="global_button lg:w-fit w-full"
        >
          Post Transaction
        </button>
      </div>
    </div>
  );
};

export default PostTransaction;
