import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

const Permission = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [brandPermissions, setBrandPermissions] = useState({
    CreateBrands: false,
    UpdateBrands: false,
    DeleteBrands: false,
  });

  // 🔹 Fetch existing permissions
  const fetchPermissions = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/getPermissions/${id}`, {
        headers: { token: getToken() },
      });

      if (res.data?.status === "Success") {
        const existing = res.data.data.map((p) => p.name);
        setBrandPermissions({
          CreateBrands: existing.includes("CreateBrands"),
          UpdateBrands: existing.includes("UpdateBrands"),
          DeleteBrands: existing.includes("DeleteBrands"),
        });
      }
    } catch (error) {
      ErrorToast("Failed to load permissions");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // 🔹 Checkbox toggle
  const handleChange = (perm) => {
    setBrandPermissions((prev) => ({
      ...prev,
      [perm]: !prev[perm],
    }));
  };

  // 🔹 Select all toggle
  const toggleSelectAll = (checked) => {
    setBrandPermissions({
      CreateBrands: checked,
      UpdateBrands: checked,
      DeleteBrands: checked,
    });
  };

  // 🔹 Submit updated permissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    const selectedPermissions = Object.keys(brandPermissions)
      .filter((key) => brandPermissions[key])
      .map((p) => ({ name: p }));

    try {
      await axios.post(
        `${BaseURL}/CreatePermission/${id}`,
        selectedPermissions,
        {
          headers: { token: getToken() },
        }
      );
      alert("Permissions updated successfully!");
    } catch (error) {
      ErrorToast("Failed to update permissions");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <h1 className="global_sub_container">Assign Permissions</h1>
      <h2 className="mb-4 text-gray-500">Role ID: {id}</h2>

      <form onSubmit={handleSubmit} className="space-y-6 global_sub_container">
        {/* Brand Permission Section */}
        <div className="p-4 rounded">
          <h3 className="font-semibold mb-2">Brand Permissions</h3>

          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={
                brandPermissions.CreateBrands &&
                brandPermissions.UpdateBrands &&
                brandPermissions.DeleteBrands
              }
              onChange={(e) => toggleSelectAll(e.target.checked)}
            />
            Select All
          </label>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={brandPermissions.CreateBrands}
                onChange={() => handleChange("CreateBrands")}
              />
              Create Brands
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={brandPermissions.UpdateBrands}
                onChange={() => handleChange("UpdateBrands")}
              />
              Update Brands
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={brandPermissions.DeleteBrands}
                onChange={() => handleChange("DeleteBrands")}
              />
              Delete Brands
            </label>
          </div>
        </div>

        <button type="submit" className="global_button">
          Save Permissions
        </button>
      </form>
    </div>
  );
};

export default Permission;
