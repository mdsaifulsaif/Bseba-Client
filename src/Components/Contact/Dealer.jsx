import { FaWallet } from "react-icons/fa";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { Link } from "react-router-dom";

const Dealer = () => {
  const [dealers, setDealers] = useState([]);
  const [selectedMSO, setSelectedMSO] = useState("");
  const [selectedASM, setSelectedASM] = useState("");
  const [ASM, setASM] = useState([]);
  const [MSO, setMSO] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    proprietor: "",
    address: "",
    balance: 0,
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const formRef = useRef(null);
  const { setGlobalLoader } = loadingStore();

  useEffect(() => {
    setPage(1); // reset page
    fetchDealers();
  }, [search]);

  // Fetch MSO
  const fetchMSO = async () => {
    try {
      setGlobalLoader(true);

      const res = await axios.get(`${BaseURL}/GetMSO`, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        setMSO(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.log(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  // Fetch ASM
  const fetchASM = async () => {
    try {
      setGlobalLoader(true);

      const res = await axios.get(`${BaseURL}/GetASM`, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        setASM(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.log(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Dealers
  const fetchDealers = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(
        `${BaseURL}/DealerList/${page}/${limit}/${search || 0}`,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        setDealers(res.data.data);
        setTotal(res.data.total);
      } else {
        ErrorToast("Failed to fetch Dealers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchDealers(), fetchMSO(), fetchASM()]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    fetchDealers();
  }, [page, limit, search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);
    try {
      if (editId) {
        // UPDATE (no balance)
        const { name, email, mobile, proprietor, address } = form;
        const res = await axios.put(
          `${BaseURL}/UpdateDealer/${editId}`,
          { name, email, mobile, proprietor, address },
          { headers: { token: getToken() } }
        );
        if (res.data.status === "Success") {
          SuccessToast("Dealer updated successfully");
          resetForm();
          fetchDealers();
        } else {
          ErrorToast(res.data.message || "Failed to update Dealer");
        }
      } else {
        // CREATE (send balance as credit/debit)
        const payload = {
          name: form.name,
          email: form.email,
          proprietor: form.proprietor,
          mobile: form.mobile,
          address: form.address,

          ...(selectedASM
            ? { ASMID: selectedASM._id, RSMID: selectedASM.RSMID }
            : {}),
          ...(selectedMSO
            ? {
                ASMID: selectedMSO.ASMID,
                MSOID: selectedMSO._id,
                RSMID: selectedMSO.RSMID,
              }
            : {}),
        };

        if (parseFloat(form.balance) > 0) {
          payload.credit = parseFloat(form.balance);
        } else if (parseFloat(form.balance) < 0) {
          payload.debit = Math.abs(parseFloat(form.balance));
        }

        const res = await axios.post(`${BaseURL}/adDealer`, payload, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Dealer created successfully");
          resetForm();
          fetchDealers();
        } else {
          ErrorToast(res.data.message || "Failed to create Dealer");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      proprietor: "",
      mobile: "",
      address: "",
      balance: 0,
    });
    setEditId(null);
  };

  const handleEdit = (Dealer) => {
    setEditId(Dealer._id);
    setForm({
      name: Dealer.name,
      email: Dealer.email,
      mobile: Dealer.mobile || "",
      address: Dealer.address,
      balance: Dealer.balance, // Not editable, just to show if needed
    });

    // Scroll to form with smooth animation
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="global_container">
      {/* Form */}
      <div ref={formRef} className={`global_sub_container`}>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {editId ? "Update Dealer" : ""}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {editId ? "Update existing Dealer details" : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          {/* Name */}
          <div className="flex flex-col col-span-3 lg:col-span-1">
            <label
              htmlFor="name"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          {/* proprietor */}
          <div className="flex flex-col col-span-3 lg:col-span-1">
            <label
              htmlFor="proprietor"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Proprietor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="proprietor"
              value={form.proprietor}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          {/* Mobile */}
          <div className="flex flex-col col-span-3 lg:col-span-1">
            <label
              htmlFor="mobile"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* select MSO */}
          {!selectedASM && (
            <div className="mb-4 col-span-3 lg:col-span-1">
              <label className="text-sm font-medium mb-1 flex items-center">
                <FaWallet className="mr-2 text-green-600" /> Select MSO
              </label>
              <select
                value={selectedMSO ? selectedMSO._id : ""}
                onChange={(e) => {
                  const mso = MSO.find((m) => m._id === e.target.value);
                  setSelectedMSO(mso || "");
                }}
                className="global_dropdown w-full"
                required
              >
                <option value="">Select MSO</option>
                {MSO.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* select ASM */}
          {!selectedMSO && (
            <div className="mb-4 col-span-3 lg:col-span-1">
              <label className="text-sm font-medium mb-1 flex items-center">
                <FaWallet className="mr-2 text-green-600" /> Select ASM
              </label>
              <select
                value={selectedASM ? selectedASM._id : ""}
                onChange={(e) => {
                  const asm = ASM.find((m) => m._id === e.target.value);
                  setSelectedASM(asm || "");
                }}
                className="global_dropdown w-full"
              >
                <option value="">Select ASM</option>
                {ASM.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Address */}
          <div className="flex flex-col col-span-3 lg:col-span-1">
            <label
              htmlFor="address"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="flex justify-center lg:justify-start items-end p-5 col-span-3 lg:col-span-1">
            <button
              type="submit"
              className={
                editId ? "global_edit" : "global_button w-full lg:w-fit"
              }
            >
              {editId ? "Update Dealer" : "Create Dealer"}
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

      {/* Dealer List */}
      <div className="global_sub_container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Dealer List
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {dealers.length} of {total} Dealers
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search Dealer..."
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

        <div className="overflow-x-auto rounded-2xl">
          <table className="global_table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="global_tr">
                <th className="global_th">ID</th>
                <th className="global_th">Name</th>
                <th className="global_th">Proprietor</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">Address</th>
                <th className="global_th">Total Balance</th>
                <th className="global_th">Last Updated</th>
                <th className="global_th">Laser</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {dealers.length > 0 ? (
                dealers.map((c) => (
                  <tr key={c._id} className="global_tr">
                    <td className="global_td">{c.ID}</td>
                    <td className="global_td">{c.name}</td>
                    <td className="global_td">{c.proprietor}</td>
                    <td className="global_td">{c.mobile}</td>
                    <td className="global_td max-w-[150px] truncate">
                      {c.address}
                    </td>

                    <td
                      className={`global_td ${
                        c.totalBalance >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {c.totalBalance}
                    </td>
                    <td className="global_td">
                      {" "}
                      <TimeAgo date={c.updatedAt} />
                    </td>

                    <td className="global_td">
                      <Link
                        to={`/ViewDealerLaser/${c._id}`}
                        // onClick={() => {
                        //   handleEdit(c);
                        // }}
                        className="global_edit"
                      >
                        View Laser
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No Dealers found
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

export default Dealer;
