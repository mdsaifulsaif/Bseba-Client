import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Accounts = lazy(() => import("../../Components/Account/Accounts"));

const AccountsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Accounts />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AccountsPage;
