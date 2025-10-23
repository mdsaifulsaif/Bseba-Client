import { Fragment } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./Helper/SessionHelper";
import Login from "./Components/Login/Login";

import DashboardPage from "./Pages/Dashboard/DashboardPage";
import BusinessSettingPage from "./Pages/BusinessSetting/BusinessSettingPage";
// import NewProductPage from "./Pages/Product/NewProductPage";
import ProductListPage from "./Pages/Product/ProductListPage";
import CreateCategoryPage from "./Pages/Product/CategoryPage";
// import AllUserPage from "./Pages/Team/AllUserPage";
// import RolePage from "./Pages/Team/RolePage";
// import PermissionPage from "./Pages/Team/PermissionPage";
import AccountPage from "./Pages/Accounts/AccountPage";
import DealerPage from "./Pages/Contact/DealerPage";
import SupplierPage from "./Pages/Contact/SupplierPage";

import NewSalePage from "./Pages/Sale/NewSalePage";
import SaleListPage from "./Pages/Sale/SaleListPage";
import SaleReturnListPage from "./Pages/Sale/SaleReturnListPage";
import PurchaseListPage from "./Pages/Purchase/PurchaseListPage";
import CreatePurchasePage from "./Pages/Purchase/CreatePurchasePage";
import DealerListPage from "./Pages/Contact/DealerListPage";
import ExpensePage from "./Pages/Expense/ExpensePage";
import ExpenseTypePage from "./Pages/Expense/ExpenseTypePage";
import PurchaseDetailsPage from "./Pages/Purchase/PurchaseDetailsPage";
import SaleDetailsPage from "./Pages/Sale/SaleDetailsPage";
import ViewDealerLaserPage from "./Pages/Contact/ViewDealerLaserPage";
import ViewSupplierLaserPage from "./Pages/Contact/ViewSupplierLaserPage";
import MyDealerPage from "./Pages/Officers/MyDealerPage";
import SellListPage from "./Pages/Officers/SellListPage";
import PostTransictionPage from "./Pages/Officers/PostTransictionPage";
import TransictionListPage from "./Pages/Officers/TransictionListPage";
import AllTransictionListPage from "./Pages/Transiction/AllTransictionListPage";
import TransictionDetailsPage from "./Pages/Transiction/TransictionDetailsPage";

import AddStockPage from "./Pages/Product/AddStockPage";
import AddStockDetailsPage from "./Pages/Product/AddStockDetailsPage";
import AddStockListPage from "./Pages/Product/AddStockListPage";
import VerifyMobile from "./Components/Login/VerifyMobile";
import SignUp from "./Components/Login/SignUp";
import CreateBusiness from "./Components/BusinessSetting/CreateBusiness";
import UserDashboardPage from "./Pages/Dashboard/UserDashboardPage";
import NewProductPage from "./Pages/Product/NewProductPage";
import UnitPage from "./Pages/Product/UnitPage";
import BrandPage from "./Pages/Product/BrandPage";
import EditProductPage from "./Pages/Product/EditProductPage";
import EditContact from "./Components/Contact/EditContact";
import EditContactPage from "./Pages/Contact/EditContactPage";
import CustomerPage from "./Pages/Contact/CustomerPage";
import PurchaseReturnPage from "./Pages/Purchase/PurchaseReturnPage";
import PurchaseReturnList from "./Components/Purchase/PurchaseReturnList";
import ExpenseByIDPage from "./Pages/Expense/ExpenseByIDPage";
import PurchaseReturnListPage from "./Pages/Purchase/PurchaseReturnListPage";
import AddDamagePage from "./Pages/Damage/AddDamagePage";
import SalsReportPage from "./Pages/Report/SalsReportPage";
import BusinessReportPage from "./Pages/Report/BusinessReportPage";
import TopCustomerPage from "./Pages/Report/TopCustomerPage";
import CoustomerReportPage from "./Pages/Report/CoustomerReportPage";

function App() {
  const isLoggedIn = getToken();

  return (
    <Fragment>
      <BrowserRouter>
        {isLoggedIn ? (
          <Routes>
            <Route path="/" element={<UserDashboardPage />} />
            <Route path="/Dashboard" element={<DashboardPage />} />
            <Route path="/BusinessSetting" element={<BusinessSettingPage />} />
            <Route path="/CreateBusiness" element={<CreateBusiness />} />
            <Route path="/NewProduct" element={<NewProductPage />} />
            <Route path="/ProductList" element={<ProductListPage />} />
            <Route path="/EditProduct/:id" element={<EditProductPage />} />
            <Route path="/Category" element={<CreateCategoryPage />} />
            <Route path="/Unit" element={<UnitPage />} />
            <Route path="/Brand" element={<BrandPage />} />
            <Route path="/AddStock" element={<AddStockPage />} />
            <Route
              path="/AddStockDetails/:id"
              element={<AddStockDetailsPage />}
            />
            <Route path="/AddStockList" element={<AddStockListPage />} />
            {/* <Route path="/AllUser" element={<AllUserPage />} />
            <Route path="/Role" element={<RolePage />} />
            <Route path="/Permission/:id" element={<PermissionPage />} /> */}
            <Route path="/BankAccount" element={<AccountPage />} />
            <Route path="/Dealer" element={<DealerPage />} />
            <Route path="/Customer" element={<CustomerPage />} />
            <Route path="/Supplier" element={<SupplierPage />} />
            <Route path="/EditContact/:id" element={<EditContactPage />} />
            <Route
              path="/ViewDealerLaser/:id"
              element={<ViewDealerLaserPage />}
            />
            <Route
              path="/ViewSupplierLaser/:id"
              element={<ViewSupplierLaserPage />}
            />
            <Route path="/Expense" element={<ExpensePage />} />
            <Route path="/ExpenseType" element={<ExpenseTypePage />} />
            <Route path="/ExpenseByType" element={<ExpenseByIDPage />} />
            <Route path="/AddDamage" element={<AddDamagePage />}></Route>

            <Route path="/BusinessReport" element={<BusinessReportPage />} />
            <Route path="/SalsReport" element={<SalsReportPage />} />
            <Route path="/TopCoustomer" element={<TopCustomerPage />} />
            <Route path="/CoustomerReport" element={<CoustomerReportPage />} />
            <Route path="/NewSale" element={<NewSalePage />} />
            <Route path="/SaleList" element={<SaleListPage />} />
            <Route path="/SaleDetails/:id" element={<SaleDetailsPage />} />
            <Route path="/SaleReturnList" element={<SaleReturnListPage />} />
            <Route path="/PurchaseList" element={<PurchaseListPage />} />
            <Route
              path="/PurchaseDetails/:id"
              element={<PurchaseDetailsPage />}
            />
            <Route
              path="/PurchaseReturnList"
              element={<PurchaseReturnListPage />}
            />
            <Route path="/CreatePurchase" element={<CreatePurchasePage />} />
            <Route
              path="/PurchaseReturn/:id"
              element={<PurchaseReturnPage />}
            />
            <Route path="/DealerList/:id" element={<DealerListPage />} />
            <Route path="/MyDealer" element={<MyDealerPage />} />
            <Route path="/SellList" element={<SellListPage />} />
            <Route path="/PostTransiction" element={<PostTransictionPage />} />
            <Route path="/TransictionList" element={<TransictionListPage />} />
            <Route
              path="/AllTransictionList"
              element={<AllTransictionListPage />}
            />
            <Route
              path="/TransictionDetails/:id"
              element={<TransictionDetailsPage />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/VerifyMobile" element={<VerifyMobile />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </BrowserRouter>
    </Fragment>
  );
}

export default App;
