import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";

const ExpenseType = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const [searchKeyWord, setSearchKeyword] = useState("");
  const formRef = useRef(null);
  // Fetch Brands
  const GetExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetExpenseTypes`, {
        headers: { token: getToken() },
      });
      setExpenseTypes(res.data.data || []);
    } catch (error) {
      ErrorToast("Failed to load Expenses");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    GetExpenseTypes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      if (editId) {
        const res = await axios.put(
          `${BaseURL}/UpdateExpenseTypes/${editId}`,
          form,
          {
            headers: { token: getToken() },
          }
        );
        if (res.data.status === "Success") {
          SuccessToast("Expenses updated successfully!");
          setForm({ name: "" });
          setEditId(null);
          GetExpenseTypes();
        } else {
          ErrorToast(res.data.message || "Failed to update Expenses");
        }
      } else {
        const res = await axios.post(`${BaseURL}/CreateExpenseTypes`, form, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Expenses created successfully!");
          setForm({ name: "" });
          GetExpenseTypes();
        } else {
          ErrorToast(res.data.message || "Failed to create expenses");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleEdit = (brand) => {
    setEditId(brand._id);
    setForm({ name: brand.name });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await axios.delete(
            `${BaseURL}/DeleteExpenseTypes/${id}`,
            {
              headers: { token: getToken() },
            }
          );
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            GetExpenseTypes();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Failed to delete brand");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  // ✅ Filter brands by search keyword
  const filteredBrands = expenseTypes.filter((expense) =>
    expense.name.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  return (
    <div ref={formRef} className="global_sub_container">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Expense Type Management
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-6 flex flex-col lg:flex-row lg:justify-between gap-4"
      >
        <div className="flex flex-col lg:flex-row justify-center lg:justify-start gap-5 w-full">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Expense Type Name"
            className="global_input h-fit
            "
            required
          />
          <div className="flex w-full lg:justify-start">
            {" "}
            <button
              type="submit"
              className={
                editId ? "global_edit" : "global_button w-full lg:w-fit"
              }
            >
              {editId ? "Update Expense Type" : "Add Expense Type"}
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search Expense Type"
          value={searchKeyWord}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="global_input h-fit w-full lg:w-lg
          "
        />
      </form>

      {/* Brand List */}
      <div className="space-y-2">
        {expenseTypes.map((expense) => (
          <div
            key={expense._id}
            className="border border-white/30 dark:border-gray-700/50
              px-5 py-1 text-sm rounded-xl
              flex justify-between items-center
              bg-white/40 dark:bg-gray-800/40
              backdrop-blur-md
              shadow-sm
              hover:shadow-md transition-shadow
            "
          >
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {expense.name}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(expense)}
                className="global_edit
                "
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(expense._id)}
                className="global_button_red
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Show message if no results */}
        {filteredBrands.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No Expense Type found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseType;
