import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AllUser = lazy(() => import("../../Components/Team/AllUser"));
const AllUserPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AllUser />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AllUserPage;
