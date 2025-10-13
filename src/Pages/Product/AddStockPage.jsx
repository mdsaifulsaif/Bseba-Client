import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AddStock = lazy(() => import("../../Components/Product/AddStock"));

const AddStockPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AddStock />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AddStockPage;
