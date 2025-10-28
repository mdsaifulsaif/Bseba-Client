import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PosSale = lazy(() => import("../../Components/Sale/PosSale"));
const PosSalePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PosSale />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PosSalePage;
