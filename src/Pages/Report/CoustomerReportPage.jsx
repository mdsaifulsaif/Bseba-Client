import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CoustomerReport = lazy(() =>
  import("../../Components/Report/CoustomerReport")
);
const CoustomerReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CoustomerReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CoustomerReportPage;
