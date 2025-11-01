import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import {
  AiOutlineAppstore,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { MdPointOfSale } from "react-icons/md";
import { GiExpense } from "react-icons/gi";
import { FaRegEdit } from "react-icons/fa";
import { FaUnity } from "react-icons/fa6";
import { SiBrandfolder } from "react-icons/si";
import { TbTransferIn } from "react-icons/tb";
import { RiFileDamageLine } from "react-icons/ri";
import { Link } from "react-router-dom";

const AddNewNavbar = () => {
  const { modalOpen, modalType, closeModal } = openCloseStore();

  const items = [
    {
      name: "Add Product",
      icon: <AiOutlineShoppingCart />,
      path: "/NewProduct",
    },
    {
      name: "Create Purchase",
      icon: <AiOutlineShoppingCart />,
      path: "/CreatePurchase",
    },
    { name: "Sale", icon: <MdPointOfSale />, path: "/NewSale" },
    { name: "Expense", icon: <GiExpense />, path: "/Expense" },
    { name: "Quotation", icon: <FaRegEdit />, path: "/quotation" },
    { name: "Customer", icon: <AiOutlineUser />, path: "/Customer" },
    { name: "Supplier", icon: <AiOutlineUser />, path: "/supplier" },
    { name: "Unit", icon: <FaUnity />, path: "/Unit" },
    { name: "Brand", icon: <SiBrandfolder />, path: "/Brand" },
    { name: "Add Category", icon: <AiOutlineAppstore />, path: "/category" },
    { name: "Transfer", icon: <TbTransferIn />, path: "/Transfer" },
    { name: "Add Damage", icon: <RiFileDamageLine />, path: "/AddDamage" },
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
      className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-24 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#1E2939] dark:text-white rounded-xl shadow-2xl p-6 w-full max-w-2xl 
          transform transition-all duration-300
          ${
            modalOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-10 opacity-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Add New
          </h2>
          <button
            onClick={closeModal}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
          >
            Close
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={closeModal}
              className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-green-50 dark:hover:bg-[#243447] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="text-2xl text-green-600 mb-1">{item.icon}</div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 dark:text-gray-300 truncate w-full">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddNewNavbar;
