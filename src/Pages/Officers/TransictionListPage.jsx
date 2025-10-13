import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const TransictionList = lazy(() =>
  import("../../Components/Officers/TransictionList")
);

const TransictionListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <TransictionList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TransictionListPage;
