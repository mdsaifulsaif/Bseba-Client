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

  // 🔹 Fetch All Expense Types
  const GetExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetExpenseTypes`, {
        headers: { token: getToken() },
      });
      setExpenseTypes(res.data.data || []);
    } catch (error) {
      ErrorToast("Failed to load Expenses");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    GetExpenseTypes();
  }, []);

  // 🔹 Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Create or Update Expense Type
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return ErrorToast("Name is required!");
    setGlobalLoader(true);

    try {
      let res;

      if (editId) {
        //  Update existing
        res = await axios.post(
          `${BaseURL}/UpdateExpenseTypes/${editId}`,
          { name: form.name },
          {
            headers: { token: getToken() },
          }
        );

        if (res.data.status === "Success") {
          SuccessToast("Expense Type updated successfully!");
          setEditId(null);
        } else {
          return ErrorToast(res.data.message || "Failed to update expense");
        }
      } else {
        //  Create new
        res = await axios.post(
          `${BaseURL}/CreateExpenseTypes`,
          { name: form.name },
          {
            headers: { token: getToken() },
          }
        );

        if (res.data.status === "Success") {
          SuccessToast("Expense Type created successfully!");
        } else {
          return ErrorToast(res.data.message || "Failed to create expense");
        }
      }

      // Reset form + reload
      setForm({ name: "" });
      await GetExpenseTypes();
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  // 🔹 Edit
  const handleEdit = (item) => {
    console.log(item._id);
    setEditId(item._id);
    setForm({ name: item.name });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setGlobalLoader(true);
        try {
          const response = await axios.delete(
            `${BaseURL}/DeleteExpenseTypes/${id}`,
            { headers: { token: getToken() } }
          );
          if (response.data.status === "Success") {
            SuccessToast("Deleted successfully!");
            GetExpenseTypes();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Delete failed");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  // 🔹 Filter
  const filteredExpenses = expenseTypes.filter((item) =>
    item.name.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  return (
    <div ref={formRef} className="global_sub_container">
      <h1 className="text-xl font-semibold mb-3">Expense Type Management</h1>

      {/* Form Section */}
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
            className="global_input"
            required
          />
          <button
            type="submit"
            className={editId ? "global_edit" : "global_button w-full lg:w-fit"}
          >
            {editId ? "Update Expense Type" : "Add Expense Type"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search Expense Type"
          value={searchKeyWord}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="global_input h-fit w-full lg:w-lg"
        />
      </form>

      {/* List Section */}
      <div className="space-y-2">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <div
              key={expense._id}
              className="border border-white/30 dark:border-gray-700/50
                px-5 py-2 text-sm rounded-xl flex justify-between items-center
                bg-white/40 dark:bg-gray-800/40 backdrop-blur-md
                shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {expense.name}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(expense)}
                  className="global_edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="global_button_red"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No Expense Type found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseType;
