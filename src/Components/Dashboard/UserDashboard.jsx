import React, { useEffect, useState } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import {
  getToken,
  removeSessions,
  setAdmin,
  setPermissionDetails,
  setToken,
} from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { Link } from "react-router-dom";
import { fetchBusinessDetails } from "../../BusinessApi/businessService";

const UserDashboard = () => {
  const [totalInvoice, setTotalInvoice] = useState();
  const { setGlobalLoader } = loadingStore();
  const [ownBusinessData, setOwnBusinessData] = useState([]);
  const [userBusinessData, setUserBusinessData] = useState([]);
  const [business, setBusiness] = useState(null);

  const fetchOwnBusiness = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/getOwnBusiness`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setOwnBusinessData(res.data.data);
      } else if (res.data.status === "Unauthorized") {
        ErrorToast(res.data.error);
        removeSessions();
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
      removeSessions();
    } finally {
      setGlobalLoader(false);
    }
  };

  // bissiness details
  useEffect(() => {
    const loadBusiness = async () => {
      const businessID = localStorage.getItem("businessID"); // ✅ previously saved
      if (!businessID) return;

      const details = await fetchBusinessDetails(businessID);
      setBusiness(details); // reactive state
    };

    loadBusiness();
  }, []);
  // bissiness details

  const redirectToDashboardWithBusinessID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/getBusinessDetails/${id}`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setToken(res.data.token);
        console.log(res.data);
        setPermissionDetails(res.data.data.permissions);
        setAdmin(res.data.data.admin);
        window.location.href = "/Dashboard";
      } else {
        ErrorToast(res.data.error);
        removeSessions();
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchUserBusiness = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/getUserBusiness`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setUserBusinessData(res.data.data);
      } else {
        ErrorToast(res.data.error);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };
  useEffect(() => {
    const getAllData = async () => {
      await Promise.all([fetchOwnBusiness(), fetchUserBusiness()]);
    };
    getAllData();
  }, []);
  return (
    <div className="bg-white h-screen p-10 flex gap-5">
      <div className="global_sub_container w-full">
        <div className="flex items-center justify-between mb-3 ">
          <h1>Your Business List</h1>
          {/* -----------  */}
          <button
            onClick={() => {
              removeSessions();
            }}
            className="global_button"
          >
            Logout
          </button>
        </div>
        {/* -----------  */}
        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="">
                <th className="global_th">#</th>
                <th className="global_th">Business Name</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {ownBusinessData?.map((b, index) => (
                <tr className="global_tr" key={b?._id}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{b?.businessName}</td>
                  <td className="global_td">
                    <button
                      onClick={() => redirectToDashboardWithBusinessID(b._id)}
                      className="global_button"
                    >
                      Go to DashBoard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
