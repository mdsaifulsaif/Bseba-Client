import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Dashboard = lazy(() => import("../../Components/Dashboard/Dashboard"));

const DashboardPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Dashboard />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DashboardPage;
