import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import {
  AiOutlineAppstore,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { Link } from "react-router-dom";

const AddNewNavbar = () => {
  const { modalOpen, modalType, closeModal } = openCloseStore();

  const items = [
    { name: "Category", icon: <AiOutlineAppstore /> },
    { name: "NewProduct", icon: <AiOutlineShoppingCart /> },
    { name: "CreatePurchase", icon: <AiOutlineShoppingCart /> },
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

  useEffect(() => {
    document.body.style.overflow =
      modalOpen && modalType === "addNew" ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen, modalType]);

  if (!modalOpen || modalType !== "addNew") return null;

  return createPortal(
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-black/30 flex justify-center items-start pt-20"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#1E2939] dark:text-white rounded-lg shadow-lg p-5
          max-w-xl w-fit
          transform transition-all duration-300
          ${
            modalOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-10 opacity-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={closeModal}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Close
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-5 gap-3">
          {items.map((item, index) => (
            <Link
              onClick={closeModal}
              to={`/${item.name}`}
              key={index}
              className="flex flex-col items-center justify-center p-2 border rounded hover:bg-green-100"
            >
              <div className="text-2xl text-green-500">{item.icon}</div>
              <span className="text-sm mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddNewNavbar;
