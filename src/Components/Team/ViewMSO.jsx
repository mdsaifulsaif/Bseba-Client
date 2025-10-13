import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";

const ViewMSO = () => {
  const { id } = useParams();
  const [data, setData] = useState({ ASM: {}, MSOList: [] });
  const [search, setSearch] = useState(""); // 🔹 search state
  const { setGlobalLoader } = loadingStore();

  const getMSOByASMID = async (id) => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetMSObyASM/${id}`, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        setData({
          ASM: res.data.ASM || {},
          MSOList: res.data.MSOList || [],
        });
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
    getMSOByASMID(id);
  }, [id]);

  // 🔹 Filtered MSO list based on search
  const filteredMSOList = data.MSOList.filter(
    (mso) =>
      mso.name.toLowerCase().includes(search.toLowerCase()) ||
      mso.mobile.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="global_container">
      <div className="global_sub_container w-full mt-8">
        {/* Display ASM information */}
        <div className="global_sub_container">
          <h2 className="text-xl font-bold mb-2">ASM Information</h2>
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {data.ASM.name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Mobile:</span>{" "}
            {data.ASM.mobile || "N/A"}
          </p>
        </div>

        {/* MSO List Header + Search */}
        <div className="flex flex-col lg:flex-row justify-between gap-2 mb-3">
          <h2 className="text-xl font-bold">Associated MSOs</h2>
          <input
            type="text"
            placeholder="Search MSO"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="global_input w-full lg:w-fit h-fit"
          />
        </div>

        {/* MSO Table */}
        {filteredMSOList.length === 0 ? (
          <p className="text-center py-4">No MSOs found for this ASM.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            {" "}
            <table className="w-full">
              <thead>
                <th className="global_th">No</th>
                <th className="global_th">MSO Name</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">Status</th>
                <th className="global_th">Actions</th>
              </thead>
              <tbody>
                {filteredMSOList.map((mso, i) => (
                  <tr key={mso._id}>
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{mso.name}</td>
                    <td className="global_td">{mso.mobile}</td>
                    <td className="global_td">
                      {mso.active === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/DealerList/${mso._id}`}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        View Dealer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMSO;
