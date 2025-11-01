// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { BaseURL } from "../../Helper/Config";
// import { getToken } from "../../Helper/SessionHelper";
// import { toast } from "react-hot-toast";
// import Select from "react-select";

// const Accounts = () => {
//   const [data, setData] = useState([]);
//   const [accountName, setAccountName] = useState("");
//   const [accountDetails, setAccountDetails] = useState("");
//   const [fromAccount, setFromAccount] = useState(null);
//   const [toAccount, setToAccount] = useState(null);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(`${BaseURL}/FindAllAccount`, {
//         headers: { token: getToken() },
//       });
//       setData(res.data.data);
//     } catch (error) {
//       toast.error("No Accounts Found");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const createAccount = async (e) => {
//     e.preventDefault();
//     if (!accountName.trim()) {
//       toast.error("Account name is required");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${BaseURL}/CreateAccount2`,
//         {
//           name: accountName,
//           Details: accountDetails,
//         },
//         { headers: { token: getToken() } }
//       );

//       if (res.data.status === "Success") {
//         toast.success("Account created successfully");
//         setAccountName("");
//         setAccountDetails("");
//         fetchData();
//       } else {
//         toast.error(res.data.message);
//       }
//     } catch (error) {
//       toast.error("Failed to create account");
//     }
//   };

//   const transferBalance = async (e) => {
//     e.preventDefault();
//     const amount = parseFloat(e.target.amount.value);
//     const note = e.target.note.value;

//     if (!fromAccount || !toAccount) {
//       toast.error("Please select both accounts");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${BaseURL}/CreateBalanceTransfer`,
//         {
//           From: fromAccount.value,
//           To: toAccount.value,
//           Amount: amount,
//           note,
//         },
//         { headers: { token: getToken() } }
//       );

//       if (res.data.status === "Success") {
//         toast.success("Balance transferred successfully");
//         setFromAccount(null);
//         setToAccount(null);
//         e.target.reset();
//         fetchData();
//       } else {
//         toast.error(res.data.message);
//       }
//     } catch (error) {
//       toast.error("An error occurred during transfer");
//     }
//   };

//   return (
//     <div className="global_container">
//       <h4 className="global_heading text-center">
//         Total Accounts: {data.length}
//       </h4>

//       {/* Create Account */}
//       <div className="global_sub_container">
//         <h1 className="global_heading">Create Account</h1>
//         <form onSubmit={createAccount}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Account Name
//               </label>
//               <input
//                 type="text"
//                 value={accountName}
//                 onChange={(e) => setAccountName(e.target.value)}
//                 required
//                 placeholder="Account Name"
//                 className="w-full global_input"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Details</label>
//               <input
//                 type="text"
//                 value={accountDetails}
//                 onChange={(e) => setAccountDetails(e.target.value)}
//                 className="w-full global_input"
//                 placeholder="Details"
//               />
//             </div>
//           </div>

//           <div className="mt-4">
//             <button className="global_button" type="submit">
//               Create Account
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Account List */}
//       <div className="global_sub_container">
//         <h1 className="global_heading">Account List</h1>
//         <div className=" overflow-x-auto ">
//           <table className="global_table">
//             <thead className="global_thead">
//               <tr>
//                 <th className="global_th">Account Name</th>
//                 <th className="global_th">Mobile</th>
//                 <th className="global_th">Total Credit</th>
//                 <th className="global_th">Total Debit</th>
//                 <th className="global_th">Total Expenses</th>
//                 <th className="global_th">Service</th>
//                 <th className="global_th">Received</th>
//                 <th className="global_th">Send</th>
//                 <th className="global_th">Balance</th>
//               </tr>
//             </thead>
//             <tbody className="global_tbody">
//               {[...data]
//                 .sort((a, b) => {
//                   const balanceA =
//                     a.toTotal -
//                     a.fromTotal -
//                     (a.totalCredit - a.totalDebit) -
//                     a.totalExpenses +
//                     a.totalQuickSales;
//                   const balanceB =
//                     b.toTotal -
//                     b.fromTotal -
//                     (b.totalCredit - b.totalDebit) -
//                     b.totalExpenses +
//                     b.totalQuickSales;
//                   return balanceB - balanceA;
//                 })
//                 .map((account) => {
//                   const balance =
//                     account.toTotal -
//                     account.fromTotal -
//                     (account.totalCredit - account.totalDebit) -
//                     account.totalExpenses +
//                     account.totalQuickSales;
//                   return (
//                     <tr key={account._id}>
//                       <td className="global_td">{account.name}</td>
//                       <td className="global_td">{account.mobile}</td>
//                       <td className="global_td">{account.totalCredit}</td>
//                       <td className="global_td">{account.totalDebit}</td>
//                       <td className="global_td">{account.totalExpenses}</td>
//                       <td className="global_td">{account.totalQuickSales}</td>
//                       <td className="global_td">{account.toTotal}</td>
//                       <td className="global_td">{account.fromTotal}</td>
//                       <td className="global_td">{balance}</td>
//                     </tr>
//                   );
//                 })}
//             </tbody>
//             <tfoot>
//               <tr>
//                 <th colSpan="8">Total</th>
//                 <th>
//                   {data.reduce((sum, account) => {
//                     const balance =
//                       account.toTotal -
//                       account.fromTotal -
//                       (account.totalCredit - account.totalDebit) -
//                       account.totalExpenses +
//                       account.totalQuickSales;
//                     return sum + balance;
//                   }, 0)}
//                 </th>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>

//       {/* Balance Transfer */}
//       <div className="global_sub_container">
//         <h1 className="global_heading">Balance Transfer</h1>
//         <form onSubmit={transferBalance}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 From Account
//               </label>
//               <Select
//                 options={data.map((acc) => ({
//                   value: acc._id,
//                   label: acc.name,
//                 }))}
//                 value={fromAccount}
//                 onChange={(option) => setFromAccount(option)}
//                 placeholder="Select from account"
//                 classNamePrefix="react-select"
//                 className="w-full"
//                 menuPortalTarget={document.body}
//                 styles={{
//                   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 To Account
//               </label>
//               <Select
//                 options={data.map((acc) => ({
//                   value: acc._id,
//                   label: acc.name,
//                 }))}
//                 value={toAccount}
//                 onChange={(option) => setToAccount(option)}
//                 placeholder="Select to account"
//                 classNamePrefix="react-select"
//                 className="w-full"
//                 menuPortalTarget={document.body}
//                 styles={{
//                   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                 }}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Amount</label>
//               <input
//                 type="number"
//                 name="amount"
//                 required
//                 className="w-full global_input"
//                 placeholder="Amount"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Note</label>
//               <input
//                 type="text"
//                 name="note"
//                 className="w-full global_input"
//                 placeholder="Note (optional)"
//               />
//             </div>
//           </div>

//           <div className="mt-4">
//             <button className="global_button" type="submit">
//               Transfer
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Accounts;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { toast } from "react-toastify";
import Select from "react-select";

const Accounts = () => {
  const [data, setData] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [fromAccount, setFromAccount] = useState(null);
  const [toAccount, setToAccount] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BaseURL}/FindAllAccount`, {
        headers: { token: getToken() },
      });
      setData(res.data.data);
    } catch (error) {
      toast.error("No Accounts Found");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createAccount = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      toast.error("Account name is required");
      return;
    }

    try {
      const res = await axios.post(
        `${BaseURL}/CreateAccount2`,
        {
          name: accountName,
          Details: accountDetails,
        },
        { headers: { token: getToken() } }
      );

      if (res.data.status === "Success") {
        toast.success("Account created successfully");
        setAccountName("");
        setAccountDetails("");
        fetchData();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to create account");
    }
  };

  const transferBalance = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const note = e.target.note.value;

    if (!fromAccount || !toAccount) {
      toast.error("Please select both accounts");
      return;
    }

    try {
      const res = await axios.post(
        `${BaseURL}/CreateBalanceTransfer`,
        {
          From: fromAccount.value,
          To: toAccount.value,
          Amount: amount,
          note,
        },
        { headers: { token: getToken() } }
      );

      if (res.data.status === "Success") {
        toast.success("Balance transferred successfully");
        setFromAccount(null);
        setToAccount(null);
        e.target.reset();
        fetchData();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("An error occurred during transfer");
    }
  };

  return (
    <div className="global_container">
      <h4 className="global_heading text-center">
        Total Accounts: {data.length}
      </h4>

      {/* Create Account */}
      <div className="global_sub_container">
        <h1 className="global_heading">Create Account</h1>
        <form onSubmit={createAccount}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                placeholder="Account Name"
                className="w-full global_input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="w-full global_input"
                placeholder="Details"
              />
            </div>
          </div>

          <div className="mt-4">
            <button className="global_button" type="submit">
              Create Account
            </button>
          </div>
        </form>
      </div>

      {/* Account List */}
      <div className="global_sub_container">
        <h1 className="global_heading">Account List</h1>
        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">Account Name</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">Total Credit</th>
                <th className="global_th">Total Debit</th>
                <th className="global_th">Total Expenses</th>
                <th className="global_th">Service</th>
                <th className="global_th">Received</th>
                <th className="global_th">Send</th>
                <th className="global_th">Balance</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {[...data]
                .sort((a, b) => {
                  const balanceA =
                    a.toTotal -
                    a.fromTotal -
                    (a.totalCredit - a.totalDebit) -
                    a.totalExpenses +
                    a.totalQuickSales;
                  const balanceB =
                    b.toTotal -
                    b.fromTotal -
                    (b.totalCredit - b.totalDebit) -
                    b.totalExpenses +
                    b.totalQuickSales;
                  return balanceB - balanceA;
                })
                .map((account) => {
                  const balance =
                    account.toTotal -
                    account.fromTotal -
                    (account.totalCredit - account.totalDebit) -
                    account.totalExpenses +
                    account.totalQuickSales;
                  return (
                    <tr key={account._id}>
                      <td className="global_td">{account.name}</td>
                      <td className="global_td">{account.mobile}</td>
                      <td className="global_td">{account.totalCredit}</td>
                      <td className="global_td">{account.totalDebit}</td>
                      <td className="global_td">{account.totalExpenses}</td>
                      <td className="global_td">{account.totalQuickSales}</td>
                      <td className="global_td">{account.toTotal}</td>
                      <td className="global_td">{account.fromTotal}</td>
                      <td className="global_td">{balance}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="8">Total</th>
                <th>
                  {data.reduce((sum, account) => {
                    const balance =
                      account.toTotal -
                      account.fromTotal -
                      (account.totalCredit - account.totalDebit) -
                      account.totalExpenses +
                      account.totalQuickSales;
                    return sum + balance;
                  }, 0)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Balance Transfer */}
      <div className="global_sub_container">
        <h1 className="global_heading">Balance Transfer</h1>
        <form onSubmit={transferBalance}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                From Account
              </label>
              <Select
                options={data.map((acc) => ({
                  value: acc._id,
                  label: acc.name,
                }))}
                value={fromAccount}
                onChange={(option) => setFromAccount(option)}
                placeholder="Select from account"
                classNamePrefix="react-select"
                className="w-full"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                To Account
              </label>
              <Select
                options={data.map((acc) => ({
                  value: acc._id,
                  label: acc.name,
                }))}
                value={toAccount}
                onChange={(option) => setToAccount(option)}
                placeholder="Select to account"
                classNamePrefix="react-select"
                className="w-full"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                required
                className="w-full global_input"
                placeholder="Amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <input
                type="text"
                name="note"
                className="w-full global_input"
                placeholder="Note (optional)"
              />
            </div>
          </div>

          <div className="mt-4">
            <button className="global_button" type="submit">
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Accounts;
