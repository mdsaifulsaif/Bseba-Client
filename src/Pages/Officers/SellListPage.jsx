import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SellList = lazy(() => import("../../Components/Officers/SellList"));

const SellListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SellList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SellListPage;
