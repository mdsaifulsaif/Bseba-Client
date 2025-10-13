import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const TransictionDetails = lazy(() =>
  import("../../Components/Transiction/TransictionDetails")
);
const TransictionDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <TransictionDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TransictionDetailsPage;
