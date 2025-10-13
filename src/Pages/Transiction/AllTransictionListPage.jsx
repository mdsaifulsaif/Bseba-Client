import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AllTransictionList = lazy(() =>
  import("../../Components/Transiction/AllTransictionList")
);
const AllTransictionListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AllTransictionList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AllTransictionListPage;
