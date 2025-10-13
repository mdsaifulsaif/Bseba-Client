import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { getToken } from "../../Helper/SessionHelper";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";

const ViewASM = () => {
  const { id } = useParams();
  const [data, setData] = useState({ RSM: {}, ASMList: [] });
  const [search, setSearch] = useState(""); // 🔹 search state
  const { setGlobalLoader } = loadingStore();

  const getasmByASMID = async (id) => {
    try {
      setGlobalLoader(true);
      const res = await axios.get(`${BaseURL}/GetASMbyRSM/${id}`, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        setData({
          RSM: res.data.RSM || {},
          ASMList: res.data.ASMList || [],
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
    getasmByASMID(id);
  }, [id]);

  // 🔹 Filtered ASM list based on search
  const filteredASMList = data.ASMList.filter(
    (asm) =>
      asm.name.toLowerCase().includes(search.toLowerCase()) ||
      asm.mobile.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="global_container">
      <div className="global_sub_container w-full mt-8">
        {/* Display RSM information */}
        <div className="global_sub_container">
          <h2 className="text-xl font-bold mb-2">RSM Information</h2>
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {data.RSM.name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Mobile:</span>{" "}
            {data.RSM.mobile || "N/A"}
          </p>
        </div>

        {/* ASM List Header + Search */}
        <div className="flex flex-col mb-2 gap-2 lg:flex-row justify-between">
          <h2 className="text-xl font-bold">Associated ASMs</h2>
          <input
            type="text"
            placeholder="Search ASM"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="global_input w-full lg:w-fit h-fit"
          />
        </div>

        {/* ASM Table */}
        {filteredASMList.length === 0 ? (
          <p className="text-center py-4">No ASMs found.</p>
        ) : (
          <div className="overflow-x-auto">
            {" "}
            <table className="w-full">
              <thead>
                <tr>
                  <th className="global_th">No</th>
                  <th className="global_th">ASM Name</th>
                  <th className="global_th">Mobile</th>
                  <th className="global_th">Status</th>
                  <th className="global_th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredASMList.map((asm, i) => (
                  <tr key={asm._id}>
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{asm.name}</td>
                    <td className="global_td">{asm.mobile}</td>
                    <td className="global_td">
                      {asm.active === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/DealerList/${asm._id}`}
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

export default ViewASM;
