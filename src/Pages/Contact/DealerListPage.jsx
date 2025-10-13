import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const DealerList = lazy(() => import("../../Components/Contact/DealerList"));

const DealerListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DealerList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DealerListPage;
