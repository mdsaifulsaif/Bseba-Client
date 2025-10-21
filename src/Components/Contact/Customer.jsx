import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import axios from "axios";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { Link } from "react-router-dom";

const Customer = () => {
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const formRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    address: "",
    customer: "",
    contactType: "Customer",
  });

  // Previous transaction, default "পাবে"
  const [transactionType, setTransactionType] = useState("পাবে");
  const [transactionAmount, setTransactionAmount] = useState("");

  const { setGlobalLoader } = loadingStore();

  // Fetch Customers
  const fetchCustomers = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/CustomersList/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setCustomers(res.data.data);
        setTotal(res.data.total);
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

  useEffect(() => {
    setPage(1);
    fetchCustomers();
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit]);

  // const handleEdit = (customer) => {
  //   setEditId(customer._id);
  //   setBalance(customer.balance || 0);
  //   setForm({
  //     email: customer.email || "",
  //     mobile: customer.mobile || "",
  //     address: customer.address || "",
  //     customer: customer.name || "",
  //     contactType: customer.type || "Customer",
  //   });

  //   // Previous transaction on edit, default "পাবে" if none
  //   setTransactionType(customer.previousTransaction?.type || "পাবে");
  //   setTransactionAmount(customer.previousTransaction?.amount || "");

  //   if (formRef.current) {
  //     formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // };

  const resetForm = () => {
    setForm({
      email: "",
      mobile: "",
      address: "",
      customer: "",
      contactType: "Customer",
    });
    setEditId(null);
    setTransactionType("পাবে"); // default reset
    setTransactionAmount("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);
    try {
      const payload = {
        name: form.customer,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        type: form.contactType,
        previousTransaction: {
          type: transactionType,
          amount: transactionAmount,
        },
      };

      if (editId) {
        const res = await axios.put(
          `${BaseURL}/UpdateContactById/${editId}`,
          payload,
          { headers: { token: getToken() } }
        );
        if (res.data.status === "Success") {
          SuccessToast("Customer updated successfully");
          resetForm();
          setPage(1);
          fetchCustomers();
        } else {
          ErrorToast(res.data.message || "Failed to update Customer");
        }
      } else {
        const res = await axios.post(`${BaseURL}/CreateContact`, payload, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Customer created successfully");
          resetForm();
          setPage(1);
          fetchCustomers();
        } else {
          ErrorToast(res.data.message || "Failed to create Customer");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      {/* Form */}
      <div ref={formRef} className={`global_sub_container`}>
        <div className="mb-4">
          <h1 className="text-xl font-semibold mb-3">Add New Customer</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-8 gap-4">
          {/* Customer Name */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customer"
              value={form.customer}
              onChange={handleChange}
              className="global_input"
              placeholder="Customer Name"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              placeholder="Mobile Number"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="global_input"
              placeholder="Email"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              placeholder="Address"
              required
            />
          </div>

          {/* Contact Type */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            <label
              htmlFor="contactType"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contact Type <span className="text-red-500">*</span>
            </label>
            <select
              name="contactType"
              value={form.contactType}
              onChange={handleChange}
              required
              className="global_input appearance-none bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Both">Both (Customer & Supplier)</option>
            </select>
          </div>

          {/* Previous Transaction */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              পূর্বের লেনদেন যদি থাকে
            </label>
            <div className="flex gap-2">
              <select
                value={transactionType}
                onChange={(e) => {
                  setTransactionType(e.target.value);
                  setTransactionAmount(""); // reset amount on type change
                }}
                className="global_input"
              >
                <option value="পাবে">পাবে</option>
                <option value="দেবে">দেবে</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col col-span-8 lg:col-span-2">
            {transactionType && (
              <>
                <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </label>
                <input
                  type="text"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder={
                    transactionType === "দেবে"
                      ? "আমার কাছে পাবে"
                      : "পাবে আমার কাছে"
                  }
                  className="global_input"
                />
              </>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex justify-center lg:justify-start items-end col-span-8 lg:col-span-2">
            <button
              type="submit"
              className={
                editId ? "global_edit" : "global_button w-full lg:w-fit"
              }
            >
              {editId ? "Update Customer" : "Create Customer"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="global_button_red"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Customer list */}
      {/* Customer list */}
      <div className="global_sub_container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Customers List
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {customers.length} of {total} Customers
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search Customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="global_input"
            />

            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="global_dropdown"
            >
              {[20, 50, 100, 500].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Name</th>
                <th className="global_th">Balance</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">Address</th>
                <th className="global_th">Edit</th>
                <th className="global_th">Laser</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {customers?.length > 0 ? (
                customers.map((c, i) => (
                  <tr key={c._id} className="global_tr">
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{c.name}</td>
                    <td className="global_td">{c.balance}</td>
                    <td className="global_td">{c.mobile}</td>
                    <td className="global_td max-w-[150px] truncate">
                      {c.address}
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/EditContact/${c._id}`}
                        className="global_edit"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/ViewSupplierLaser/${c._id}`}
                        className="global_button"
                      >
                        View Laser
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="global_tr">
                  <td colSpan="7" className="global_td text-center">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-r-md rounded-l-full ${
                page === 1
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className={`px-4 py-2 rounded-l-md rounded-r-full ${
                page >= Math.ceil(total / limit)
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customer;
