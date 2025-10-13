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

const UserDashboard = () => {
  const [totalInvoice, setTotalInvoice] = useState();
  const { setGlobalLoader } = loadingStore();
  const [ownBusinessData, setOwnBusinessData] = useState([]);
  const [userBusinessData, setUserBusinessData] = useState([]);

  const fetchTotalInvoice = async () => {
    setGlobalLoader(true);
    try {
      const res = await axios.get(`${BaseURL}/MyTotalInvoice`, {
        headers: { token: getToken() },
      });
      if (res.data.status === "Success") {
        setTotalInvoice(res.data.totalInvoices);
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
      await Promise.all([
        fetchTotalInvoice(),
        fetchOwnBusiness(),
        fetchUserBusiness(),
      ]);
    };
    getAllData();
  }, []);
  return (
    <div className="bg-white h-screen p-10 flex gap-5">
      <div className="global_sub_container w-full">
        <h1>Your Business List</h1>
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
      <div className="global_sub_container w-full">
        Total Invoices = {totalInvoice}
      </div>
    </div>
  );
};

export default UserDashboard;
