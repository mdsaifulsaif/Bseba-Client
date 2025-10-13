import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const MSO = lazy(() => import("../../Components/Team/MSO"));
const MSOPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <MSO />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MSOPage;
