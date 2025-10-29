import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const A5Print = lazy(() => import("../../Components/Sale/A5Print"));
const A5PrintPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <A5Print />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default A5PrintPage;
