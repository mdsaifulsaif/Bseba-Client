import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";
import { TbCurrencyTaka } from "react-icons/tb";
import bankStore from "../../Zustand/BankStore";

const BankAccount = () => {
  const [search, setSearch] = useState("");
  const { banks, setBanks } = bankStore();
  // const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ name: "", branch: "", AccountNumber: "" });
  const { setGlobalLoader } = loadingStore();

  // Fixed search implementation - filtering the RSM state array
  const filteredBankList = banks.filter((bank) =>
    [bank.name, bank.AccountNumber, bank.branch]
      .filter(Boolean) // null/undefined safe রাখবে
      .some((field) =>
        field.toString().toLowerCase().includes(search.toLowerCase())
      )
  );

  // Fetch Accounts
  const fetchAccounts = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetBank`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setBanks(res.data.data);
      } else {
        ErrorToast(res.data.message || "Something Wrong");
      }
    } catch (error) {
      ErrorToast("Failed to load accounts");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "AccountNumber") {
      if (/^\d*$/.test(value)) {
        // শুধু digit allow করবে
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Save Account (Create/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      // Create Mode
      await axios.post(`${BaseURL}/createBank`, form, {
        headers: { token: getToken() },
      });
      SuccessToast("Account created successfully!");

      resetForm();
      fetchAccounts();
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to save account");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({ name: "", AccountNumber: "", branch: "" });
  };

  return (
    <div className="global_container">
      <div className="">
        {/* Form Section */}
        <div className="global_sub_container">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Create New Account
          </h2>

          <form onSubmit={handleSubmit} className="global_container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Chase Savings"
                  className="global_input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number
                </label>

                <input
                  type="number"
                  name="AccountNumber"
                  value={form.AccountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                  className="global_input"
                  required
                />
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch
              </label>
              <div className="flex flex-col lg:flex-row gap-5 items-center">
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="Branch Name"
                  className="global_input"
                />
                <div className="flex gap-3 w-full">
                  <button type="submit" className="global_button w-full">
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Accounts List */}
        <div className="global_sub_container overflow-auto">
          <div className="flex flex-col lg:flex-row mb-2 gap-3 lg:justify-between">
            {" "}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex gap-4 items-center">
              Bank List
              <span className="text-sm text-gray-500 dark:text-gray-400 ">
                {banks.length} {banks.length === 1 ? "Account" : "Accounts"}
              </span>
            </h2>
            <input
              type="text"
              name=""
              id=""
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Bank"
              className="global_input w-full lg:w-sm h-fit"
            />
          </div>

          {banks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No bank accounts found. Create your first account above.
            </div>
          ) : (
            <div className="overflow-auto">
              {" "}
              <table className="global_table ">
                <thead className="global_thead">
                  <tr className="global_tr">
                    <th className="global_th">Account Name</th>
                    <th className="global_th">Account Number</th>

                    <th className="global_th">Branch</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {filteredBankList.map((account) => (
                    <tr key={account.id} className="global_tr">
                      <td className="global_td">
                        <div className="text-sm uppercase font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </div>
                      </td>
                      <td className="global_td">
                        <div className="text-sm text-gray-900 dark:text-gray-200">
                          {account.AccountNumber}
                        </div>
                      </td>

                      <td className="global_td">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {account.branch}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccount;
