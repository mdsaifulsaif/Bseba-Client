import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import categoryStore from "../../Zustand/CategoryStore";

const Category = () => {
  const { categories, setCategories } = categoryStore();
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const [searchKeyWord, setSearchKeyword] = useState("");
  const formRef = useRef(null);
  // Fetch Brands
  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetCategory`, {
        headers: { token: getToken() },
      });
      setCategories(res.data.data || []);
    } catch (error) {
      ErrorToast("Failed to load Categories");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      if (editId) {
        const res = await axios.post(
          `${BaseURL}/UpdateCategory/${editId}`,
          form,
          {
            headers: { token: getToken() },
          }
        );
        console.log(res.data.data);
        if (res.data.status === "Success") {
          SuccessToast("Category updated successfully!");
          setForm({ name: "" });
          setEditId(null);
          fetchCategories();
        } else {
          ErrorToast(res.data.message || "Failed to update category");
        }
      } else {
        const res = await axios.post(`${BaseURL}/CreateCategory`, form, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Category created successfully!");
          setForm({ name: "" });
          fetchCategories();
        } else {
          ErrorToast(res.data.message || "Failed to create category");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleEdit = (category) => {
    setEditId(category._id);
    setForm({ name: category.name });
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
          const response = await axios.get(`${BaseURL}/DeleteCategory/${id}`, {
            headers: { token: getToken() },
          });
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchCategories();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(
            error.response?.data?.message || "Failed to delete category"
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  // ✅ Filter brands by search keyword
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  return (
    <div ref={formRef} className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3"> Category Management</h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6 flex flex-col lg:flex-row justify-between  gap-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Category Name"
              className="global_input
            "
              required
            />
            <div className="flex lg:justify-start">
              {" "}
              <button
                type="submit"
                className={
                  editId ? "global_edit" : "global_button lg:w-fit w-full"
                }
              >
                {editId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search Category"
            value={searchKeyWord}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="global_input h-fit w-full lg:w-lg
          "
          />
        </form>
      </div>

      {/* Brand List */}
      <div className="global_sub_container space-y-3">
        {filteredCategories.map((category) => (
          <div
            key={category._id}
            className="global_list_item
            "
          >
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {category.name}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="global_edit
                "
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="global_button_red
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Show message if no results */}
        {filteredCategories.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No category found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Category;
