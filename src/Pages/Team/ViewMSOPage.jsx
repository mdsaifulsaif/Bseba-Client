import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ViewMSO = lazy(() => import("../../Components/Team/ViewMSO"));
const ViewMSOPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ViewMSO />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ViewMSOPage;
