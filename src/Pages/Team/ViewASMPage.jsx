import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ViewASM = lazy(() => import("../../Components/Team/ViewASM"));
const ViewASMPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ViewASM />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ViewASMPage;
