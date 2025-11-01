import React, { useState } from "react";
import {
  AiOutlineCategory,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai"; // উদাহরণ আইকন

const AddNewNavbar = () => {
  const [showItems, setShowItems] = useState(false);

  const items = [
    { name: "Category", icon: <AiOutlineCategory /> },
    { name: "Product", icon: <AiOutlineShoppingCart /> },
    { name: "Purchase", icon: <AiOutlineShoppingCart /> },
    { name: "Sale", icon: <AiOutlineShoppingCart /> },
    { name: "Expense", icon: <AiOutlineShoppingCart /> },
    { name: "Quotation", icon: <AiOutlineShoppingCart /> },
    { name: "Return", icon: <AiOutlineShoppingCart /> },
    { name: "User", icon: <AiOutlineUser /> },
    { name: "Customer", icon: <AiOutlineUser /> },
    { name: "Biller", icon: <AiOutlineUser /> },
    { name: "Supplier", icon: <AiOutlineUser /> },
    { name: "Transfer", icon: <AiOutlineShoppingCart /> },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowItems(!showItems)}
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        + Add New
      </button>

      {showItems && (
        <div className="absolute mt-2 bg-white shadow-lg rounded p-4 grid grid-cols-3 gap-3 z-50">
          {items.map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-2 border rounded hover:bg-gray-100"
            >
              <div className="text-2xl">{item.icon}</div>
              <span className="text-sm mt-1">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddNewNavbar;
