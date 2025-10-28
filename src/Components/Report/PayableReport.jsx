import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { printElement } from "../../Helper/Printer";
import { Link } from "react-router-dom";

function PayableReport() {
  const [payableAmount, setPayableAmount] = useState(0);
  const [payables, setPayables] = useState([]);
  const [searchkey, setSearchKey] = useState("");
  const componentRef = useRef();

  // Fetch data from API
  const fetchedPayableData = async () => {
    try {
      const res = await axios.get(`${BaseURL}/DebitTransactionReport`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        setPayables(res.data.data || []);
        setPayableAmount(res.data.totalBalance || 0);
      } else {
        console.warn("API returned unsuccessful status", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch payable data", error);
    }
  };

  useEffect(() => {
    fetchedPayableData();
  }, []);

  // Update search key
  const handleSearch = (e) => {
    setSearchKey(e.target.value);
  };

  // Filter logic
  const filteredData = payables.filter((payable) => {
    const searchLower = searchkey.toLowerCase();
    return (
      payable?.name?.toLowerCase().includes(searchLower) ||
      payable?.address?.toLowerCase().includes(searchLower) ||
      payable?.mobile?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="global_container" ref={componentRef}>
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">Payable Report</h1>
        <div className="mb-4">
          <span className="font-medium">Total Payable: </span>
          <span>{Math.abs(payableAmount)}৳</span>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search by name, mobile, address"
            className="global_input"
            value={searchkey}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="global_sub_container overflow-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Name</th>
              <th className="global_th">Mobile</th>
              <th className="global_th">Address</th>
              <th className="global_th">Balance</th>
              <th className="global_th">Send SMS</th>
              <th className="global_th">Balance Sheet</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item.name}</td>
                  <td className="global_td">{item.mobile}</td>
                  <td className="global_td">{item.address}</td>
                  <td className="global_td">{Math.abs(item.balance)}৳</td>
                  <td className="global_td text-center">
                    <button>
                      <MdOutlineMarkEmailRead color="green" size={20} />
                    </button>
                  </td>
                  <td className="global_td text-center">
                    <Link
                      to={`/Transaction/${item._id}`}
                      className="global_button"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-3 text-gray-500 font-medium"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-5">
        <button
          onClick={() => printElement(componentRef, "Payable Report")}
          className="global_button w-60"
        >
          Print
        </button>
      </div>
    </div>
  );
}

export default PayableReport;
