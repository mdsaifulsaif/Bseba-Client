import {
  MdOutlinePerson4,
  MdReportGmailerrorred,
  MdOutlineAddShoppingCart,
} from "react-icons/md";
import { FaListCheck, FaBangladeshiTakaSign } from "react-icons/fa6";
import { CiCircleList } from "react-icons/ci";
import { IoListCircleOutline, IoCreateOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { CiBank } from "react-icons/ci";
import { RiRedPacketLine, RiContactsBook3Line } from "react-icons/ri";
import { FcSalesPerformance } from "react-icons/fc";
import { GrContactInfo } from "react-icons/gr";
import { MdCreateNewFolder } from "react-icons/md";
import { GiBuyCard, GiTeamIdea, GiTakeMyMoney } from "react-icons/gi";
import { TbBusinessplan } from "react-icons/tb";
import { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import {
  FaChevronDown,
  FaChevronRight,
  FaUserCog,
  FaUsersCog,
  FaList,
  FaSortAmountUp,
} from "react-icons/fa";
import { AiOutlineProduct } from "react-icons/ai";

import { LiaSortAmountUpSolid } from "react-icons/lia";
import { TbPackageImport, TbBrandStocktwits } from "react-icons/tb";

import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { GiMoneyStack } from "react-icons/gi";
import { CiSettings } from "react-icons/ci";
import { PiBankBold, PiListStarFill } from "react-icons/pi";
import { BsSun, BsMoon } from "react-icons/bs";
import { BiCategoryAlt } from "react-icons/bi";
import { getAdmin, removeSessions } from "../../Helper/SessionHelper";
import { NavLink, useLocation } from "react-router-dom";

const MasterLayout = ({ children }) => {
  let isAdmin = getAdmin() == 1;
  const navigationData = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <LuLayoutDashboard />,
      path: "/",
    },
    ...(isAdmin
      ? [
          {
            id: "sale",
            title: "Sale",
            icon: <FcSalesPerformance />,
            children: [
              {
                id: "newsale",
                title: "Create Sale",
                icon: <MdCreateNewFolder />,
                path: "/NewSale",
              },
              {
                id: "salelist",
                title: "Sale List",
                icon: <PiListStarFill />,
                path: "/SaleList",
              },
              {
                id: "salereturnlist",
                title: "Sale Return List",
                icon: <IoListCircleOutline />,
                path: "/SaleReturnList",
              },
            ],
          },

          {
            id: "product",
            title: "Product",
            icon: <AiOutlineProduct />,
            children: [
              {
                id: "product list",
                title: "Product List",
                path: "/ProductList",
                icon: <RiRedPacketLine />,
              },
              {
                id: "New product",
                title: "New Product",
                path: "/NewProduct",
                icon: <RiRedPacketLine />,
              },

              {
                id: "category",
                title: "Category",
                icon: <BiCategoryAlt />,
                path: "/Category",
              },
              {
                id: "unit",
                title: "Unit",
                icon: <BiCategoryAlt />,
                path: "/Unit",
              },
              {
                id: "brand",
                title: "Brand",
                icon: <BiCategoryAlt />,
                path: "/Brand",
              },
            ],
          },

          {
            id: "contact",
            title: "Contact",
            icon: <RiContactsBook3Line />,
            children: [
              {
                id: "customer",
                title: "Customer",
                path: "/Customer",
                icon: <GrContactInfo />,
              },
              {
                id: "supplier",
                title: "Supplier",
                icon: <TbPackageImport />,
                path: "/Supplier",
              },
            ],
          },
          {
            id: "transiction",
            title: "Transiction",
            icon: <FaBangladeshiTakaSign />,
            children: [
              {
                id: "transictionlist",
                title: "Transiction List",
                path: "/AllTransictionList",
                icon: <GrContactInfo />,
              },
            ],
          },

          {
            id: "purchase",
            title: "Purchase",
            icon: <GiBuyCard />,
            children: [
              {
                id: "createpurchase",
                title: "Create Purchase",
                icon: <IoCreateOutline />,
                path: "/CreatePurchase",
              },
              {
                id: "purchaselist",
                title: "Purchase List",
                icon: <FaList />,
                path: "/PurchaseList",
              },
              {
                id: "purchasereturnlist",
                title: "Purchase Return List",
                icon: <FaList />,
                path: "/PurchaseReturnList",
              },
            ],
          },

          {
            id: "expense",
            title: "Expense",
            icon: <FaSortAmountUp />,
            children: [
              {
                id: "expense",
                title: "Expense",
                icon: <LiaSortAmountUpSolid />,
                path: "/Expense",
              },
              {
                id: "expensetype",
                title: "Expense Type",
                icon: <LiaSortAmountUpSolid />,
                path: "/ExpenseType",
              },
              {
                id: "ExpenseByType",
                title: "Expense By Type",
                icon: <LiaSortAmountUpSolid />,
                path: "/ExpenseByType",
              },
            ],
          },
          // ====Damage=======================================
          {
            id: "Damage",
            title: "Damage",
            icon: <FaSortAmountUp />,
            children: [
              {
                id: "AddDamage",
                title: "Add Damage",
                icon: <LiaSortAmountUpSolid />,
                path: "/AddDamage",
              },
              {
                id: "DamageList",
                title: "Damage List",
                icon: <LiaSortAmountUpSolid />,
                path: "/DamageList",
              },
            ],
          },

          // ====Report===================================
          {
            id: "Report",
            title: "Report",
            icon: <MdReportGmailerrorred />,
            children: [
              {
                id: "BusinessReport",
                title: "Business Report",
                icon: <TbBusinessplan />,
                path: "/BusinessReport",
              },
              {
                id: "SaleReport",
                title: "Sale Report",
                icon: <MdOutlineAddShoppingCart />,
                path: "/SalsReport",
              },
              {
                id: "TopCoustomer",
                title: "Top Coustomer",
                icon: <FaUsers />,
                path: "/TopCoustomer",
              },
              {
                id: "CoustomerReport",
                title: "Coustomer Report",
                icon: <FaUsersGear />,
                path: "/CoustomerReport",
              },
              {
                id: "ReceivableReport",
                title: "Receivable Report",
                icon: <GiTakeMyMoney />,
                path: "/ReceivableReport",
              },
              {
                id: "PayableReport",
                title: "Payable Report",
                icon: <GiMoneyStack />,
                path: "/PayableReport",
              },
            ],
          },
          // ====accounts===================================

          {
            id: "accounts",
            title: "Bank Accounts",
            icon: <CiBank />,
            children: [
              {
                id: "bankaccounts",
                title: "Bank Accounts",
                icon: <PiBankBold />,
                path: "/BankAccount",
              },
            ],
          },
          // {
          //   id: "Team",
          //   title: "Team",
          //   icon: <GiTeamIdea />,
          //   children: [
          //     {
          //       id: "users",
          //       title: "All Users",
          //       icon: <FaUserCog />,
          //       path: "/AllUser",
          //     },
          //     {
          //       id: "role",
          //       title: "Roles",
          //       icon: <FaUsersCog />,
          //       path: "/Role",
          //     },
          //     {
          //       id: "rsm",
          //       title: "RSM",
          //       icon: <FaUsersCog />,
          //       path: "/RSM",
          //     },
          //     {
          //       id: "asm",
          //       title: "ASM",
          //       icon: <FaUsersCog />,
          //       path: "/ASM",
          //     },
          //     {
          //       id: "mso",
          //       title: "MSO",
          //       icon: <FaUsersCog />,
          //       path: "/MSO",
          //     },
          //   ],
          // },
          // {
          //   id: "settings",
          //   title: "Settings",
          //   icon: <CiSettings />,
          //   children: [
          //     ...(isAdmin
          //       ? [
          //           {
          //             id: "BusinessSetting",
          //             title: "Business Setting",
          //             path: "/BusinessSetting",
          //           },
          //         ]
          //       : []),
          //     { id: "profile", title: "profile", path: "/profile" },
          //   ].filter(Boolean), // This removes any falsy values
          // },
        ]
      : []),
  ];

  const [expandedItems, setExpandedItems] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    // Check if dark mode preference is saved in sessionStorage
    const savedMode = sessionStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [openSidePanel, setOpenSidePanel] = useState(true);
  const location = useLocation();

  // Automatically expand parent items when child is active
  useEffect(() => {
    const newExpandedItems = { ...expandedItems };
    let shouldUpdate = false;

    navigationData.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => child.path === location.pathname
        );
        if (isChildActive && !newExpandedItems[item.id]) {
          newExpandedItems[item.id] = true;
          shouldUpdate = true;
        }
      }
    });

    if (shouldUpdate) {
      setExpandedItems(newExpandedItems);
    }
  }, [location.pathname]);

  // Handle dark mode toggle and persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to sessionStorage
    sessionStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize(width);

      // width অনুযায়ী side panel control
      if (width <= 1024) {
        setOpenSidePanel(false);
      } else {
        setOpenSidePanel(true);
      }
    };

    // প্রথম render এও চেক করা দরকার
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => child.path === location.pathname);
  };

  return (
    <div className="flex w-full h-[100vh] dark:bg-gray-900 transition-colors duration-300">
      {/* SidePanel */}
      <aside
        className={`overflow-y-auto overflow-x-hidden flex flex-col gap-1 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen top-0 left-0 transition-all duration-300 ease-in-out ${
          openSidePanel ? "w-64 p-2" : "lg:w-16 w-[0px]"
        }`}
        id="no-print"
      >
        {/* Header */}
        <div className="p-2 flex justify-between items-center">
          {openSidePanel ? (
            <h1 className="text-gray-800 dark:text-gray-200 font-semibold truncate transition-opacity duration-300 opacity-100">
              Name from getBusiness Details
            </h1>
          ) : (
            <div className="w-0 opacity-0 transition-all duration-300 overflow-hidden"></div>
          )}
          <button
            onClick={() => setOpenSidePanel(!openSidePanel)}
            className="hidden lg:block text-green-600 dark:text-green-300 hover:bg-green-600 dark:hover:bg-green-700 hover:text-white rounded p-1 transition-colors duration-200 flex-shrink-0"
          >
            {openSidePanel ? <GoSidebarExpand /> : <GoSidebarCollapse />}
          </button>
        </div>

        {/* Navigation */}
        {openSidePanel ? (
          // Expanded Navigation
          <div
            className={`transition-opacity duration-300 bg-green-100 dark:bg-gray-700 rounded-3xl  ${
              openSidePanel ? "opacity-100" : "opacity-0"
            }`}
          >
            {navigationData.map((data) => (
              <div key={data.id}>
                {data.path && !data.children ? (
                  <NavLink
                    to={data.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTimeout(() => setOpenSidePanel(false), 50); // Small delay
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-3xl  hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors duration-200 ${
                        isActive
                          ? "bg-green-500 dark:bg-green-600 text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`
                    }
                  >
                    <span className="text-lg">{data.icon}</span>
                    <span className="whitespace-nowrap">{data.title}</span>
                  </NavLink>
                ) : (
                  <div
                    onClick={() => data.children && toggleItem(data.id)}
                    className={`flex items-center justify-between p-3 rounded-3xl hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors duration-200 ${
                      hasActiveChild(data)
                        ? "bg-green-500 dark:bg-green-600 text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <span className="text-lg">{data.icon}</span>
                      <span className="whitespace-nowrap">{data.title}</span>
                    </div>
                    {data.children && (
                      <span className="text-xs transition-transform duration-200">
                        {expandedItems[data.id] ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    )}
                  </div>
                )}

                {/* Submenu */}
                {data.children && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedItems[data.id] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="pl-5 py-1 space-y-0">
                      {data.children.map((child) =>
                        child === null ? null : (
                          <NavLink
                            key={child.id}
                            to={child.path}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimeout(() => setOpenSidePanel(false), 50); // Small delay
                            }}
                            className={({ isActive }) =>
                              ` p-2 flex items-center gap-2 rounded-3xl hover:bg-green-400 dark:hover:bg-green-600 hover:text-white text-sm transition-colors duration-200 ${
                                isActive
                                  ? "bg-green-500 dark:bg-green-600 text-white font-medium"
                                  : "text-gray-600 dark:text-gray-400"
                              }`
                            }
                          >
                            {" "}
                            {child.icon}
                            {child.title}
                          </NavLink>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Collapsed Navigation - Icons Only
          <div className="hidden lg:flex flex-col items-center gap-2 py-2 transition-opacity duration-300 opacity-100">
            {navigationData.map((data) => (
              <div key={data.id} className="relative group">
                {data.path && !data.children ? (
                  <NavLink
                    to={data.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTimeout(() => setOpenSidePanel(false), 50); // Small delay
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-center w-10 h-10 rounded hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors duration-200 ${
                        isActive
                          ? "bg-green-500 dark:bg-green-600 text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`
                    }
                  >
                    <span className="text-lg">{data.icon}</span>
                  </NavLink>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setTimeout(() => setOpenSidePanel(false), 50); // Small delay
                    }}
                    className={`flex items-center justify-center w-10 h-10 rounded hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors duration-200 ${
                      expandedItems[data.id] || hasActiveChild(data)
                        ? "bg-green-500 dark:bg-green-600 text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="text-lg">{data.icon}</span>
                  </div>
                )}

                {/* Tooltip */}
                <div className=" absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {data.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <nav
          id="no-print"
          className="w-full border-b border-gray-200 dark:border-gray-700 h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-800 transition-colors duration-300"
        >
          {/* <div className="flex items-center"></div> */}
          <button
            onClick={() => setOpenSidePanel(!openSidePanel)}
            className="lg:hidden text-green-600 dark:text-green-300 hover:bg-green-600 dark:hover:bg-green-700 hover:text-white rounded p-1 transition-colors duration-200 flex-shrink-0"
          >
            {openSidePanel ? <GoSidebarExpand /> : <GoSidebarCollapse />}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-200 flex items-center gap-2"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <BsSun className="text-lg" />
              ) : (
                <BsMoon className="text-lg" />
              )}
              <span className="text-sm font-medium">
                {darkMode ? "Light" : "Dark"}
              </span>
            </button>
          </div>
          <button
            onClick={() => {
              removeSessions();
            }}
            className="global_button"
          >
            Logout
          </button>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-auto lg:p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MasterLayout;
