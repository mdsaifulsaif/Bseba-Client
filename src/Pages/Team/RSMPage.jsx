import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const RSM = lazy(() => import("../../Components/Team/RSM"));
const RSMPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <RSM />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default RSMPage;
