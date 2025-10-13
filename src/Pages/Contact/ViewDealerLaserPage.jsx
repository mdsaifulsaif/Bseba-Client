import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ViewDealerLaser = lazy(() =>
  import("../../Components/Contact/ViewDealerLaser")
);
const ViewDealerLaserPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ViewDealerLaser />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ViewDealerLaserPage;
