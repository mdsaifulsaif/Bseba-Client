import axios from "axios";
import React, { useEffect, useState } from "react";
import { BaseURL } from "./../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { ToastContainer, toast } from "react-toastify";

function CoustomerReport() {
  const [customerRpData, setCustomerRpData] = useState([]);
  const customerReportsData = async () => {
    const res = await axios(`${BaseURL}/CoustomersReport`, {
      headers: { token: getToken() },
    });

    if (res.data.sucess) {
      toast.success("Customer ");
    }

    console.log("customer report data", res.data.data);
  };

  useEffect(() => {
    customerReportsData();
  }, []);
  return <div>CoustomerReport</div>;
}

export default CoustomerReport;
