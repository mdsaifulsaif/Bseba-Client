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
import ReceivableReportPage from "./Pages/Report/ReceivableReportPage";
import TransactionPage from "./Pages/Transaction/TransactionPage";
import TransactionDetailsPage from "./Pages/Transaction/TransactionDetailsPage";
import PayableReportPage from "./Pages/Report/PayableReportPage";
import LowProductListPage from "./Pages/Report/LowProductListPage";
import PosSalePage from "./Pages/Sale/PosSalePage";
import SaleReturnPage from "./Pages/Sale/SaleReturnPage";
import SaleReturnDetailsPage from "./Pages/Sale/SaleReturnDetailsPage";
import A5PrintPage from "./Pages/Sale/A5PrintPage";
import Print80Page from "./Pages/Sale/Print80Page";
import ChallanPage from "./Pages/Sale/ChallanPage";
import ChallanA5Page from "./Pages/Sale/ChallanA5Page";
import Print58Page from "./Pages/Sale/Print58Page";
import ExpenseReportPage from "./Pages/Report/ExpenseReportPage";
import TransactionReportPage from "./Pages/Report/TransactionReportPage";
import DalyReportPage from "./Pages/Report/DalyReportPage";
import StockReportPage from "./Pages/Report/StockReportPage";
import PurchaseReturnDetailsPage from "./Pages/Purchase/PurchaseReturnDetailsPage";
import ProductSaleReportPage from "./Pages/Report/ProductSaleReportPage";
import AccountsPage from "./Pages/Account/AccountsPage";
import AccountReportPage from "./Pages/Account/AccountReportPage";
import CreateQuotationPage from "./Pages/Quotation/CreateQuotationPage";

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
            <Route path="/Accounts" element={<AccountsPage />} />
            <Route path="/AccountReport" element={<AccountReportPage />} />

            {/* Quotation */}
            <Route path="CreateQuotation" element={<CreateQuotationPage />} />

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

            {/* Report Routes  */}
            <Route path="/BusinessReport" element={<BusinessReportPage />} />
            <Route path="/SalsReport" element={<SalsReportPage />} />
            <Route path="/TopCoustomer" element={<TopCustomerPage />} />
            <Route path="/CoustomerReport" element={<CoustomerReportPage />} />
            <Route
              path="/ReceivableReport"
              element={<ReceivableReportPage />}
            />
            <Route path="Transaction/:id" element={<TransactionPage />} />
            <Route
              path="TransactionDetails/:id"
              element={<TransactionDetailsPage />}
            />
            <Route path="/PayableReport" element={<PayableReportPage />} />
            <Route
              path="/ProductSaleReport"
              element={<ProductSaleReportPage />}
            />
            <Route path="/LowProductList" element={<LowProductListPage />} />
            <Route path="/ExpenseReport" element={<ExpenseReportPage />} />
            <Route
              path="/TransactionReport"
              element={<TransactionReportPage />}
            />
            <Route path="/DalyReport" element={<DalyReportPage />} />
            <Route path="/StockReport" element={<StockReportPage />} />
            {/* <Route path="/SaleReport" element={<SalsReportPage />} /> */}

            {/* Sale Reports  */}
            <Route path="/NewSale" element={<NewSalePage />} />
            <Route path="/SaleList" element={<SaleListPage />} />
            <Route path="/SaleDetails/:id" element={<SaleDetailsPage />} />
            <Route path="/SaleReturnList" element={<SaleReturnListPage />} />
            <Route path="SaleReturn/:id" element={<SaleReturnPage />} />
            <Route
              path="/SaleReturnDetails/:id"
              element={<SaleReturnDetailsPage />}
            />

            <Route path="/A5Print/:id" element={<A5PrintPage />} />
            <Route path="/Print/:id" element={<Print80Page />} />
            <Route path="/Challan/:id" element={<ChallanPage />} />
            <Route path="/ChallanA5/:id" element={<ChallanA5Page />} />
            <Route path="/Print58/:id" element={<Print58Page />} />

            {/* Purchases Routes */}
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
            <Route
              path="/PurchaseReturnDetails/:id"
              element={<PurchaseReturnDetailsPage />}
            />

            <Route path="/DealerList/:id" element={<DealerListPage />} />
            <Route path="/PosSale" element={<PosSalePage />} />
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
