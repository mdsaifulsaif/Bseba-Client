import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ViewSupplierLaser = lazy(() =>
  import("../../Components/Contact/ViewSupplierLaser")
);
const ViewSupplierLaserPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ViewSupplierLaser />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ViewSupplierLaserPage;
