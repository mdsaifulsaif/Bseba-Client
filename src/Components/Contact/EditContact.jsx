import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";

const EditContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  const [form, setForm] = useState({
    supplier: "",
    mobile: "",
    email: "",
    address: "",
    contactType: "",
    businessName: "", // hidden থাকবে
  });

  // ✅ Business Name আনার জন্য আলাদা API call
  const fetchBusinessName = async (businessID) => {
    try {
      const res = await axios.get(`${BaseURL}/GetBusinessById/${businessID}`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        console.log(res.data.data?.businessName);
        return res.data.data?.businessName || "";
      } else {
        return "";
      }
    } catch {
      return "";
    }
  };

  // ✅ Contact আনো
  const fetchContact = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/GetContactDetailsById/${id}`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        const data = res.data.data;
        console.log(data);

        // BusinessName আলাদা করে আনো
        const businessName = await fetchBusinessName(data.businessID);

        setForm({
          supplier: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          address: data.address || "",
          contactType: data.type || "",
          businessName: businessName,
        });
      } else {
        ErrorToast("Failed to load contact");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);
    try {
      const payload = {
        id: id, // Update API এর জন্য দরকার
        name: form.supplier,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        type: form.contactType,
        businessName: form.businessName, //  hidden theke jabe
      };

      const res = await axios.post(`${BaseURL}/UpdateContactById`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        SuccessToast("Contact updated successfully");
        navigate("/Supplier");
      } else {
        ErrorToast("Update failed");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-2xl font-bold mb-4">Edit Contact</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-8 gap-4">
          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">Name</label>
            <input
              type="text"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="global_input"
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          <div className="col-span-8 lg:col-span-2">
            <label className="global_label">Contact Type</label>
            <select
              name="contactType"
              value={form.contactType}
              onChange={handleChange}
              className="global_input"
              required
            >
              <option value="">Select Type</option>
              <option value="Supplier">Supplier</option>
              <option value="Customer">Customer</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="col-span-8 flex gap-2">
            <button type="submit" className="global_button">
              Update
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="global_button_red"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContact;
