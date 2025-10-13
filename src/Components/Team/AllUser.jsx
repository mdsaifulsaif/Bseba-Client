import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { FiLock, FiUnlock } from "react-icons/fi";

const AllUser = () => {
  const [role, setRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedRoleType, setSelectedRoleType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "",
    parentId: "",
  });
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const formRef = useRef(null);
  const { setGlobalLoader } = loadingStore();

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.mobile.includes(searchLower)
    );
  });

  const fetchAllRole = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetRole`, {
        headers: { token: getToken() },
      });

      // যদি response সরাসরি array হয়
      if (Array.isArray(res.data)) {
        setRole(res.data);
      } else if (res.data.status === "success") {
        setRole(res.data.data || []);
      } else {
        ErrorToast(res.data.message || "Failed to fetch roles");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch roles"
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/userList`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") setAllUsers(res.data.data);
      else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleActivation = async (userId, status) => {
    try {
      setGlobalLoader(true);
      const res = await axios.post(
        `${BaseURL}/updateUser/${userId}`,
        { active: status },
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        SuccessToast(
          `User ${status === 1 ? "activated" : "deactivated"} successfully`
        );
        fetchAllUsers();
      } else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to update user status"
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      mobile: user.mobile,
      password: "",
      confirmPassword: "",
      role: user.role,
      parentId:
        user.role === "ASM"
          ? user.RSMID || ""
          : user.role === "MSO"
          ? user.ASMID || ""
          : "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (formRef.current)
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return ErrorToast("Name is required!");
    if (!editForm.mobile.trim()) return ErrorToast("Mobile is required!");
    if (editForm.password) {
      if (!editForm.confirmPassword.trim())
        return ErrorToast("Confirm Password is required!");
      if (editForm.password !== editForm.confirmPassword)
        return ErrorToast("Passwords do not match!");
      if (editForm.password.length < 5)
        return ErrorToast("Password must be at least 5 characters!");
    }
    if (
      (editForm.role === "ASM" || editForm.role === "MSO") &&
      !editForm.parentId
    ) {
      return ErrorToast(
        `Please select ${editForm.role === "ASM" ? "RSM" : "ASM"}!`
      );
    }

    setGlobalLoader(true);
    try {
      const requestBody = { name: editForm.name, mobile: editForm.mobile };
      if (editForm.password) requestBody.password = editForm.password;
      if (editForm.role === "ASM") requestBody.RSMID = editForm.parentId;
      if (editForm.role === "MSO") requestBody.ASMID = editForm.parentId;

      const res = await axios.post(
        `${BaseURL}/updateUser/${editingUser._id}`,
        requestBody,
        { headers: { token: getToken() } }
      );
      if (res.data.status === "Success") {
        SuccessToast("User updated successfully");
        setEditingUser(null);
        setEditForm({
          name: "",
          mobile: "",
          password: "",
          confirmPassword: "",
          role: "",
          parentId: "",
        });
        await Promise.all([fetchRSM(), fetchASM(), fetchAllUsers()]);
      } else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to update user");
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      name: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      role: "",
      parentId: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return ErrorToast("Name is required!");
    if (!form.mobile.trim()) return ErrorToast("Mobile is required!");
    if (!form.password.trim()) return ErrorToast("Password is required!");
    if (!form.confirmPassword.trim())
      return ErrorToast("Confirm Password is required!");
    if (form.password !== form.confirmPassword)
      return ErrorToast("Passwords do not match!");

    setGlobalLoader(true);
    try {
      const requestBody = {
        mobile: form.mobile,

        name: form.name,
        password: form.password,
      };

      const res = await axios.post(`${BaseURL}/createUser`, requestBody, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        SuccessToast(`${selectedRoleType} created successfully`);
        setForm({ name: "", mobile: "", password: "", confirmPassword: "" });
        setSelectedRoleType("");

        await Promise.all([fetchAllUsers()]);
      } else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to create user");
    } finally {
      setGlobalLoader(false);
    }
  };
  const handleRoleSelection = (userId, roleId) => {
    const roleObj = role.find((r) => r._id === roleId); // role object খুঁজে বের করা
    setSelectedRole((prev) => ({
      ...prev,
      [userId]: roleObj || null,
    }));
  };

  const updateUserRole = async (userID) => {
    if (!selectedRole[userID]) {
      ErrorToast("Please select a role first");
      return;
    }
    setGlobalLoader(true);
    try {
      const payload = {
        UserID: userID,
        RoleID: selectedRole[userID]._id,
        role: selectedRole[userID].name,
      };

      const res = await axios.post(`${BaseURL}/AddRole`, payload, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        SuccessToast(res.data.message || "Role Assigned Successfull");
        fetchAllUsers();
        setSelectedRole((prev) => {
          const newState = { ...prev };
          delete newState[userID];
          return newState;
        });
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to update role");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const fetchData = async () =>
      await Promise.all([fetchAllUsers(), fetchAllRole()]);
    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="global_container" ref={formRef}>
      {/* Create User Form */}
      {!editingUser && (
        <form
          onSubmit={handleCreateUser}
          className="global_sub_container grid grid-cols-12 gap-5"
        >
          <div className="flex flex-col gap-1 col-span-12  lg:col-span-3">
            <label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              required
              minLength="2"
            />
          </div>

          <div className="flex flex-col gap-1 col-span-12  lg:col-span-3">
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
              minLength="11"
              maxLength="11"
            />
          </div>

          <div className="flex flex-col gap-1 col-span-12  lg:col-span-2">
            <label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                className="global_input pr-10"
                required
                minLength="5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <FiUnlock size={18} /> : <FiLock size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 col-span-12  lg:col-span-2">
            <label
              htmlFor="confirmPassword"
              className="text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="global_input pr-10"
                required
                minLength="5"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <FiUnlock size={18} />
                ) : (
                  <FiLock size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="col-span-12  lg:col-span-2 flex justify-center items-end">
            <button type="submit" className="global_button text-center w-sm">
              ADD {selectedRoleType || "USER"}
            </button>
          </div>
        </form>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="global_sub_container">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Edit User: {editingUser.name}
          </h2>
          <form onSubmit={handleUpdateUser} className="grid grid-cols-12 gap-2">
            <div className="flex flex-col gap-1 col-span-12 lg:col-span-3">
              <label
                htmlFor="editName"
                className="text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="editName"
                value={editForm.name}
                onChange={handleEditChange}
                className="global_input"
                required
                minLength="2"
              />
            </div>

            <div className="flex flex-col gap-1 col-span-12 lg:col-span-3">
              <label
                htmlFor="editMobile"
                className="text-gray-700 dark:text-gray-300"
              >
                Mobile
              </label>
              <input
                type="text"
                name="mobile"
                id="editMobile"
                value={editForm.mobile}
                onChange={handleEditChange}
                className="global_input"
                required
                minLength="11"
                maxLength="11"
              />
            </div>

            <div className="flex flex-col gap-1 col-span-12 lg:col-span-2">
              <label
                htmlFor="editPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="editPassword"
                  placeholder="Optional"
                  value={editForm.password}
                  onChange={handleEditChange}
                  className="global_input pr-10"
                  minLength="5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <FiUnlock size={18} /> : <FiLock size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 col-span-12 lg:col-span-2">
              <label
                htmlFor="editConfirmPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="editConfirmPassword"
                  value={editForm.confirmPassword}
                  onChange={handleEditChange}
                  className="global_input pr-10"
                  minLength="5"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FiUnlock size={18} />
                  ) : (
                    <FiLock size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3 flex justify-between lg:justify-start mt-5 items-end gap-1">
              <button type="submit" className="global_edit px-2">
                Update
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="global_button_red"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="global_sub_container overflow-x-auto">
        <div className="flex flex-col lg:flex-row gap-2 justify-between mb-4">
          <h2 className="text-xl font-bold">User List</h2>
          <input
            type="text"
            placeholder="Search with name or mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="global_input w-fit h-fit"
          />
        </div>
        <table className="global_table">
          <thead className="global_thead">
            <th className="global_th">Name</th>
            <th className="global_th">Mobile</th>
            <th className="global_th">Role</th>
            <th className="global_th">Status</th>
            <th className="global_th">Actions</th>
            <th className="global_th">Role Manage</th>
          </thead>
          <tbody className="global_tbody">
            {filteredUsers
              .slice() // make a copy so we don’t mutate state
              .sort((a, b) => b.admin - a.admin)
              .map((user) => (
                <tr key={user._id} className="global_tr">
                  <td className="global_td">{user.name}</td>
                  <td className="global_td">{user.mobile}</td>
                  <td className="global_td">
                    {user.admin === 1 ? "Admin" : user.role || "No Role"}
                  </td>
                  <td className="global_td">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.active === 1
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {user.active === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="global_td w-[150px]">
                    <div className="flex gap-2">
                      {user.admin !== 1 && (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="global_edit text-xs"
                          >
                            edit
                          </button>
                          {user.active === 1 ? (
                            <button
                              onClick={() => handleActivation(user._id, 0)}
                              className="global_button_red text-xs"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivation(user._id, 1)}
                              className="global_button text-xs"
                            >
                              Activate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="global_td">
                    {!["ASM", "MSO", "RSM"].includes(user.role) &&
                      user.admin !== 1 && (
                        <>
                          <select
                            value={selectedRole[user._id]?._id || ""}
                            onChange={(e) =>
                              handleRoleSelection(user._id, e.target.value)
                            }
                            className="global_dropdown"
                          >
                            <option value="">Select</option>
                            {role.map((role) => (
                              <option key={role._id} value={role._id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          {selectedRole[user._id] && (
                            <button
                              onClick={() => updateUserRole(user._id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                              Submit
                            </button>
                          )}
                        </>
                      )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUser;
