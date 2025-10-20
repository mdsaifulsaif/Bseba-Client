import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: "", logo: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const formRef = useRef(null);
  const [total, setTotal] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  // Image upload states
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [brandPage, setBrandPage] = useState(1);
  const [brandPerPage, setBrandPerPage] = useState(20);
  const [brandKeyWord, setBrandKeyWord] = useState("");
  // Fetch Brands
  const fetchBrands = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetBrands`, {
        headers: { token: getToken() },
      });

      setBrands(res.data.data || []);

      // setHasNextPage(res.data.pagination.hasNextPage);
      // setHasPrevPage(res.data.pagination.hasPrevPage);
      // setTotal(res.data.pagination.total);
      // setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      ErrorToast("Failed to load brands");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [brandKeyWord, brandPage, brandPerPage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      if (editId) {
        const res = await axios.post(`${BaseURL}/UpdateBrand/${editId}`, form, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Brand updated successfully!");
          clearForm();
          fetchBrands();
        } else {
          ErrorToast(res.data.message || "Failed to update Brand");
        }
      } else {
        const res = await axios.post(`${BaseURL}/CreateBrand`, form, {
          headers: { token: getToken() },
        });
        if (res.data.status === "Success") {
          SuccessToast("Brand created successfully!");
          clearForm();
          fetchBrands();
        } else {
          ErrorToast(res.data.message || "Failed to create Brand");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleEdit = (Brand) => {
    console.log(Brand);
    setEditId(Brand._id);
    setForm({ name: Brand.name, logo: Brand.logo || "" });

    // Clear file input when editing
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";

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
          const response = await axios.get(`${BaseURL}/DeleteBrand/${id}`, {
            headers: { token: getToken() },
          });
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchBrands();
            setBrandKeyWord("");
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Failed to delete Brand");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  // Clear form function
  const clearForm = () => {
    setForm({ name: "", logo: "" });
    setEditId(null);
  };

  // Handle search
  const handleSearch = (e) => {
    const keyword = e.target.value;
    setBrandKeyWord(keyword);
    setBrandPage(1);
  };

  return (
    <div ref={formRef} className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3"> Brand Management</h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col lg:flex-row justify-between gap-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Brand Name"
              className="global_input"
              required
            />

            <div className="flex lg:justify-start gap-2">
              <button
                type="submit"
                className={"global_button lg:w-fit w-full"}
                disabled={imageLoading}
              >
                {editId ? "Update Brand" : "Create Brand"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Brand List */}
      <div className="global_sub_container space-y-3">
        <div className="w-full flex justify-between ">
          <h2 className="text-xl font-semibold flex flex-col">
            Brand List{" "}
            <span className="text-sm">
              {brands.length} Showing of {total} Brands
            </span>
          </h2>
          <div className="flex lg:w-lg w-full gap-2">
            {" "}
            <input
              type="text"
              placeholder="Search products..."
              value={brandKeyWord}
              onChange={handleSearch}
              className="global_input"
            />
            <select
              value={brandPerPage}
              onChange={(e) => {
                setBrandPerPage(parseInt(e.target.value));
                setBrandPage(1);
              }}
              className="global_dropdown lg:w-fit h-fit"
            >
              {[20, 50, 100, 200].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {brands.map((Brand) => (
          <div
            key={Brand._id}
            className="global_list_item flex items-center justify-between"
          >
            <h2>{Brand.name}</h2>
            <div className="flex gap-2">
              <Link
                // to={`/EditBrand/${Brand._id}`}
                onClick={() => handleEdit(Brand)}
                className="global_edit"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(Brand._id)}
                className="global_button_red"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setBrandPage((p) => Math.max(p - 1, 1))}
              disabled={!hasPrevPage}
              className={`px-4 py-2 rounded-r-md rounded-l-full ${
                !hasPrevPage
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {brandPage} of {totalPages}
            </span>
            <button
              onClick={() => setBrandPage((p) => p + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-l-md rounded-r-full ${
                !hasNextPage
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Show message if no results */}
        {brands.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No Brand found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Brand;
