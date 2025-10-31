// src/Services/businessService.js
import axios from "axios";
import { BaseURL } from "../Helper/Config";
import { getToken } from "../Helper/SessionHelper";
import { ErrorToast } from "../Helper/FormHelper";

// 1️⃣ Get Own Business ID after login
export const fetchOwnBusiness = async () => {
  try {
    const res = await axios.get(`${BaseURL}/getOwnBusiness`, {
      headers: { token: getToken() },
    });

    if (res.data.status !== "Success" || !res.data.data.length) {
      ErrorToast("Failed to get business ID");
      return null;
    }

    const businessID = res.data.data[0]._id; // ✅ take the first item's _id

    // Save in localStorage
    localStorage.setItem("businessID", businessID);

    return businessID;
  } catch (error) {
    ErrorToast(error.message || "Something went wrong");
    return null;
  }
};

// 2️⃣ Get Business Details using ID (Dashboard call)
// export const fetchBusinessDetails = async (businessID) => {
//   if (!businessID) return null;

//   try {
//     const res = await axios.get(`${BaseURL}/getBusinessDetails/${businessID}`, {
//       headers: { token: getToken() },
//     });

//     if (res.data.status !== "Success") {
//       ErrorToast("Failed to fetch business details");
//       return null;
//     }

//     // Save full business details
//     localStorage.setItem("businessDetails", JSON.stringify(res.data.data));
//     return res.data.data;
//   } catch (error) {
//     ErrorToast(error.message || "Something went wrong");
//     return null;
//   }
// };

export const fetchBusinessDetails = async (businessID) => {
  if (!businessID) return null;

  try {
    const res = await axios.get(`${BaseURL}/getBusinessById/${businessID}`, {
      headers: { token: getToken() },
    });

    if (res.data.status !== "Success") {
      ErrorToast("Failed to fetch business details");
      return null;
    }

    localStorage.setItem("businessDetails", JSON.stringify(res.data.data));
    return res.data.data;
  } catch (error) {
    ErrorToast(error.message || "Something went wrong");
    return null;
  }
};
