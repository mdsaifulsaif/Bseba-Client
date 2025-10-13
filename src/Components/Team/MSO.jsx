import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";

const MSO = () => {
  const formRef = useRef(null);
  const [MSO, setMSO] = useState([]);
  const [ASM, setASM] = useState([]);
  const [search, setSearch] = useState(""); // 🔍 search state
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    ASMID: "",
  });

  const [updateForm, setUpdateForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [editID, setEditID] = useState(null);
  const { setGlobalLoader } = loadingStore();

  // Fetch ASM
  const fetchASM = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetASM`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setASM(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch MSO
  const fetchMSO = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetMSO`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setMSO(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchASM(), fetchMSO()]);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editID) {
      setUpdateForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getASMByID = (id) =>
    ASM.find((asm) => asm._id === id) || { name: "N/A" };

  const handleEdit = (mso) => {
    setEditID(mso._id);
    setUpdateForm({ name: mso.name, password: "", confirmPassword: "" });
  };

  const handleCancelEdit = () => {
    setEditID(null);
    setUpdateForm({ name: "", password: "", confirmPassword: "" });
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
    if (!formData.ASMID) {
      ErrorToast("Please select an ASM");
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

  const handleAddMSO = async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/CreateUser`,
        { ...form, role: "MSO" },
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        SuccessToast("MSO created successfully");
        setForm({
          name: "",
          mobile: "",
          password: "",
          confirmPassword: "",
          ASMID: "",
        });
        fetchMSO();
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleUpdateMSO = async (e) => {
    e.preventDefault();
    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/updateUser/${editID}`,
        { name: updateForm.name, password: updateForm.password || undefined },
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        SuccessToast("MSO updated successfully");
        handleCancelEdit();
        fetchMSO();
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  // 🔍 Filter MSO list by search
  const filteredMSO = MSO.filter(
    (mso) =>
      mso.name.toLowerCase().includes(search.toLowerCase()) ||
      mso.mobile.includes(search)
  );

  return (
    <div className="global_container" ref={formRef}>
      {/* Add / Update Form */}
      {editID === null ? (
        <form
          className="global_sub_container grid grid-cols-4 gap-5"
          onSubmit={handleAddMSO}
        >
          <h1 className="col-span-4 mb-5">Add New MSO</h1>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="name">MSO Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="mobile">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="ASMID">Select ASM</label>
            <select
              name="ASMID"
              value={form.ASMID}
              onChange={handleChange}
              className="global_dropdown"
              required
            >
              <option value="">Select ASM</option>
              {ASM.map((opt) => (
                <option key={opt._id} value={opt._id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          <div className="flex items-end col-span-4 lg:col-span-1">
            <button type="submit" className="global_button w-full">
              ADD MSO
            </button>
          </div>
        </form>
      ) : (
        <form
          className="global_sub_container grid grid-cols-4 gap-5"
          onSubmit={handleUpdateMSO}
        >
          <h1 className="col-span-4 mb-5">Update MSO</h1>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="name">MSO Name</label>
            <input
              type="text"
              name="name"
              value={updateForm.name}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={updateForm.password}
              onChange={handleChange}
              className="global_input"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="flex flex-col gap-1 col-span-4 lg:col-span-1">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={updateForm.confirmPassword}
              onChange={handleChange}
              className="global_input"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex items-end justify-between lg:justify-start gap-4 col-span-4 lg:col-span-1">
            <button type="submit" className="global_edit">
              Update MSO
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

      {/* Search + Table */}
      <div className="global_sub_container w-full mt-8">
        <div className="flex flex-col lg:flex-row gap-2 justify-between mb-4">
          <h2 className="text-xl font-bold">MSO List</h2>
          <input
            type="text"
            placeholder="Search with name or mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="global_input w-fit h-fit"
          />
        </div>
        <div className="overflow-x-auto">
          {" "}
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">No</th>
                <th className="global_th">MSO Name</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">ASM</th>
                <th className="global_th">Status</th>
                <th className="global_th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMSO.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No MSO found
                  </td>
                </tr>
              ) : (
                filteredMSO.map((mso, i) => (
                  <tr key={mso._id}>
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{mso.name}</td>
                    <td className="global_td">{mso.mobile}</td>
                    <td className="global_td">{getASMByID(mso.ASMID).name}</td>
                    <td className="global_td">
                      {mso.active === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="global_td">
                      <button
                        onClick={() => handleEdit(mso)}
                        className="global_edit mr-2"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MSO;
