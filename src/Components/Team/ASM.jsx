import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { Link } from "react-router-dom";

const ASM = () => {
  const [search, setSearch] = useState("");
  const formRef = useRef(null);
  const [ASM, setASM] = useState([]);
  const [RSM, setRSM] = useState([]);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    RSMID: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [editID, setEditID] = useState(null);
  const { setGlobalLoader } = loadingStore();

  // Fetch RSM
  const fetchRSM = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetRSM`, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        setRSM(res.data.data);
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

  useEffect(() => {
    fetchRSM();
    fetchASM();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editID) {
      setUpdateForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEdit = (asm) => {
    setEditID(asm._id);
    setUpdateForm({
      name: asm.name,
      password: "",
      confirmPassword: "",
    });
  };

  const handleCancelEdit = () => {
    setEditID(null);
    setUpdateForm({
      name: "",
      password: "",
      confirmPassword: "",
    });
  };

  const getRSMByID = (id) => {
    return RSM.find((rsm) => rsm._id === id) || { name: "N/A" };
  };

  const validateForm = (formData, isEdit = false) => {
    if (!formData.name || formData.name.length < 3) {
      ErrorToast("Name must be at least 3 characters long");
      return false;
    }

    if (!isEdit && (!formData.mobile || formData.mobile.length < 10)) {
      ErrorToast("Please enter a valid mobile number");
      return false;
    }

    if (!isEdit && !formData.RSMID) {
      ErrorToast("Please select an RSM");
      return false;
    }

    if (formData.password && formData.password.length < 5) {
      ErrorToast("Password must be at least 5 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      ErrorToast("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleAddASM = async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/createUser`,
        {
          name: form.name,
          mobile: form.mobile,
          password: form.password,
          RSMID: form.RSMID,
          role: "ASM",
        },
        {
          headers: {
            token: getToken(),
          },
        }
      );

      if (res.data.status === "Success") {
        SuccessToast("ASM created successfully");
        setForm({
          name: "",
          mobile: "",
          password: "",
          confirmPassword: "",
          RSMID: "",
        });
        fetchASM();
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

  const handleUpdateASM = async (e) => {
    e.preventDefault();

    if (!validateForm(updateForm, true)) return;

    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/updateUser/${editID}`,
        {
          name: updateForm.name,
          password: updateForm.password || undefined,
        },
        {
          headers: {
            token: getToken(),
          },
        }
      );

      if (res.data.status === "Success") {
        SuccessToast("ASM updated successfully");
        handleCancelEdit();
        fetchASM();
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

  // Fixed search implementation - filtering the ASM state array
  const filteredASMList = ASM.filter(
    (asm) =>
      asm.name.toLowerCase().includes(search.toLowerCase()) ||
      asm.mobile.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="global_container" ref={formRef}>
      {editID === null && (
        <form
          className="global_sub_container grid grid-cols-4 gap-5"
          onSubmit={handleAddASM}
        >
          <h1 className="col-span-4 mb-5">Add New ASM</h1>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              ASM Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              required
              minLength="3"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label
              htmlFor="mobile"
              className="text-gray-700 dark:text-gray-300"
            >
              Mobile
            </label>
            <input
              type="text"
              name="mobile"
              id="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
              minLength="10"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="RSMID" className="text-gray-700 dark:text-gray-300">
              Select RSM
            </label>
            <select
              name="RSMID"
              value={form.RSMID}
              onChange={handleChange}
              className="global_dropdown"
              required
            >
              <option value="">Select RSM</option>
              {RSM.map((opt) => (
                <option key={opt._id} value={opt._id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className="global_input"
              required
              minLength="5"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label
              htmlFor="confirmPassword"
              className="text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="global_input"
              required
              minLength="5"
            />
          </div>
          <div className="flex items-end col-span-4 lg:col-span-1">
            <button type="submit" className="global_button text-center w-sm">
              ADD ASM
            </button>
          </div>
        </form>
      )}

      {editID && (
        <form
          className="global_sub_container grid grid-cols-4 gap-5"
          onSubmit={handleUpdateASM}
        >
          <h1 className="col-span-4 mb-5">Update ASM</h1>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              ASM Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={updateForm.name}
              onChange={handleChange}
              className="global_input"
              required
              minLength="3"
            />
          </div>

          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={updateForm.password}
              onChange={handleChange}
              className="global_input"
              minLength="5"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label
              htmlFor="confirmPassword"
              className="text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={updateForm.confirmPassword}
              onChange={handleChange}
              className="global_input"
              minLength="5"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex items-end justify-between lg:justify-start gap-4 col-span-4 lg:col-span-1">
            <button type="submit" className="global_edit">
              Update ASM
            </button>
            <button
              type="button"
              className="global_button_red"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="global_sub_container w-full mt-8 overflow-auto">
        <div className="flex justify-between flex-col lg:flex-row mb-4 gap-2">
          <h2 className="text-xl font-bold">Associated ASMs</h2>
          <input
            type="text"
            placeholder="Search ASM"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="global_input w-fit h-fit"
          />
        </div>
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">No</th>
              <th className="global_th">ASM Name</th>
              <th className="global_th">Mobile</th>
              <th className="global_th">RSM</th>
              <th className="global_th">Status</th>
              <th className="global_th">Actions</th>
              <th className="global_th">MSO List</th>
            </tr>
          </thead>
          <tbody>
            {filteredASMList.length > 0 ? (
              filteredASMList.map((asm, i) => {
                return (
                  <tr key={asm._id}>
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{asm.name}</td>
                    <td className="global_td">{asm.mobile}</td>
                    <td className="global_td">{getRSMByID(asm.RSMID).name}</td>
                    <td className="global_td">
                      {asm.active === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="global_td">
                      <button
                        onClick={() => handleEdit(asm)}
                        className="global_edit mr-2"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/ViewMSO/${asm._id}`}
                        className="global_button"
                      >
                        View MSO
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="global_td text-center">
                  No ASMs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ASM;
